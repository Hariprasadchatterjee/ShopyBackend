import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import Product from "../Models/Product.model";
import { ApiFilters } from "../utils/Filtering";
import slugify from "slugify";
import { ApiError } from "../utils/ApiError";

// 1. Get All Products (with filtering, search, pagination)
export const getAllProducts = asyncHandler(
  async (req: Request, res: Response) => {
    const productPerPage = 10;
    const productCount = await Product.countDocuments();
    console.log("product count and product per page",productCount,productPerPage);
    

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
    console.log(req.body);
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
export const deleteProduct = asyncHandler(async (req: Request, res: Response) => {
    const product = await Product.findById(req.params.id);

    if (!product) {
        throw new ApiError(404, "Product not found");
    }

    // Add logic here to delete images from a cloud service like Cloudinary

    await product.deleteOne();
    res.status(200).json({ product, message: "Product deleted successfully" });
    
});

