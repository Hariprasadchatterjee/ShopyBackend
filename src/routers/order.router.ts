import express from "express";
import {
  cancelMyOrder,
  createOrder,
  deleteOrder,
  getAllOrders,
  getMyOrders,
  getSingleOrderDetails,
  updateOrderStatus,
} from "../Controllers/order.controllers";
import { authorizeRole, isAuthenticatedUser } from "../Middlewares/auth";

const orderRouter = express.Router();

orderRouter.route("/me").get(isAuthenticatedUser, getMyOrders);

orderRouter.route("/:id").get(isAuthenticatedUser, getSingleOrderDetails);

orderRouter.route("/:id/cancel").put(isAuthenticatedUser, cancelMyOrder);

orderRouter
  .route("/admin/new")
  .post(isAuthenticatedUser, authorizeRole("admin"), createOrder);

orderRouter
  .route("/admin/orders")
  .get(isAuthenticatedUser, authorizeRole("admin"), getAllOrders);

orderRouter
  .route("/admin/order/:id")
  .put(isAuthenticatedUser, authorizeRole("admin"), updateOrderStatus)
  .delete(isAuthenticatedUser, authorizeRole("admin"), deleteOrder);

export default orderRouter;
