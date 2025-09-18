import { Response } from "express"
import { IUser } from "../Models/User.model"
import { config } from "../config/config";

 const sendToken = (user: IUser, statusCode: number, res:Response) : void =>{
  // 1. Create JWT
  const token = user.getJwtToken();

  // 2. Options for the cookie
  const cookieExpiresDays = parseInt(config.cookie_expireIn || '7', 10)
  const options = {
    expires: new Date(
      Date.now() + cookieExpiresDays * 24 * 60 * 60 * 1000
    ),
    httpOnly: true, // Makes the cookie inaccessible to client-side JS
    secure: config.node_env === 'production', // Only send over HTTPS in production
    sameSite: 'strict' as const // For CSRF protection
  }

  // 3. Send the response with the cookie
  res.status(statusCode).cookie('token', token, options).json({
    success: true,
    user,
    token, // Optional: send token for clients who don't use cookies (like mobile apps)
  })

} 

export default sendToken