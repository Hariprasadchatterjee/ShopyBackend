import express from "express";
import { loginUser, logoutUser, registerUser, getUserProfile } from "../Controllers/user.controllers";
import { isAuthenticatedUser } from "../Middlewares/auth";

const userRouter = express.Router();

// --- Authentication Routes ---
userRouter.route("/register").post(registerUser);
userRouter.route("/login").post(loginUser);
userRouter.route("/logout").post(logoutUser);

// --- User Profile Route ---
userRouter.route('/me').get(isAuthenticatedUser, getUserProfile);


export default userRouter;
