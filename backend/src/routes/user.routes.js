import { Router } from "express";

import {
  loginUser,
  registerUser,
  logoutUser,
  refreshToken,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
  updateUserProfile,
} from "../controllers/user.controller.js";

import { avatarUpload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

/* =========================
   Public Routes
========================= */

router
  .route("/register")
  .post(avatarUpload.fields([{ name: "avtar", maxCount: 1 }]), registerUser);

router.route("/login").post(loginUser);

router.route("/refresh-token").post(refreshToken);

/* =========================
   Protected Routes
========================= */

// protected route
router.get("/me", verifyJWT, (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      fullName: req.user.fullName,
      email: req.user.email,
      avtar: req.user.avtar, // if exists
    },
  });
});

router.route("/logout").post(verifyJWT, logoutUser);

router.route("/change-password").post(verifyJWT, changeCurrentPassword);

router.route("/current-user").get(verifyJWT, getCurrentUser);

router.route("/update-account").patch(verifyJWT, updateAccountDetails);

router
  .route("/update-avatar")
  .patch(
    verifyJWT,
    avatarUpload.fields([{ name: "avtar", maxCount: 1 }]),
    updateUserProfile
  );

export default router;
