
import mongoose, { Document, Model, Schema } from "mongoose";

export interface ICoupon extends Document {
  code: string;
  discountType: "percentage" | "flat";
  discountValue: number;
  minCartValue: number;
  expiryDate: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const couponSchema = new Schema<ICoupon>(
  {
    code: {
      type: String,
      required: [true, "Coupon code is required."],
      unique: true,
      uppercase: true, // Standardize codes to uppercase
      trim: true,
    },
    discountType: {
      type: String,
      enum: ["percentage", "flat"],
      required: [true, "Discount type is required."],
    },
    discountValue: {
      type: Number,
      required: [true, "Discount value is required."],
      min: [0, "Discount value cannot be negative."],
    },
    minCartValue: {
      type: Number,
      default: 0,
    },
    expiryDate: {
      type: Date,
      required: [true, "Expiry date is required."],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const Coupon: Model<ICoupon> = mongoose.model<ICoupon>("Coupon", couponSchema);
export default Coupon;