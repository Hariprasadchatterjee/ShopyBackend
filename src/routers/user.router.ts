import express from "express";
import {
  loginUser,
  logoutUser,
  registerUser,
  getUserProfile,
  forgotPassword,
  resetPassword,
  getAllUsers,
  getSingleUser,
  updateUserRole,
  deleteUser,
} from "../Controllers/user.controllers";
import { authorizeRole, isAuthenticatedUser } from "../Middlewares/auth";

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
userRouter
  .route("/admin/users")
  .get(isAuthenticatedUser, authorizeRole("admin"), getAllUsers);

userRouter
  .route("/admin/user/:id")
  .get(isAuthenticatedUser, authorizeRole("admin"), getSingleUser)
  .put(isAuthenticatedUser, authorizeRole("admin"), updateUserRole)
  .delete(isAuthenticatedUser, authorizeRole("admin"), deleteUser);

export default userRouter;
