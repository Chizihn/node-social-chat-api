import { NextFunction, Response } from "express";
import { AuthenticatedRequest } from "../types/custom.type";
import { HTTPSTATUS } from "../config/http.config";
import UserModel from "../models/user.model";
import { updateProfileSchema } from "../validators/auth.validator";

export const getCurrentUserProfile = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id; // assuming user ID is set in the request from the authentication middleware
    if (!userId) {
      return res
        .status(HTTPSTATUS.UNAUTHORIZED)
        .json({ message: "User not authenticated" });
    }

    const user = await UserModel.findById(userId).select("-password"); // Exclude password from profile
    if (!user) {
      return res
        .status(HTTPSTATUS.NOT_FOUND)
        .json({ message: "User not found" });
    }

    res.status(HTTPSTATUS.OK).json({
      message: "User profile retrieved successfully",
      user,
    });
  } catch (error) {
    console.log("Get User Profile Error", error);
    next(error);
  }
};

export const updateUserProfile = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const validatedData = updateProfileSchema.parse(req.body);

    const userId = req.user?.id;

    if (!userId) {
      return res
        .status(HTTPSTATUS.UNAUTHORIZED)
        .json({ message: "User not authenticated" });
    }

    const user = await UserModel.findById(userId);
    if (!user) {
      return res
        .status(HTTPSTATUS.NOT_FOUND)
        .json({ message: "User not found" });
    }

    Object.assign(user, validatedData);

    await user.save();

    res.status(HTTPSTATUS.OK).json({
      message: "User profile updated successfully",
      user: {
        firstName: user.firstName,
        lastName: user.lastName,
        gender: user.gender,
        dateOfBirth: user.dateOfBirth,
        location: user.location,
        hobbies: user.hobbies,
      },
    });
  } catch (error) {
    console.error("Update User Profile Error", error);
    next(error);
  }
};
