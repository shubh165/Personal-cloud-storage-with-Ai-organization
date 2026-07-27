import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { deleteFromCloudinary, uploadOnCloudinary } from "../utils/cloudinary.js";
import { File } from "../models/file.model.js";

import { aiQueue } from "../queues/aiQueue.js";
import path from "path";
import axios from "axios";

/* ======================================
Upload Single File
====================================== */

const uploadFile = asyncHandler(async (req, res) => {
  const fileLocalPath = req.file?.path;

  if (!fileLocalPath) {
    throw new ApiError(400, "File is required");
  }

  const uploadedFile = await uploadOnCloudinary(fileLocalPath);

  if (!uploadedFile) {
    throw new ApiError(500, "Error uploading file");
  }

  const mime = req.file.mimetype;

  let category = "document";

  if (mime.startsWith("image/")) category = "image";
  else if (mime.startsWith("video/")) category = "video";
  else if (mime.startsWith("audio/")) category = "audio";
  else category = "document";

  const file = await File.create({
    owner: req.user._id,
    fileName: req.file.originalname,
    fileCategory: category, 
    fileUrl: uploadedFile.secure_url,
    cloudinaryPublicId: uploadedFile.public_id,
    cloudinaryResourceType: uploadedFile.resource_type,
    fileSize: uploadedFile.bytes,
    mimeType: mime,
    originalName: req.file.originalname, // ADDED ORIGINAL NAME
  });

  await aiQueue.add("process-file", {
    fileId: file._id,
    fileCategory: file.fileCategory,
    fileMimeType: file.mimeType, 
    localPath: path.resolve(fileLocalPath),
  });

  return res
    .status(201)
    .json(new ApiResponse(201, file, "File uploaded successfully"));
});

/* ======================================
Upload Multiple Files
====================================== */

const uploadMultipleFiles = asyncHandler(async (req, res) => {
  const files = req.files;

  if (!files || files.length === 0) {
    throw new ApiError(400, "Files are required");
  }

  const uploadedFiles = [];

  for (const file of files) {
    const uploaded = await uploadOnCloudinary(file.path);

    if (!uploaded) {
      throw new ApiError(500, "Error uploading file");
    }

    const savedFile = await File.create({
      owner: req.user._id,
      fileName: file.originalname,
      fileCategory: uploaded.resource_type,
      fileUrl: uploaded.secure_url,
      cloudinaryPublicId: uploaded.public_id,
      cloudinaryResourceType: uploaded.resource_type,
      fileSize: uploaded.bytes,
      mimeType: file.mimetype,
      originalName: file.originalname,
    });

    uploadedFiles.push(savedFile);

    await aiQueue.add("process-file", {
      fileId: savedFile._id,
      fileCategory: savedFile.fileCategory,
      fileMimeType: file.mimetype,
      localPath: path.resolve(file.path),
    });
  }

  return res
    .status(201)
    .json(new ApiResponse(201, uploadedFiles, "Files uploaded successfully"));
});

/* ======================================
Get Logged In User Files
====================================== */

const getUserFiles = asyncHandler(async (req, res) => {
  const files = await File.find({ owner: req.user._id, isTrashed: { $ne: true } }).sort({
    createdAt: -1,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, files, "User files fetched successfully"));
});

/* ======================================
Delete File
====================================== */

