import { Router } from "express";
import {
  getCart,
  upsertCartItem,
  removeItemFromCart,
  clearCart,
} from "../Controllers/cart.controllers";
import { isAuthenticatedUser } from "../Middlewares/auth";

const router = Router();

// All routes in this file are protected and require a logged-in user
router.use(isAuthenticatedUser);

router.route("/")
  .get(getCart)
  .delete(clearCart);

router.route("/item")
  .post(upsertCartItem);

router.route("/item/:productId")
  .delete(removeItemFromCart);

export default router;