import mongoose, {Document, Model, Schema } from "mongoose";

export interface IItems extends Document{
  name: string;
  quantity: number;
  price: number;
  image: string;
  product: mongoose.Types.ObjectId;
}
export interface IOrder extends Document{
  shippingInfo: {
    address: string;
    city: string;
    state: string;
    country: string;
    pinCode: string;
    phoneNo: string;
  };
  orderItems: IItems[];
  user: mongoose.Types.ObjectId;
  paymentInfo: {
    id: string;
    status: string;
  };
  paidAt?: Date;
  itemsPrice: number;
  couponApplied:mongoose.Types.ObjectId;
  taxPrice: number;
  shippingPrice: number;
  totalPrice: number;
  orderStatus: "Processing" | "Shipped" | "Delivered" | "Cancelled";
  deliveredAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
const orderItemSchema = new Schema<IItems>({
  name: { type: String, required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
  image: { type: String, required: true },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
});

const orderSchema = new Schema<IOrder>(
  {
    shippingInfo: {
      address: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      country: { type: String, required: true, default: "India" },
      pinCode: { type: String, required: true },
      phoneNo: { type: String, required: true },
    },
    orderItems: [orderItemSchema],
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    paymentInfo: {
      id: { type: String, required: true }, // e.g., from Stripe or Razorpay
      status: { type: String, required: true },
    },
    paidAt: {
      type: Date,
    },
    itemsPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },
    taxPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },
    shippingPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },
    couponApplied: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Coupon'
    },
    totalPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },
    orderStatus: {
      type: String,
      required: true,
      enum: ["Processing", "Shipped", "Delivered", "Cancelled"],
      default: "Processing",
    },
    deliveredAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

const Order: Model<IOrder> = mongoose.model<IOrder>("Order", orderSchema);
export default Order;
