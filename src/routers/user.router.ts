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
  changeUserPassword,
  AddUserAvatar,
  updateUserIdentity,
} from "../Controllers/user.controllers";
import { authorizeRole, isAuthenticatedUser } from "../Middlewares/auth";
import { upload } from "../Middlewares/multer.middleware";

const userRouter = express.Router();

// --- Authentication Routes ---
// --- Public Routes ---
userRouter.route("/register").post(registerUser);
userRouter.route("/login").post(loginUser);
userRouter.route("/logout").get(logoutUser);
userRouter.route("/forgot_password").post(forgotPassword);
userRouter.route("/reset_password/:token").put(resetPassword);

// --- Authenticated User Routes ---
// 1.> --- User Profile Route ---
userRouter.route("/me").get(isAuthenticatedUser, getUserProfile);
userRouter.route("/me/changePassword").get(isAuthenticatedUser, changeUserPassword);
userRouter.route("/me/avatar").get(isAuthenticatedUser, upload.single("avatar"), AddUserAvatar);
userRouter.route("/me/updateIdentity").get(isAuthenticatedUser, updateUserIdentity);

// 2.> --- Admin Only Routes ---
userRouter
  .route("/admin/users")
  .get(isAuthenticatedUser, authorizeRole("admin"), getAllUsers);

userRouter
  .route("/admin/user/:id")
  .get(isAuthenticatedUser, authorizeRole("admin"), getSingleUser)
  .put(isAuthenticatedUser, authorizeRole("admin"), updateUserRole)
  .delete(isAuthenticatedUser, authorizeRole("admin"), deleteUser);

export default userRouter;
