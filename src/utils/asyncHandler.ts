import { NextFunction, Request, Response } from "express";

export const asyncHandler = (requestedUser: (req: Request, res: Response, next: NextFunction)=> Promise<any>)=> {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(requestedUser(req, res, next)).catch((err) => next(err));
  };
}