import express from "express"
import { createProducts, getAllProducts } from "../Controllers/products.controllers";
import { authorizeRole, isAuthenticatedUser } from "../Middlewares/auth";

const productRouter = express.Router();

productRouter.route("/get-products").get(getAllProducts)

// Admin Routers
productRouter.route("/create-products").post(isAuthenticatedUser,authorizeRole("admin"), createProducts)

export default productRouter