import { Request, Response } from "express";


interface CustomError extends Error {
  statusCode?: number;
}

export const errorMiddleware = (
  err: CustomError,
  req: Request,
  res: Response,
) => {
  err.statusCode = err.statusCode || 500;
  err.message = err.message || "Internal server Error";

  res.status(err.statusCode).json({
    success: false,
    error: err.message,
  });
};