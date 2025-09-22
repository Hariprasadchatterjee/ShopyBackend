import { Request } from "express";
import multer, { FileFilterCallback } from "multer";
// Use Express.Multer.File for file typing
type MulterFile = Express.Multer.File;
import path from "path";

const storage = multer.memoryStorage();

const fileFilter = (req: Request, file: MulterFile, cb: FileFilterCallback) => {
  console.log("file is", file);
  
  const fileTypes = /jpeg|jpg|png/; 
  const extName = path.extname(file.originalname).toLowerCase();
  const isValidExtion = fileTypes.test(extName);
  console.log("file mimetype", file.mimetype);
  // const mimetype = fileTypes.test(file.mimetype)
   const isImageMimetype = file.mimetype.startsWith('image/');
  
  if (isImageMimetype && isValidExtion) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!')); // Reject non-images
  }
};


// Set file size limit (e.g., 5MB)
const limits = {
  fileSize: 5 * 1024 * 1024, // 5 MB
};

export const upload = multer({
  storage,
  fileFilter,
  limits
})