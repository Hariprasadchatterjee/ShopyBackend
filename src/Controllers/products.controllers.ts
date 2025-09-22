import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import Product, { IReviews } from "../Models/Product.model";
import { ApiFilters } from "../utils/Filtering";
import slugify from "slugify";
import { ApiError } from "../utils/ApiError";
import DataURIParser from "datauri/parser";
import path from "path";
import cloudinary from "../config/cloudinary";
import mongoose from "mongoose";

// 1. Get All Products (with filtering, search, pagination)
export const getAllProducts = asyncHandler(
  async (req: Request, res: Response) => {
    const productPerPage = 10;
    const productCount = await Product.countDocuments();
    console.log(
      "product count and product per page",
      productCount,
      productPerPage
    );

    const query = Product.find();
    const queryStr = req.query;
    const apifeatures = new ApiFilters(query, queryStr);

    apifeatures.search().filter().sort().paginate();

    const products = await apifeatures.query;
    if (!products) {
      throw new ApiError(404, "Product not found");
    }

    res.status(200).json({
      products,
      productCount,
      productPerPage,
    });
  }
);

// 2. Create New Product -- ADMIN

export const createProducts = asyncHandler(
  async (req: Request, res: Response) => {
    console.log("products Body", req.body);
    console.log("products file", req.file);
    // 1. Check if files were uploaded
    if (!req.files || (req.files as Express.Multer.File[]).length == 0) {
      throw new ApiError(400, "Product images are required.");
    }

    // 2. Prepare to upload images to Cloudinary in parallel
    const files = req.files as Express.Multer.File[];
    // Define a minimal image type for upload results
    type UploadedImage = { public_id: string; url: string };
    const imageData: UploadedImage[] = [];

    // Using a for...of loop for clarity and proper await behavior
    for (const file of files) {
      // Convert buffer to Data URI
      const parser = new DataURIParser();
      const extName = path.extname(file.originalname).toString();
      const fileDataUri = parser.format(extName, file.buffer);

      if (!fileDataUri.content) {
        throw new ApiError(500, "Could not process an image file buffer.");
      }

      // Upload to Cloudinary (await the promise)
      const result = await cloudinary.uploader.upload(fileDataUri.content, {
        folder: "products",
        resource_type: "image",
      });

      imageData.push({
        public_id: result.public_id,
        url: result.secure_url,
      });
    }

    // 3. Add uploaded image data to the request body
    req.body.images = imageData;

    // The logged-in user's ID will be assigned to the product
    req.body.user = req.user?._id;

    //Generate Slug from the name
    if (req.body.name) {
      req.body.slug = slugify(req.body.name, { lower: true, strict: true });
    }

    const product = await Product.create(req.body);

    res.status(201).json({
      product,
      message: "Product created successfully",
    });
  }
);

// 3. Get Single Product Details
export const getProductDetails = asyncHandler(
  async (req: Request, res: Response) => {
    const product = await Product.findById(req.params.id);

    if (!product) {
      throw new ApiError(404, "Product not found");
    }

    res.status(200).json({ ...product });
  }
);

// 4. Update Product -- ADMIN
export const updateProduct = asyncHandler(
  async (req: Request, res: Response) => {
    let product = await Product.findById(req.params.id);

    if (!product) {
      throw new ApiError(404, "Product not found");
    }

    if (req.body.name) {
      req.body.slug = slugify(req.body.name, { lower: true, strict: true });
    }

    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.status(200).json({ product, message: "Product updated successfully" });
  }
);

// 5. Delete Product -- ADMIN
export const deleteProduct = asyncHandler(
  async (req: Request, res: Response) => {
    const product = await Product.findById(req.params.id);

    if (!product) {
      throw new ApiError(404, "Product not found");
    }

    // Add logic here to delete images from a cloud service like Cloudinary
    for (const image of product.images) {
      if (image.public_id) {
        await cloudinary.uploader.destroy(image.public_id);
      }
    }

    await product.deleteOne();
    res.status(200).json({ product, message: "Product deleted successfully" });
  }
);

// --- Product Reviews ---
// 6. Create or Update a product review
export const createProductReview = asyncHandler(
  async (req: Request, res: Response) => {
    const { rating, comment, productId } = req.body;

    if (!rating || !comment || !productId) {
      throw new ApiError(400, "Rating, comment, and productId are required");
    }

    const review = {
      user: req.user?._id as mongoose.Types.ObjectId,
      name: req.user?.name as string,
      rating: Number(rating),
      comment,
    };

    const product = await Product.findById(productId);
    if (!product) {
      throw new ApiError(404, "Product not found");
    }

    const existingReview = product.reviews.find(
      (review: any) => review.user.toString() === req.user?.id
    );

    if (existingReview) {
      // Update existing review
      existingReview.rating = Number(rating);
      existingReview.comment = comment;
    } else {
      // Add new review
      const productReviews: IReviews[] = product.reviews;
      productReviews.push(review as any);
    }

    // Recalculate number of reviews and overall rating
    product.numOfReviews = product.reviews.length;
    product.ratings =
      product.reviews.reduce((acc, item) => item.rating + acc, 0) /
      product.reviews.length;
    await product.save({ validateBeforeSave: true });

    res.status(200).json({
      success: true,
      message: "Review submitted successfully",
      reviews: product.reviews,
    });
  }
);

// 7. Get All Reviews of a product
export const getProductReviews = asyncHandler(
  async (req: Request, res: Response) => {
    const product = await Product.findById(req.query.id);

    if (!product) {
      throw new ApiError(404, "Product not found");
    }

    res.status(200).json(product.reviews);
  }
);

// 8. Delete a Review
export const deleteReview = asyncHandler(
  async (req: Request, res: Response) => {
    const {productid, reviewid} = req.query;
    const product = await Product.findById(productid);
    if (!product) {
      throw new ApiError(404, "Product not found");
    }
    const updatedReviews = product.reviews.filter( (review)=>review.id.toString() !== reviewid?.toString());
    if (updatedReviews.length === product.reviews.length) {
      throw new ApiError(404, "review id not found");
    }

    product.reviews = updatedReviews;
    product.numOfReviews = product.reviews.length;

    if (product.numOfReviews > 0) {
      
      product.ratings = product.reviews.reduce( (accu,review)=>review.rating + accu,0) / product.reviews.length;
    }
    else{
      product.ratings = 0;
    }

    await product.save({validateBeforeSave: true});

    res.status(200).json({success:true, message:"review deleted successfully"})
  }
);
