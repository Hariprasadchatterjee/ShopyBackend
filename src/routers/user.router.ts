import express from "express";
import {
  loginUser,
  logoutUser,
  registerUser,
  getUserProfile,
  forgotPassword,
  resetPassword,
} from "../Controllers/user.controllers";
import { isAuthenticatedUser } from "../Middlewares/auth";

const userRouter = express.Router();

// --- Authentication Routes ---
// --- Public Routes ---
userRouter.route("/register").post(registerUser);
userRouter.route("/login").post(loginUser);
userRouter.route("/logout").get(logoutUser);
userRouter.route("/forgot_password").post(forgotPassword);
userRouter.route("/reset_password/:token").put(resetPassword);

// --- Authenticated User Routes ---
// --- User Profile Route ---
userRouter.route("/me").get(isAuthenticatedUser, getUserProfile);

// --- Admin Only Routes ---

export default userRouter;
