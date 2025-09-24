

import express from 'express'
import cors from "cors"
import cookieParser from "cookie-parser"

import userRouter from "./routers/user.router"
import { errorHandler } from './Middlewares/ErrorHandler'
import productRouter from './routers/product.router'
import orderRouter from './routers/order.router'
import cartRouter from "./routers/cart.router"
const app = express();

app.use(cors({
    origin: "",
    credentials: true
}))

app.use(express.json({limit:"16kb"}))
app.use(express.urlencoded({extended: true}))
app.use(express.static("public"))
app.use(cookieParser())

app.use("/api/v1/user", userRouter)
app.use("/api/v1/product", productRouter)
app.use("/api/v1/order", orderRouter)
app.use("/api/v1/cart", cartRouter)

app.use(errorHandler)



export default app