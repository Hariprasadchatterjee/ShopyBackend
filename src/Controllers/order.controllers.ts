import { Request, Response } from "express";
import Order from "../Models/Order.model";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import Product from "../Models/Product.model";
import Coupon from "../Models/coupon.model";
// ---------------------------------------------------------------- //
// ----------------------- USER CONTROLLERS ----------------------- //
// ---------------------------------------------------------------- //

const updateStock = async (
  productId: string,
  quantity: number,
  isCreated: boolean
): Promise<void> => {
  const product = await Product.findById(productId);
  if (!product) {
    throw new ApiError(
      404,
      `Product with ID ${productId} not found during stock update.`
    );
  }
  if (isCreated) {
    product.stock -= quantity;
  } else {
    product.stock += quantity;
  }
};

/**
 * @desc    Create a new order
 * @route   POST /api/v1/order/new
 * @access  Private (Authenticated Users)
 */
export const createOrder = asyncHandler(async (req: Request, res: Response) => {
  const {
    shippingInfo,
    orderItems,
    paymentInfo,
    // itemsPrice,
    taxPrice,
    shippingPrice,
    // totalPrice,
    couponCode,
  } = req.body;

  if (!orderItems || orderItems.length === 0) {
    throw new ApiError(400, "Your cart is empty.");
  }
  interface OrderItem {
    product: string;
    quantity: number;
    price: number;
  }

  const itemsPrice = orderItems.reduce(
    (acc: number, item: OrderItem) => acc + item.quantity * item.price,
    0
  );

   let couponId = null;
   let finalAmmount = 0

  //--- Start Re-Validation for coupon ----
  if (couponCode) {
    
    const coupon = await Coupon.findOne({code:couponCode});
    if(!coupon) throw new ApiError(400, "Your coupon is invalid");
    if (itemsPrice < coupon?.minCartValue) {
      throw new ApiError(400, "Your are not eligible to apply coupon");
    }
    if (coupon.expiryDate < new Date(Date.now())) throw new ApiError(400, "Your coupon is expired no longer used");
     // If all checks pass, calculate the discount on the backend
      let discountAmmount = 0;
      if (coupon.discountType === "percentage") {
        discountAmmount = (itemsPrice * coupon.discountValue) / 100;
      }
      else{
        discountAmmount = coupon.discountValue
      }
       finalAmmount = (itemsPrice - discountAmmount) + taxPrice + shippingPrice
       couponId = coupon._id
  } else {
    finalAmmount = itemsPrice  + taxPrice + shippingPrice
  }
    

  const order = await Order.create({
    shippingInfo,
    orderItems,
    paymentInfo,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice :finalAmmount,
    couponApplied:couponId,
    paidAt: Date.now(),
    user: req.user?._id,
  });

  // Critical Step: Update the stock for each product in the order
  for (const item of order.orderItems) {
    await updateStock(item.product.toString(), item.quantity, true);
  }

  res.status(201).json({ order, message: "Order placed successfully" });
});

/**
 * @desc    Get logged in user's orders
 * @route   GET /api/v1/order/me
 * @access  Private (Authenticated Users)
 */

export const getMyOrders = asyncHandler(async (req: Request, res: Response) => {
  const orders = await Order.find({ user: req.user?._id });
  if (!orders) {
    throw new ApiError(400, "User Id invalid.");
  }
  res.status(200).json({ orders });
});

/**
 * @desc    Get single order details
 * @route   GET /api/v1/order/:id
 * @access  Private (User who owns order, or Admin)
 */
export const getSingleOrderDetails = asyncHandler(
  async (req: Request, res: Response) => {
    const order = await Order.findById(req.params.id).populate(
      "user",
      "name email"
    );
    if (!order) {
      throw new ApiError(400, "orderId is invalid.");
    }
    res.status(200).json({ order });
  }
);

/**
 * @desc    Cancel an order
 * @route   PUT /api/v1/order/:id/cancel
 * @access  Private (User who owns order)
 */
export const cancelMyOrder = asyncHandler(
  async (req: Request, res: Response) => {
    const order = await Order.findById(req.params.id);
    if (!order) {
      throw new ApiError(400, "orderId is invalid.");
    }

    if (order.user.toString() !== req.user?.id) {
      throw new ApiError(400, "you are not eligible to cancel this order");
    }

    if (order.orderStatus !== "Processing") {
      throw new ApiError(
        400,
        `Order cannot be cancelled. It is already in the '${order.orderStatus}' state.`
      );
    }

    // 4. Update the order status to "Cancelled"
    order.orderStatus = "Cancelled";
    for (const item of order.orderItems) {
      await updateStock(item.product.toString(), item.quantity, false);
    }
    await order.save({ validateBeforeSave: true });
    res.status(200).json({ order, message:"Your order has been cancelled." });
  }
);

// ---------------------------------------------------------------- //
// ----------------------- ADMIN CONTROLLERS ---------------------- //
// ---------------------------------------------------------------- //

/**
 * @desc    Get all orders
 * @route   GET /api/v1/order/admin/orders
 * @access  Private (Admin)
 */
export const getAllOrders = asyncHandler(
  async (req: Request, res: Response) => {
    const orders = await Order.find().populate("user", "name email");

    // Optional: Calculate total amount for all orders for a dashboard
    let totalAmount = 0;
    orders.forEach((order) => {
      totalAmount += order.totalPrice;
    });
    res.status(200).json({ orders, totalAmount });
  }
);

/**
 * @desc    Update order status
 * @route   PUT /api/v1/order/admin/order/:id
 * @access  Private (Admin)
 */
export const updateOrderStatus = asyncHandler(
  async (req: Request, res: Response) => {
    const order = await Order.findById(req.params.id);
    if (!order) {
      throw new ApiError(400, "orderId is invalid.");
    }

    if (order.orderStatus === "Delivered") {
      throw new ApiError(400, "order has already been delivered");
    }

    order.orderStatus = req.body.status;
    if (req.body.status === "Delivered") {
      order.deliveredAt = new Date(Date.now());
    }

    await order.save({ validateBeforeSave: true });

    res
      .status(200)
      .json({ order, mesage: "order status updated successfully" });
  }
);

/**
 * @desc    Delete an order
 * @route   DELETE /api/v1/order/admin/order/:id
 * @access  Private (Admin)
 */
export const deleteOrder = asyncHandler(async (req: Request, res: Response) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    throw new ApiError(404, "Order not found with this ID.");
  }

  // Important: You might want to add stock back when an order is deleted.
  // This depends on business logic (e.g., if it was a fraudulent order).
  // For this example, we will not restore stock.
  for (const item of order.orderItems) {
    await updateStock(item.product.toString(), item.quantity, false);
  }

  await order.deleteOne();
  res.status(200).json({ order, mesage: "Order deleted successfully." });
});
