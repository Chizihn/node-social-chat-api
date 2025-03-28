import { NextFunction, Request, Response } from "express";
import UserModel from "../models/user.model";
import { generateToken } from "../utils/token";
import {
  searchFriendQuerySchema,
  signinScehma,
  signupScehma,
} from "../validators/auth.validator";
import { compareValues } from "../utils/bcrypt";
import { HTTPSTATUS } from "../config/http.config";
import { UserDocument } from "../interfaces/user.interface";
import { UserRequest } from "../types/custom.type";

export const signup = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    // Validate the incoming data
    const validatedData = signupScehma.parse(req.body);

    if (!validatedData) {
      return res
        .status(HTTPSTATUS.BAD_REQUEST)
        .json({ message: "Username, email, and password are required" });
    }

    // Check if the email already exists
    const existingEmailUser = await UserModel.findOne({
      email: validatedData.email,
    });
    if (existingEmailUser) {
      return res.status(HTTPSTATUS.CONFLICT).json({
        message: "Email already exists",
      });
    }

    // Check if the username already exists
    const existingUsernameUser = await UserModel.findOne({
      username: validatedData.username,
    });
    if (existingUsernameUser) {
      return res.status(HTTPSTATUS.CONFLICT).json({
        message: "Username already exists",
      });
    }

    // Create a new user
    const newUser: UserDocument = new UserModel({
      ...validatedData,
    });

    await newUser.save();

    const token = generateToken(newUser._id as string, res);

    res.status(HTTPSTATUS.CREATED).json({
      message: "User created successfully",
      token,
      newUser,
    });
  } catch (error) {
    console.error("Signup Error", error);
    next(error);
  }
};

export const signin = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const validatedData = signinScehma.parse(req.body);

    const user = await UserModel.findOne({ email: validatedData.email });

    if (!user) {
      res.status(HTTPSTATUS.NOT_FOUND).json({ message: "User does not exist" });
      return;
    }

    const isMatch = await compareValues(
      validatedData.password,
      user.password as string
    );

    if (!isMatch) {
      res
        .status(HTTPSTATUS.UNAUTHORIZED)
        .json({ message: "Invalid credentials" });
      return; // Added return statement
    }

    const token = generateToken(user._id as string, res);
    res.status(HTTPSTATUS.OK).json({
      message: "User signin Successfully",
      token,
      user,
    });
  } catch (error) {
    console.error("Signin error:", error);
    next(error);
  }
};

export const logout = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    res.clearCookie("authToken");
    res.status(HTTPSTATUS.OK).json({
      message: "User logged out successfully",
    });
  } catch (error) {
    console.error("Logout Error", error);
    next(error);
  }
};

export const searchUserByQuery = async (
  req: UserRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const validatedQuery = searchFriendQuerySchema.parse(req.query);

    const { query: searchTerm } = validatedQuery;

    const users = await UserModel.find({
      $or: [
        { username: { $regex: searchTerm, $options: "i" } },
        { firstName: { $regex: searchTerm, $options: "i" } },
        { lastName: { $regex: searchTerm, $options: "i" } },

        { email: { $regex: searchTerm, $options: "i" } },
      ],
    }).select("username email profileImage location bio");

    if (!users || users.length === 0) {
      return res
        .status(HTTPSTATUS.NOT_FOUND)
        .json({ message: "No users found matching the search term" });
    }

    return res.status(HTTPSTATUS.OK).json(users);
  } catch (error) {
    console.log("Error searching for user", error);
    next(error);
  }
};
