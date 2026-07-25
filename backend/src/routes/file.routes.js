import { Router } from "express";

import {
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
} from "../controllers/file.controller.js";

import { verifyJWT } from "../middlewares/auth.middleware.js";
import { fileUpload } from "../middlewares/multer.middleware.js";

const router = Router();

/* =============================
Protected Routes
============================= */

router.route("/upload").post(verifyJWT, fileUpload.single("file"), uploadFile);

router
  .route("/upload-multiple")
  .post(verifyJWT, fileUpload.array("files", 10), uploadMultipleFiles);

router.route("/").get(verifyJWT, getUserFiles);

router.route("/search").get(verifyJWT, searchFiles);

router.get("/starred", verifyJWT, getFavoriteFiles);

router.get("/trash", verifyJWT, getTrashedFiles);

router.delete("/trash", verifyJWT, emptyTrash);

router.get("/:id/download", verifyJWT, downloadFile);

router.patch("/:id/favorite", verifyJWT, toggleFavorite);

router.patch("/:id/restore", verifyJWT, restoreFile);

router.get("/:id", verifyJWT, getSingleFile);

router.delete("/:id", verifyJWT, deleteFile);

router.patch("/:id", verifyJWT, renameFile);

export default router;




