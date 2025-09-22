import express from "express"
import { createProductReview, createProducts, deleteProduct, deleteReview, getAllProducts, getProductDetails, getProductReviews, updateProduct } from "../Controllers/products.controllers";
import { authorizeRole, isAuthenticatedUser } from "../Middlewares/auth";
import { upload } from "../Middlewares/multer.middleware";

const productRouter = express.Router();

// --- Public Product Routes ---
productRouter.route("/get-products").get(getAllProducts)
productRouter.route("/get-products/:id").get(getProductDetails)

// --- Review Routes ---
productRouter.route("/review").put(isAuthenticatedUser, createProductReview);
productRouter.route("/reviews")
    .get(getProductReviews)
    .delete(isAuthenticatedUser, deleteReview); // Note: authorizeRoles('admin') could also be added here

// --- Admin-Only Product Routes ---
productRouter.route("/create-products").post(isAuthenticatedUser,authorizeRole("admin"),upload.array("images",5), createProducts)

productRouter.route("/admin/product/:id")
    .put(isAuthenticatedUser, authorizeRole("admin"), updateProduct)
    .delete(isAuthenticatedUser, authorizeRole("admin"), deleteProduct);

export default productRouter