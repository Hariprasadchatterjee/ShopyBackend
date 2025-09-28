
import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import Coupon from "../Models/coupon.model";
import Cart from "../Models/Cart.model";
/**
 * @desc    Create a new coupon
 * @route   POST /api/v1/coupon/admin/new
 * @access  Private (Admin)
 */


export const createCoupon = asyncHandler(async (req: Request, res: Response) => {
  const { code, discountType, discountValue, minCartValue, expiryDate } = req.body;
  if (!code || !discountType || !discountValue || !expiryDate) {
    throw new ApiError(400, "All required fields must be provided.");
  }

  const existingCoupon = await Coupon.findOne({ code: code.toUpperCase() });
  if (existingCoupon) {
    throw new ApiError(409, "A coupon with this code already exists.");
  }

  const coupon = await Coupon.create({
    code,
    discountType,
    discountValue,
    minCartValue,
    expiryDate,
  });

  res.status(201).json({ coupon, mesage:"Coupon created successfully."});
});

/**
 * @desc    Get all coupons
 * @route   GET /api/v1/coupon/admin/all
 * @access  Private (Admin)
 */
export const getAllCoupons = asyncHandler(async (req: Request, res: Response) => {
  const coupons = await Coupon.find({});
 res.status(200).json({ coupons, mesage:"All coupons fetched."});
});

/**
 * @desc    Delete a coupon
 * @route   DELETE /api/v1/coupon/admin/:id
 * @access  Private (Admin)
 */
export const deleteCoupon = asyncHandler(async (req: Request, res: Response) => {
  const coupon = await Coupon.findById(req.params.id);
  if (!coupon) {
    throw new ApiError(404, "Coupon not found.");
  }
  await coupon.deleteOne();
 res.status(200).json({  mesage:"Coupon deleted successfully."});
});

// ---------------------------------------------------------------- //
// ------------------------ USER CONTROLLER ----------------------- //
// ---------------------------------------------------------------- //
export const applyCoupon = asyncHandler(async (req: Request, res: Response) => {
  const { couponCode } = req.body;
  if (!couponCode) {
    throw new ApiError(400, "Coupon code is required.");
  }
  // 1. Find the coupon and the user's cart
  const coupon = await Coupon.findOne({ code: couponCode.toUpperCase() });

    const cart = await Cart.findOne({ user: req.user?._id });

  if (!cart || cart.items.length === 0) {
    throw new ApiError(404, "Your cart is empty.");
  }

    // 2. Perform validation checks
  if (!coupon) throw new ApiError(404, "Invalid coupon code.");
  if (!coupon.isActive) throw new ApiError(400, "This coupon is not active.");
  if (coupon.expiryDate < new Date(Date.now())) throw new ApiError(400, "This coupon has expired.");
  if (cart.subtotal < coupon.minCartValue) {
    throw new ApiError(400, `Your cart total must be at least ₹${coupon.minCartValue} to use this coupon.`);
  }

  // 3. Calculate the discount
  let discountAmount = 0;
   if (coupon.discountType === "percentage") {
    discountAmount = (cart.subtotal * coupon.discountValue) / 100;
  } else if (coupon.discountType === "flat"){
    discountAmount = coupon.discountValue;
  }
  // Ensure the discount doesn't exceed the cart total
  discountAmount = Math.min(discountAmount, cart.subtotal);
  const totalPrice = cart.subtotal - discountAmount;

  // 4. Return the calculated values
  // Note: We don't save the discount to the cart here. It's applied
  // and saved only when the user creates an order.

  res.status(200).json( {
    subtotal: cart.subtotal,
    discount: discountAmount,
    totalPrice: totalPrice,
    couponCode: coupon.code,
    message: "Coupon applied successfully."
  });
})