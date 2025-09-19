
import mongoose, { Document, Model, Schema } from "mongoose";
import jwt from "jsonwebtoken";
import { config } from "../config/config";
import bcrypt from "bcryptjs";
import validator from "validator";
import crypto from "crypto";


export interface IAddress extends Document {
  street: string;
  city: string;
  state: string;
  pinCode: string;
  country: string;
}
export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  password: string;
  avatar?: { public_id: string; url: string };
  role: "user" | "admin";
  addresses: IAddress[];
  orders: mongoose.Schema.Types.ObjectId[];
  wishlist: mongoose.Schema.Types.ObjectId[];
  resetPasswordToken?: string;
  resetPasswordExpire?: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(enteredPassword: string): Promise<boolean>;
  getJwtToken(): string
  getResetPasswordToken(): string;
}

const addressSchema = new Schema<IAddress>({
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  pinCode: { type: String, required: true },
  country: { type: String, required: true, default: "India" },
});

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, "please enter your name"],
      maxLength: [50, "Your name cannot exceed 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Please enter your email"],
      unique: true,
      validate: [validator.isEmail, "please enter a valid email address"],
    },
    password: {
      type: String,
      required: [true, "Please enter your password"],
      minlength: [6, "Your password must be longer than 6 characters"],
      select: false,
    },
    avatar: {
      public_id: { type: String },
      url: { type: String },
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    addresses: [addressSchema],
    orders: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order",
      },
    ],
    wishlist: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  { timestamps: true }
);

// --- Middleware & Methods ---

// 1. Hash password before saving
userSchema.pre<IUser>("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  this.password = await bcrypt.hash(this.password, 10);
});

// 2. Method to compare entered password with hashed password
userSchema.methods.comparePassword = async function (
  enteredPassword: string
): Promise<boolean> {
  return await bcrypt.compare(enteredPassword, this.password);
};

// 3. Method to generate a JWT for authentication
userSchema.methods.getJwtToken = function ():string  {
  try {
    const payload = {
    id: this._id.toString(),
  }; 
 
 const options = {
    expiresIn: (config.jwt_expiresIn || "7d") as jwt.SignOptions['expiresIn']
  };

  return jwt.sign(
    payload,
    config.jwt_secret,
    options
  );
  } catch (error) {
     console.error('Error generating auth token:', error);
    throw new Error('Failed to generate authentication token');
  }
   
    
};
// 4. Method to generate a password reset token
userSchema.methods.getResetPasswordToken = function (): string {
  // Hash and set Reset password Token field
  const resetToken = crypto.randomBytes(20).toString("hex");
  this.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
  this.resetPasswordExpire = Date.now() + 15 * 60 * 1000;

  return resetToken;
}



const myUser: Model<IUser> = mongoose.model<IUser>("User", userSchema);
export default myUser;
