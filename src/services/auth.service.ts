import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { Response } from "express";
import settings from "../config/settings";
import { generateToken, generateRandomOtp, tokenExpires } from "../utils/token";
import { sendEmail } from "../utils/email";
import UserModel from "../models/user.model";
import { AuthenticatedRequest } from "../types/custom.type";

class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthError";
  }
}

class TokenError extends AuthError {
  constructor(message: string) {
    super(message);
    this.name = "TokenError";
  }
}

class UserNotFoundError extends AuthError {
  constructor(message: string = "User not found") {
    super(message);
    this.name = "UserNotFoundError";
  }
}

export class AuthService {
  // Generate refresh token
  static generateRefreshToken = (userId: string) => {
    return jwt.sign({ userId }, settings.JWT_SECRET, {
      expiresIn: "7d", // Refresh token valid for 7 days
    });
  };

  // Verify refresh token and generate new access token
  static refreshAccessToken = async (
    refreshToken: string,
    req: AuthenticatedRequest,
    res: Response
  ) => {
    const userId = req.user?._id;
    try {
      const user = await UserModel.findById(userId);

      if (!user) {
        throw new UserNotFoundError();
      }

      return generateToken(userId.toString(), res);
    } catch (error) {
      throw new TokenError("Invalid refresh token");
    }
  };

  // Initiate password reset
  static initiatePasswordReset = async (email: string) => {
    const user = await UserModel.findOne({ email });
    if (!user) {
      throw new UserNotFoundError();
    }

    const resetToken = generateRandomOtp();
    const resetTokenExpires = tokenExpires(new Date());

    user.passwordResetToken = resetToken;
    user.passwordResetTokenExpires = resetTokenExpires;
    await user.save();

    // Send password reset email
    await sendEmail({
      to: user.email,
      subject: "Password Reset Request",
      text: `Your password reset code is: ${resetToken}. This code will expire in 1 hour.`,
    });

    return true;
  };

  // Reset password with token
  static resetPassword = async (token: string, newPassword: string) => {
    const user = await UserModel.findOne({
      passwordResetToken: token,
      passwordResetTokenExpires: { $gt: new Date() },
    });

    if (!user) {
      throw new TokenError("Invalid or expired reset token");
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    user.passwordResetToken = null;
    user.passwordResetTokenExpires = null;
    await user.save();

    return true;
  };
}
