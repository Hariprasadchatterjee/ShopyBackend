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

export const loginUser = asyncHandler( async (req: Request, res: Response) => {
  
    const { identifier, password } = req.body;
    console.log(identifier, password);
    

    if (!identifier || !password) {
      throw new ApiError(400, 'Please provide an email/name and password');
    }

    const user = await User.findOne({
      $or: [{email: identifier}, {name:identifier}]
    }).select("+password");

    if(!user){
      throw new ApiError(401, 'Invalid credentials');
    }

    const isPasswordMatched  = await user.comparePassword(password);
    if (!isPasswordMatched ) {
      throw new ApiError(401, 'Invalid credentials');
    }

    sendToken(user, 201, res); // This would send a JWT back

    res.status(201).json({success: true, message: "User successful login"})
   
});

/**
 * @desc    Logout user
 * @route   GET /api/v1/user/logout
 * @access  Private
 */

export const logoutUser = asyncHandler(async (req: Request, res: Response) => { 
  // Logic to clear the cookie containing the JWT
  res.cookie('token', null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
})

// --- USER PROFILE ROUTES ---

/**
 * @desc    Get current user profile
 * @route   GET /api/v1/user/me
 * @access  Private
 */


export const getUserProfile = asyncHandler( async (req: Request, res: Response) => {
  // The 'isAuthenticatedUser' middleware will attach the user to req.user
  const UserId = req.user?.id
  console.log("UserId is",UserId);
  
  const user = await User.findById(UserId);
  if (!user) {
    throw new ApiError(404, "user not found")
  }

  res.status(200).json({
    success: true,
    user,
  });
});