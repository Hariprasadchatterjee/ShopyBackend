import express from "express";
import { loginUser, logoutUser, registerUser } from "../Controllers/user.controllers";

const userRouter = express.Router();

// --- Authentication Routes ---
userRouter.route("/register").post(registerUser);
userRouter.route("/login").post(loginUser);
userRouter.route("/logout").post(logoutUser);



export default userRouter;