const deleteFile = async (req, res) => {
  try {
    const file = await File.findById(req.params.id);

    if (!file) {
      return res.status(404).json({ message: "File not found" });
    }

    // Owner check
    if (file.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    file.isTrashed = true;
    file.trashedAt = new Date();
    await file.save();

    return res.status(200).json({
      success: true,
      message: "File moved to trash",
    });

    let publicId = file.cloudinaryPublicId;
    let legacyPublicId = "";


    if (!publicId && file.fileUrl) {
      const uploadPath = new URL(file.fileUrl).pathname.split("/upload/")[1];
      if (uploadPath) {
        const withoutVersion = uploadPath.replace(/^v\d+\//, "");
        legacyPublicId = withoutVersion;
      }
    }

    if (!publicId && !legacyPublicId) {
      throw new ApiError(500, "Missing Cloudinary file identifier");
    }

    const resourceTypes = file.cloudinaryPublicId
      ? [file.cloudinaryResourceType]
      : ["image", "video", "raw"];
    let deleted = false;

    for (const resourceType of resourceTypes) {
      // Cloudinary raw assets (DOC/DOCX/PDF) keep their extension in the
      // public ID. Image/video public IDs do not, so each legacy type needs
      // the matching form of the delivery URL.
      const idForResource = file.cloudinaryPublicId
        ? publicId
        : resourceType === "raw"
          ? legacyPublicId
          : legacyPublicId.replace(/\.[^/.]+$/, "");
      const result = await deleteFromCloudinary(idForResource, resourceType);
      if (result.result === "ok") {
        deleted = true;
        break;
      }
    }

    // If a legacy URL did not identify an asset, do not silently discard the
    // database record; returning an error allows the user to retry safely.
    if (!deleted && !file.cloudinaryPublicId) {
      throw new ApiError(502, "Cloudinary file could not be found for deletion");
    }

    await file.deleteOne();

    res.status(200).json({
      success: true,
      message: "File deleted successfully",
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Unable to delete file",
    });
  }
};


const getTrashedFiles = asyncHandler(async (req, res) => {
  const files = await File.find({ owner: req.user._id, isTrashed: true }).sort({
    trashedAt: -1,
  });
  return res.status(200).json(new ApiResponse(200, files, "Trash files fetched successfully"));
});

const restoreFile = asyncHandler(async (req, res) => {
  const file = await File.findOne({
    _id: req.params.id,
    owner: req.user._id,
    isTrashed: true,
  });
  if (!file) throw new ApiError(404, "Trashed file not found");

  file.isTrashed = false;
  file.trashedAt = null;
  await file.save();
  return res.status(200).json(new ApiResponse(200, file, "File restored"));
});

const emptyTrash = asyncHandler(async (req, res) => {
  const files = await File.find({ owner: req.user._id, isTrashed: true });

  for (const file of files) {
    let publicId = file.cloudinaryPublicId;
    let legacyPublicId = "";

    if (!publicId && file.fileUrl) {
      const uploadPath = new URL(file.fileUrl).pathname.split("/upload/")[1];
      if (uploadPath) legacyPublicId = uploadPath.replace(/^v\d+\//, "");
    }

    if (!publicId && !legacyPublicId) {
      throw new ApiError(500, "A trashed file is missing its Cloudinary identifier");
    }

    const resourceTypes = file.cloudinaryPublicId
      ? [file.cloudinaryResourceType]
      : ["image", "video", "raw"];
    let deleted = false;

    for (const resourceType of resourceTypes) {
      const idForResource = file.cloudinaryPublicId
        ? publicId
        : resourceType === "raw"
          ? legacyPublicId
          : legacyPublicId.replace(/\.[^/.]+$/, "");
      const result = await deleteFromCloudinary(idForResource, resourceType);
      if (result.result === "ok") {
        deleted = true;
        break;
      }
    }

    if (!deleted && !file.cloudinaryPublicId) {
      throw new ApiError(502, "Cloudinary file could not be found for deletion");
    }

    await file.deleteOne();
  }

  return res.status(200).json(new ApiResponse(200, null, "Trash permanently deleted"));
});

// /* ======================================
// Search Files
// ====================================== */
 const searchFiles = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res
        .status(400)
        .json(new ApiResponse(400, [], "Query is required"));
    }

    const files = await File.find({
      owner: req.user._id,
      isTrashed: { $ne: true },
      $or: [
        { originalName: { $regex: query, $options: "i" } }, 
        { aiTags: { $regex: query, $options: "i" } },
        { aiSummary: { $regex: query, $options: "i" } },
      ],
    });

    res.json({
      success: true,
      results: files,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ======================================
Get File Details
====================================== */
const getSingleFile = async (req, res) => {
  try {
    const { id } = req.params;

    const file = await File.findOne({ _id: id, owner: req.user._id, isTrashed: { $ne: true } });

    if (!file) {
      return res.status(404).json({
        success: false,
        message: "File not found",
      });
    }

    res.status(200).json({
      success: true,
      data: file,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

/* ======================================
Download / preview a file
====================================== */
const downloadFile = asyncHandler(async (req, res) => {
  const file = await File.findOne({
    _id: req.params.id,
    owner: req.user._id,
    isTrashed: { $ne: true },
  });

  if (!file) {
    throw new ApiError(404, "File not found");
  }

  // Cloudinary is a different origin, so a browser ignores the HTML `download`
  // attribute for its URLs. Streaming through the authenticated API gives the
  // browser the correct Content-Disposition and Content-Type headers.
  const upstream = await axios.get(file.fileUrl, {
    responseType: "stream",
    validateStatus: (status) => status >= 200 && status < 300,
  });
  const fileName = (file.originalName || file.fileName || "download")
    .replace(/[\r\n"]/g, "_");
  const disposition = req.query.inline === "true" ? "inline" : "attachment";

  res.status(200);
  res.setHeader("Content-Type", file.mimeType || upstream.headers["content-type"] || "application/octet-stream");
  res.setHeader("Content-Disposition", `${disposition}; filename="${fileName}"`);

  if (upstream.headers["content-length"]) {
    res.setHeader("Content-Length", upstream.headers["content-length"]);
  }

  upstream.data.on("error", (error) => res.destroy(error));
  upstream.data.pipe(res);
});

// ======================================
// get favorite Files
// ======================================

const getFavoriteFiles = asyncHandler(async (req, res) => {
  const files = await File.find({
    owner: req.user._id,
    isFavorite: true,
    isTrashed: { $ne: true },
  }).sort({ createdAt: -1 });

  return res
    .status(200)
    .json(new ApiResponse(200, files, "Favorite files fetched successfully"));
});

const toggleFavorite = asyncHandler(async (req, res) => {
  const file = await File.findOne({
    _id: req.params.id,
    owner: req.user._id,
    isTrashed: { $ne: true },
  });

  if (!file) {
    throw new ApiError(404, "File not found");
  }

  file.isFavorite = !file.isFavorite;
  await file.save();

  return res.status(200).json(
    new ApiResponse(
      200,
      file,
      file.isFavorite ? "File added to favorites" : "File removed from favorites",
    ),
  );
});


/* ======================================
Rename File name
====================================== */

const renameFile = async (req, res) => {
  try {
    const { fileName } = req.body;

    const file = await File.findById(req.params.id);

    if (!file) {
      return res.status(404).json({ message: "File not found" });
    }

    if (file.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    file.fileName = fileName;
    await file.save();

    res.status(200).json({
      success: true,
      data: file,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};


export {
  uploadFile,
  uploadMultipleFiles,
  getUserFiles,
  getFavoriteFiles,
  toggleFavorite,
  getTrashedFiles,
  restoreFile,
  emptyTrash,
  deleteFile,
  searchFiles,
  getSingleFile,
  downloadFile,
  renameFile,
};
