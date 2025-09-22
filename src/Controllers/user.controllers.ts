import { Request, Response } from "express";
import User from "../Models/User.model";
import sendToken from "../utils/sendToken";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import { config } from "../config/config";
import sendEmail from "../utils/sendEmail";
import crypto from "crypto";
import cloudinary from "../config/cloudinary";
import DataURIParser from "datauri/parser";
import path from "path";

/**
 * @desc Register a new user
 * @route POST /api/v1/user/register
 * @access public
 */

export const registerUser = asyncHandler(
  async (req: Request, res: Response) => {
    const { name, email, password } = req.body;
    const userExsists = await User.findOne({ email });
    if (userExsists) {
      // return res.status(400).json({success: false, message: "User already exists"});
      throw new ApiError(400, "User already exists");
    }

    const user = await User.create({ name, email, password });

    sendToken(user, 201, res); // This would send a JWT back
    res.status(201).json({
      success: true,
      message: "User registered. Implement sendToken to get JWT.",
    });
  }
);

/**
 * @desc    Login user
 * @route   POST /api/v1/user/login
 * @access  Public
 */

export const loginUser = asyncHandler(async (req: Request, res: Response) => {
  const { identifier, password } = req.body;
  console.log(identifier, password);

  if (!identifier || !password) {
    throw new ApiError(400, "Please provide an email/name and password");
  }

  const user = await User.findOne({
    $or: [{ email: identifier }, { name: identifier }],
  }).select("+password");

  if (!user) {
    throw new ApiError(401, "Invalid credentials");
  }

  const isPasswordMatched = await user.comparePassword(password);
  if (!isPasswordMatched) {
    throw new ApiError(401, "Invalid credentials");
  }

  sendToken(user, 201, res); // This would send a JWT back

  res.status(201).json({ success: true, message: "User successful login" });
});

/**
 * @desc    Logout user
 * @route   GET /api/v1/user/logout
 * @access  Private
 */

export const logoutUser = asyncHandler(async (req: Request, res: Response) => {
  // Logic to clear the cookie containing the JWT
  res.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
});

/**
 * @desc    forgot-password
 * @route   GET /api/v1/user/forgot_password
 * @access  public
 */

export const forgotPassword = asyncHandler(
  async (req: Request, res: Response) => {
    // Logic to clear the cookie containing the JWT
    const { email } = req.body;
    if (!email) {
      throw new ApiError(400, "Email is required");
    }
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      throw new ApiError(404, "User not found");
    }

    //Generate reset Token and send to the user email
    const resetToken = await user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${config.client_url}/reset-password=${resetToken}`;
    const emailBody = `<p>You requested a password reset. Click the link below to reset your password:</p>
        <p><a href="${resetUrl}">Reset Password</a></p>
        <p>This link will expire in 15 minutes.</p>
        <p>If you didn't request this, please ignore this email.</p>`;

    await sendEmail(email, "Password reset Request", emailBody);

    res.status(200).json({
      success: true,
      message: "Password reset email sent",
    });
  }
);

/**
 * @desc    reset-password
 * @route   GET /api/v1/user/reset_password
 * @access  public
 */

export const resetPassword = async (req: Request, res: Response) => {
  // Logic to clear the cookie containing the JWT
  const { password } = req.body;
  const { token } = req.params;
  console.log("password and token is", password, token);

  if (!token) {
    // throw new ApiError(400, "token is invalid");
    throw new ApiError(404, "Token is missing");
  }
  // 1. Hash the incoming token to match the one in DB
  const verifyToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await User.findOne({
    resetPasswordToken: verifyToken,
    resetPasswordExpire: { $gt: Date.now() },
  });
  // Find user by resetPasswordToken
  if (!user) {
    // throw new ApiError(404, "User not found");
    throw new ApiError(400, "Reset Password Token is invalid or has expired");
  }

  if (req.body.password !== req.body.confirmPassword) {
    throw new ApiError(400, "Passwords do not match");
  }

  // 2. Set new password
  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  // 3. Log the user in
  sendToken(user, 200, res);

  res.status(200).json({
    success: true,
    message: "password change successfully",
  });
};

// --- USER PROFILE ROUTES ---

/**
 * @desc    Get current user profile
 * @route   GET /api/v1/user/me
 * @access  Private
 */

export const getUserProfile = asyncHandler(
  async (req: Request, res: Response) => {
    // The 'isAuthenticatedUser' middleware will attach the user to req.user
    const UserId = req.user?.id;
    console.log("UserId is", UserId);

    const user = await User.findById(UserId);
    if (!user) {
      throw new ApiError(404, "user not found");
    }

    res.status(200).json({
      success: true,
      user,
    });
  }
);

