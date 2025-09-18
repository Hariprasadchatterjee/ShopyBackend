import mongoose from "mongoose";
import { config } from "./config";


export const connectDB = async () => {
  try {
    mongoose.connection.on("connected", () => {
      console.log("Database connected Successfully");
    });
    mongoose.connection.on("error", () => {
      console.log("Error in connecting to database ");
    });
    await mongoose.connect(config.mongo_url);
  } catch (error) {
    console.error("failed to connect to database", error);
    process.exit(1);
  }
};
