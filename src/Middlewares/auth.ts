import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandler";
import { config } from "../config/config";
import myUser, { IUser } from "../Models/User.model";
import { ApiError } from "../utils/ApiError";

// Extend Express Request interface to include 'user'
// eslint-disable-next-line @typescript-eslint/no-namespace
declare global {
  namespace Express {
    interface Request {
      user?: IUser; // Add your custom property
    }
  }
}

export const isAuthenticatedUser = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    // 1. Get token from either cookies or Authorization header
    const token = req.cookies?.token || req.header("Authorization")?.replace("Bearer ", "");
    
    if (!token) {
        throw new ApiError(401, "Login first to access this resource.");
    }
    console.log("token is", token);
    

    // jwt.verify will throw an error if the token is invalid or expired,
    // which asyncHandler will catch and pass to your global errorHandler.
    const decoded = jwt.verify(token, config.jwt_secret) as jwt.JwtPayload;
    console.log("after verify token is", decoded);
    // Find the user based on the ID from the token
    const user = await myUser.findById(decoded.id);
    console.log("user is",user);
    
    if (!user) {
        throw new ApiError(401, "Invalid token: user not found.");
    }
    
    // Attach the user object to the request
    req.user = user;
    next();
});

// Authorizing user roles
export const authorizeRole = (...roles: string[]) =>{
  return (req: any, res: Response, next: NextFunction) =>{
     if (!roles.includes(req.user.role)) {
        throw new ApiError(403, `Role (${req.user.role}) is not allowed to access this resource.`)
    }
    next();
  }
}