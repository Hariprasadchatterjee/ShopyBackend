import { Request, Response } from "express";
import User from "../Models/User.model";
import sendToken from "../utils/sendToken";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";

/** 
 * @desc Register a new user
 * @route POST /api/v1/user/register
 * @access public
 */

export const registerUser = asyncHandler(async (req: Request, res: Response) =>{

    const { name, email, password } = req.body;
    const userExsists = await User.findOne({email});
    if (userExsists) {
      // return res.status(400).json({success: false, message: "User already exists"});
      throw new ApiError(400, "User already exists")
    }

    const user = await User.create({name, email, password})

    sendToken(user, 201, res); // This would send a JWT back
    res.status(201).json({success: true, message: "User registered. Implement sendToken to get JWT."})
    
  
})

/**
 * @desc    Login user
 * @route   POST /api/v1/user/login
 * @access  Public
 */

export const loginUser = async (req: Request, res: Response) => {
   try {
    const { name, email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user = await User.findOne({email});
    if(!user){
      return res.status(401).json({success: false, message: "User not found! credential invalid"});
    }

    const isPasswordMatched  = await user.comparePassword(password);
    if (!isPasswordMatched ) {
      return res.status(401).json({success: false, message: "User not found! credential invalid"});
    }

    sendToken(user, 201, res); // This would send a JWT back

    res.status(201).json({success: true, message: "User successful login"})
   } catch (error) {
    res.status(500).json({ success: false, message: error });
   }
};

/**
 * @desc    Logout user
 * @route   GET /api/users/logout
 * @access  Private
 */

export const logoutUser = async (req: Request, res: Response) => { 
  // Logic to clear the cookie containing the JWT
  res.cookie('token', null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
}