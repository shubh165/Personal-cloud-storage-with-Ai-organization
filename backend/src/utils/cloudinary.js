import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});


const uploadOnCloudinary = async (localFilePath) => {

  try {
    if(!localFilePath) {
      throw new Error("No file path provided for upload");
    }
    const result = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto" // auto-detects the file type (image, video, etc.)
    });
    // file is uploaded, now we can remove it from local storage
    console.log("File uploaded to Cloudinary:", result.secure_url);

    // fs.unlinkSync(localFilePath);  
    return result;
  } catch (error) {
    // fs.unlinkSync(localFilePath); // Ensure local file is removed even if upload fails
    console.error("Error uploading to Cloudinary:", error);
    throw error;
  }
};

const deleteFromCloudinary = async (publicId, resourceType = "raw") => {
  if (!publicId) {
    throw new Error("Cloudinary public ID is required");
  }

  const result = await cloudinary.uploader.destroy(publicId, {
    resource_type: resourceType,
    invalidate: true,
  });

  // "not found" is safe to treat as deleted: the database record should not
  // remain only because the remote file had already been removed.
  if (!["ok", "not found"].includes(result.result)) {
    throw new Error("Cloudinary could not delete the file");
  }

  return result;
};

export { uploadOnCloudinary, deleteFromCloudinary };

