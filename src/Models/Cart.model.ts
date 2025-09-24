import mongoose, { Document, Model, Schema } from "mongoose";

export interface ICartItem {
  product: mongoose.Schema.Types.ObjectId;
  quantity: number;
}
export interface ICart extends Document {
  user: mongoose.Schema.Types.ObjectId;
  items: ICartItem[];
  subtotal: number;
  createdAt: Date;
  updatedAt: Date;
}

const cartItemSchema = new Schema<ICartItem>({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    default: 1,
  },
});

const cartSchema = new Schema<ICart>(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // Each user can only have one cart
    },
    items: [cartItemSchema],
    subtotal: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const Cart: Model<ICart> = mongoose.model<ICart>("Cart", cartSchema);
export default Cart;
