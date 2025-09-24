import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import Cart, { ICart, ICartItem } from "../Models/Cart.model";
import { ApiError } from "../utils/ApiError";
import Product, { IProduct } from "../Models/Product.model";

/**
 * @desc    Get the current user's cart
 * @route   GET /api/v1/cart
 * @access  Private (Authenticated Users)
 */
export const getCart = asyncHandler(async (req: Request, res: Response) => {
  let cart = await Cart.findOne({ user: req.user?.id }).populate({
    path: "items.product",
    select: "name price image stock",
  });
  if (!cart) {
    cart = await Cart.create({ user: req.user?.id });
  }
  res.status(200).json({ cart, message: "Cart fetched successfully" });
});

/**
 * @desc    Add or update an item in the cart
 * @route   POST /api/v1/cart/item
 * @access  Private (Authenticated Users)
 */
export const upsertCartItem = asyncHandler(
  async (req: Request, res: Response) => {
    const { productId, quantity } = req.body;

    const product = await Product.findById(productId);
    if (!product) throw new ApiError(404, "Product not found.");

    const cart = (await Cart.findOne({ user: req.user?.id })) as ICart | null;
    if (!cart) {
      throw new ApiError(404, "Cart not found.");
    }

    const existingItemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId
    );

    if (existingItemIndex > -1) {
      // Item already exists, update quantity
      cart.items[existingItemIndex].quantity = quantity;
    } else {
      // Item does not exist, add it to the cart
      cart.items.push({ product: product._id, quantity });
    }

    await cart.populate("items.product", "price");
    cart.subtotal = cart.items.reduce((accu, item) => {
      const itemPrice = (item.product as any)?.price || 0;
      return accu + itemPrice * item.quantity;
    }, 0);
    await cart.save();
    res.status(200).json({ cart, message: "Cart updated successfully" });
  }
);

/**
 * @desc    Remove an item from the cart
 * @route   DELETE /api/v1/cart/item/:productId
 * @access  Private (Authenticated Users)
 */
export const removeItemFromCart = asyncHandler(
  async (req: Request, res: Response) => {
    const { productId } = req.params;
    const product = await Product.findById(productId);
    if (!product) throw new ApiError(404, "Product not found.");

    const cart = (await Cart.findOne({ user: req.user?.id })) as ICart | null;
    if (!cart) {
      throw new ApiError(404, "Cart not found.");
    }

    cart.items = cart?.items.filter((item) => item.product.toString() !== productId.toString());

    await cart.populate("items.product", "price");
    cart.subtotal = cart.items.reduce((accu, item) => {
      const itemPrice = (item.product as any)?.price || 0;
      return accu + itemPrice * item.quantity;
    }, 0);

    await cart.save();

    res.status(200).json({ cart, message: "Item removed from cart successfully" });
  }
);

/**
 * @desc    Clear all items from the cart
 * @route   DELETE /api/v1/cart
 * @access  Private (Authenticated Users)
 */
export const clearCart = asyncHandler(async (req: Request, res: Response) => {
    const cart = await Cart.findOne({ user: req.user?._id });
    if (!cart) throw new ApiError(404, "Cart not found.");
    
    cart.items = [];
    cart.subtotal = 0;
    
    await cart.save();
    
    res.status(200).json({ cart, message: "Cart cleared successfully" });
});
