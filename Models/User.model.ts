import mongoose, {  Model, Schema } from "mongoose";
import validator from "validator"

export interface IAddress extends Document{
  street:string;
  city:string;
  state:string;
  pinCode:string;
  country:string;
}
export interface IUserSchema extends Document{
  name:string;
  email: string;
  password: string;
  avatar?: {public_id: string, url:string};
  role: 'user' | 'admin';
  addresses: IAddress[];
  orders: mongoose.Schema.Types.ObjectId;
  wishlist: mongoose.Schema.Types.ObjectId;
  resetPasswordToken: string;
  resetPasswordExpire: string
}

const addressSchema = new Schema<IAddress>({
  street: {type: String, required: true},
  city: {type: String, required: true},
  state: {type: String, required: true},
  pinCode: {type: String, required: true},
  country: {type: String, required: true, default: "India"}
})

const userSchema = new Schema<IUserSchema>(
  {
    name:{
      type: String,
      required: [true, "please enter your name"],
      maxLength: [50, "Your name cannot exceed 50 characters"]
    },
    email: {
      type: String,
      required: [true, 'Please enter your email'],
      unique: true,
      validate: [validator.isEmail, 'please enter a valid email address']
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
      enum: ['user', 'admin'],
      default: 'user',
    },
    addresses: [addressSchema],
    orders: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
    }],
    wishlist: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
    }],
    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  {timestamps: true}
);

const myUser: Model<IUserSchema> = mongoose.model<IUserSchema>("User",userSchema);
export default myUser;