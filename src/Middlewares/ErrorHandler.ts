import { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/ApiError";


export const errorHandler = (err: any, req: Request,res: Response, next: NextFunction)=>{
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  // Handle specific Mongoose errors for more user-friendly messages
  if (err.name === 'CastError') {
    const message = `Resource not found. Invalid: ${err.path}`;
    err = new ApiError(400, message);
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const message = `Duplicate ${Object.keys(err.keyValue)} entered`;
    err = new ApiError(400, message);
  }

  // Wrong JWT error
  if (err.name === 'JsonWebTokenError') {
    const message = 'JSON Web Token is invalid. Try Again!!!';
    err = new ApiError(400, message);
  }

    // JWT Expire error
  if (err.name === 'TokenExpiredError') {
    const message = 'JSON Web Token is expired. Try Again!!!';
    err = new ApiError(400, message);
  }

  const response = {
    success: false,
    message: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }), // Include stack in dev mode
  };

  return res.status(statusCode || 500).json(response);
}

