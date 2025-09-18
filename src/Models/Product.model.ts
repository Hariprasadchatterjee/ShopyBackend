
import mongoose, {Document, Model, Schema } from "mongoose";

export interface IReviews extends Document{
  user: mongoose.Schema.Types.ObjectId;
  name: string;
  rating: number;
  comment: string;
}
export interface IImage extends Document{
  public_id: string;
  url: string;
}
// Main Interface for the Product Documents
export interface IProduct extends Document {
  name: string;
  slug: string;
  description: string;
  price: number;
  ratings: number;
  images: IImage[];
  category: string;
  stock: number;
  numOfReviews: number;
  reviews: IReviews[];
  user: mongoose.Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const reviewSchema = new Schema<IReviews>({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  name: {
    type: String,
    required: true
  },
  rating: {
    type: Number,
      default: 0,
  },
  comment: {
    type: String,
    required: true,
  },
});

const imageSchema = new Schema<IImage>({
  public_id:{
    type: String,
    required: true,
  },
  url: {
    type: String,
    required: true,
  }
});

const productSchema = new Schema<IProduct>(
  {
    name:{
      type: String,
      required: [true, 'please Enter product name'],
      trim: true,
      maxLength: [100, 'product name can\'t exceed 100 charecters']
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      index: true, // Add index for faster queries by slug
    },
    description:{
      type: String,
      required: [true,"Please enter product description"],
    },
    price: {
      type: Number,
      required: [true, 'Please enter product price'],
      default: 0.0,
    },
    ratings:{
      type: Number,
      default: 0,
    },
    images: [imageSchema], // Array of image sub-documents
    category: {
      type: String,
      required: [true, 'Please select a category for this product'],
      enum:{
        values:[
          'Electronics',
          'Cameras',
          'Laptops',
          'Accessories',
          'Headphones',
          'Food',
          'Books',
          'Clothes/Shoes',
          'Beauty/Health',
          'Sports',
          'Outdoor',
          'Home',
        ],
        message: "Please select a correct category for the product"
      },
    },
    stock: {
      type: Number,
      required: [true, 'Please enter product stock'],
      default: 0,
    },
    numOfReviews:{
      type: Number,
      default: 0,
    },
    reviews: [reviewSchema], // Array of review sub-documents
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    }
  },
  {
    timestamps: true
  }
);

const product: Model<IProduct> = mongoose.model<IProduct>('Product', productSchema)
export default product