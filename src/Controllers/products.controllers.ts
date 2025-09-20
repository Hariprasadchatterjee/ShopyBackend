import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import product from "../Models/Product.model";
import { ApiFilters } from "../utils/Filtering";

// 1. Get All Products (with filtering, search, pagination)
export const getAllProducts = asyncHandler(async (req: Request, res: Response)=>{
    const productPerPage = 10;
    const productCount = await product.countDocuments();

    const query =  product.find();
    const queryStr = req.query;
    const apifeatures = new ApiFilters(query, queryStr);

    apifeatures.search().filter().sort().paginate();

    const products = apifeatures.query;

    res.status(200).json({
        products,
        productCount,
        productPerPage,
    });
})
// 2. Create New Product -- ADMIN