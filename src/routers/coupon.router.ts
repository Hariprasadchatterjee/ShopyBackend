import { Router } from "express";
import {
  createCoupon,
  getAllCoupons,
  deleteCoupon,
  applyCoupon,
} from "../Controllers/coupon.controllers";
import { isAuthenticatedUser, authorizeRole } from "../Middlewares/auth";

const router = Router();

// --- User Route ---
router.route("/apply").post(isAuthenticatedUser, applyCoupon);


// --- Admin Routes ---
router.route("/admin/new").post(isAuthenticatedUser, authorizeRole("admin"), createCoupon);
router.route("/admin/all").get(isAuthenticatedUser, authorizeRole("admin"), getAllCoupons);
router.route("/admin/:id").delete(isAuthenticatedUser, authorizeRole("admin"), deleteCoupon);


export default router;