/**
 * @desc    Post changeUserPassword
 * @route   POST /api/v1/user/me
 * @access  Private
 */
export const changeUserPassword = asyncHandler(
  async (req: Request, res: Response) => {
    const { oldPassword, newPassword } = req.body;
    const UserId = req.user?.id;
    console.log("UserId is", UserId);

    const user = await User.findById(UserId);
    if (!user) {
      throw new ApiError(404, "user not found");
    }

    const isPasswordMatch = await user.comparePassword(oldPassword);
    if (!isPasswordMatch) {
      throw new ApiError(404, "Old password is invalid");
    }
    user.password = newPassword;
    await user.save({ validateBeforeSave: false });
    res.status(200).json({
      success: true,
      message: "password changed successfully",
    });
  }
);

/**
 * @desc    Post AddUserAvatar
 * @route   POST /api/v1/user/me
 * @access  Private
 */
export const AddUserAvatar = asyncHandler(
  async (req: Request, res: Response) => {
    // 1. Check if a file was uploaded
    if (!req.file) {
      throw new ApiError(
        400,
        "No file uploaded. Please select an avatar image."
      );
    }
    const UserId = req.user?.id;
    console.log("UserId is", UserId);

    const user = await User.findById(UserId);
    if (!user) {
      throw new ApiError(404, "user not found");
    }

    // 3. Delete the old avatar from Cloudinary if it exists
    if (user.avatar && user.avatar.public_id) {
      await cloudinary.uploader.destroy(user.avatar.public_id);
    }

    // 4. Convert the buffer to a Data URI
    const parser = new DataURIParser();
    const fileExtention = path.extname(req.file.originalname).toString();
    const fileDataUri = parser.format(fileExtention, req.file.buffer);

    if (!fileDataUri.content) {
      throw new ApiError(500, "Could not process the file buffer.");
    }
    // 5. Upload the new avatar to Cloudinary

    const result = await cloudinary.uploader.upload(fileDataUri.content, {
      folder: "avatars",
      resource_type: "image",
    });

    // 6. Update the user's avatar information in the database

    user.avatar = {
      public_id: result.public_id,
      url: result.secure_url,
    };
    await user.save({ validateBeforeSave: true });
    res.status(200).json({
      success: true,
      message: "Avatar uploaded successfully.",
    });
  }
);

/**
 * @desc    Post AddUserAvatar
 * @route   POST /api/v1/user/me
 * @access  Private
 */
export const updateUserIdentity = asyncHandler(
  async (req: Request, res: Response) => {
    const {name, email} = req.body;
    const userId = req.user?.id;
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, `user not found with id ${userId}`);
    }
    user.name = name || user.name;
    user.email = email || user.name;

    await user.save({validateBeforeSave: true});
    res.status(200).json({ success: true, user });
  }
);

// --- ADMIN ROUTES CONTROLLERS ---

/**
 * @desc    Get All users(Admin)
 * @route   GET /api/v1/user/admin/users
 * @access  Private
 */
export const getAllUsers = asyncHandler(async (req: Request, res: Response) => {
  const users = await User.find();
  res.status(200).json({ success: true, users });
});

/**
 * @desc    Get single user details(Admin)
 * @route   GET /api/v1/user/admin/user/:id
 * @access  Private
 */
export const getSingleUser = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.params.id;
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, `user not found with id ${userId}`);
    }
    res.status(200).json({ success: true, user });
  }
);

/**
 * @desc    update user role(Admin)
 * @route   Put /api/v1/user/admin/user/:id
 * @access  Private
 */
export const updateUserRole = asyncHandler(
  async (req: Request, res: Response) => {
    const { name, email, role } = req.body;
    const userId = req.params.id;
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, `user not found with id ${userId}`);
    }

    user.name = name || user.name;
    user.email = email || user.email;
    user.role = role || user.role;

    await user.save({ validateBeforeSave: true });
    res
      .status(200)
      .json({ success: true, message: "User updated successfully" });
  }
);

/**
 * @desc    Delete user (Admin)
 * @route   Delete /api/v1/user/admin/user/:id
 * @access  Private
 */
export const deleteUser = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.params.id;

  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, `user not found with id ${userId}`);
  }

  // Here you might also want to remove associated data, like their avatar from a cloud service.
  if (user.avatar && user.avatar?.public_id) {
      await cloudinary.uploader.destroy(user.avatar.public_id);
  }

  await user.deleteOne();
  res.status(200).json({ success: true, message: "User deleted successfully" });
});
