import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import jwt from "jsonwebtoken";

export const verifyJWT = asyncHandler(async (req, res, next) => {
  const token =
    req.cookies?.accessToken || req.headers.authorization?.split(" ")[1];

  if (!token) {
    throw new ApiError(401, "Unauthorized: No token provided");
  }

  let decodedToken;

  try {
    decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
  } catch (error) {
    // TokenExpiredError must be a 401 so the frontend interceptor can use the
    // valid refresh-token cookie to obtain a new access token and retry once.
    throw new ApiError(401, "Unauthorized: Access token expired or invalid");
  }

  const user = await User.findById(decodedToken._id).select(
    "-password -refreshToken"
  );

  if (!user) {
    throw new ApiError(401, "Unauthorized: User not found");
  }

  req.user = user;

  next();
});
