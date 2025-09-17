import express, {Request, Response, NextFunction } from 'express'
import cors from "cors"
import cookieParser from "cookie-parser"
const app = express();

app.use(cors({
    origin: "",
    credentials: true
}))

app.use(express.json({limit:"16kb"}))
app.use(express.urlencoded({extended: true}))
app.use(express.static("public"))
app.use(cookieParser())

app.get("/", (req, res)=>{
  res.json({message:"hellow"})
})

// Global error handler
app.use( (err, req: Request, res: Response, next: NextFunction)=>{
  const statusCode = err.statusCode || 500;
})

export default app