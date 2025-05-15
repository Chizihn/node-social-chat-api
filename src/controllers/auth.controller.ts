import { Request, Response, NextFunction } from "express";
import UserModel from "../models/user.model";
import {
  generateEmailVerificationOtp,
  generateToken,
  tokenExpires,
} from "../utils/token";
import {
  signupSchema,
  signinScehma,
  forgotPasswordSchema,
  confirmResetSchema,
  resetPasswordSchema,
} from "../validators/auth.validator";
import { HTTPSTATUS } from "../config/http.config";
import { UserDocument } from "../interfaces/user.interface";
import { sendEmail } from "../utils/email";
import { generateOtpCode } from "../utils/otp";
import { hashValue } from "../utils/bcrypt";

class AuthController {
  public async signup(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const validatedData = signupSchema.parse(req.body);

      const existingEmailUser = await UserModel.findOne({
        email: validatedData.email,
      });
      if (existingEmailUser) {
        res
          .status(HTTPSTATUS.CONFLICT)
          .json({ message: "Email already exists" });
        return;
      }

      const existingUsernameUser = await UserModel.findOne({
        username: validatedData.username,
      });
      if (existingUsernameUser) {
        res
          .status(HTTPSTATUS.CONFLICT)
          .json({ message: "Username already exists" });
        return;
      }
      //Generate token to verify email
      const verificationToken = generateEmailVerificationOtp();
      const currentDate = new Date();
      const verificationTokenExpires = tokenExpires(currentDate);

      const newUser = new UserModel({
        ...validatedData,
        emailVerificationToken: verificationToken,
        emailVerificationTokenExpires: verificationTokenExpires,
      });

      await newUser.save();

      const token = generateToken(newUser._id as string, res);

      await sendEmail({
        to: newUser.email,
        subject: "Verify your email",
        text: `Please verify your email with this token. The token expires in ${verificationTokenExpires} hour. ${verificationToken}`,
      });

      res.status(HTTPSTATUS.CREATED).json({
        message: "User created successfully",
        token,
        user: newUser,
      });
    } catch (error) {
      console.error("Signup Error", error);
      next(error);
    }
  }

  public async signin(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const validatedData = signinScehma.parse(req.body);

      const user = await UserModel.findOne({
        $or: [
          { email: validatedData.email },
          { username: validatedData.username },
        ],
      });

      if (!user) {
        res.status(HTTPSTATUS.NOT_FOUND).json({ error: "User does not exist" });
        return;
      }

      const isMatch = await user.comparePassword(validatedData.password);
      if (!isMatch) {
        res
          .status(HTTPSTATUS.UNAUTHORIZED)
          .json({ message: "Invalid credentials" });
        return;
      }

      const token = generateToken(user._id as string, res);

      // Use the omitPassword method to remove the password from the response
      const userWithoutPassword = user.omitPassword();

      res.status(HTTPSTATUS.OK).json({
        message: "User signed in successfully",
        token,
        user: userWithoutPassword,
      });
    } catch (error) {
      console.error("Signin error:", error);
      next(error);
    }
  }

  public logout(req: Request, res: Response, next: NextFunction): void {
    try {
      res.clearCookie("authToken");
      res.status(HTTPSTATUS.OK).json({
        message: "User logged out successfully",
      });
    } catch (error) {
      console.error("Logout Error", error);
      next(error);
    }
  }

  async verifyEmail(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { email, token } = req.body;

      if (!email || !token) {
        res.status(HTTPSTATUS.BAD_REQUEST).json({
          message: "Email and verification token are required",
        });
        return;
      }

      const user = await UserModel.findOne({ email });

      if (!user) {
        res.status(HTTPSTATUS.NOT_FOUND).json({
          message: "User not found",
        });
        return;
      }

      if (user.isVerified) {
        res.status(HTTPSTATUS.BAD_REQUEST).json({
          message: "Email is already verified",
        });
        return;
      }

      if (!user.emailVerificationToken || !user.emailVerificationTokenExpires) {
        res.status(HTTPSTATUS.BAD_REQUEST).json({
          message: "Verification token not found or expired",
        });
        return;
      }

      if (user.emailVerificationToken !== token) {
        res.status(HTTPSTATUS.BAD_REQUEST).json({
          message: "Invalid verification token",
        });
        return;
      }

      const now = new Date();
      if (now > user.emailVerificationTokenExpires) {
        res.status(HTTPSTATUS.BAD_REQUEST).json({
          message: "Verification token has expired",
        });
        return;
      }

      user.isVerified = true;
      user.emailVerificationToken = null;
      user.emailVerificationTokenExpires = null;
      await user.save();

      res.status(HTTPSTATUS.OK).json({
        message: "Email verified successfully",
      });
    } catch (error) {
      console.error("Email verification error:", error);
      next(error);
    }
  }

  async resendVerifyEmail(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { email } = req.body;

      if (!email) {
        res.status(HTTPSTATUS.BAD_REQUEST).json({
          message: "Email is required",
        });
        return;
      }

      const user = await UserModel.findOne({ email });

      if (!user) {
        res.status(HTTPSTATUS.NOT_FOUND).json({
          message: "User not found",
        });
        return;
      }

      if (user.isVerified) {
        res.status(HTTPSTATUS.BAD_REQUEST).json({
          message: "Email is already verified",
        });
        return;
      }

      // Generate new verification token
      const verificationToken = generateEmailVerificationOtp();
      const currentDate = new Date();
      const verificationTokenExpires = tokenExpires(currentDate);

      user.emailVerificationToken = verificationToken;
      user.emailVerificationTokenExpires = verificationTokenExpires;
      await user.save();

      await sendEmail({
        to: user.email,
        subject: "Verify your email",
        text: `Please verify your email with this token. The token expires in 1 hour. ${verificationToken}`,
      });

      res.status(HTTPSTATUS.OK).json({
        message: "Verification email sent successfully",
      });
    } catch (error) {
      console.error("Resend verification email error:", error);
      next(error);
    }
  }

  async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = forgotPasswordSchema.parse(req.body);

      const user = await UserModel.findOne({ email });
      if (!user) {
        return res
          .status(HTTPSTATUS.NOT_FOUND)
          .json({ message: "User not found" });
      }

      const { code, expires } = generateOtpCode();

      user.passwordResetToken = code;
      user.passwordResetTokenExpires = expires;
      await user.save();

      await sendEmail({
        to: email,
        subject: "Reset your password",
        text: `Your OTP code is: ${code}`,
      });

      return res.status(HTTPSTATUS.OK).json({ message: "OTP sent to email" });
    } catch (error) {
      console.error("Error in forgotPassword:", error);
      next(error);
    }
  }

  async confirmResetCode(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, code } = confirmResetSchema.parse(req.body);

      const user = await UserModel.findOne({ email });

      if (
        !user ||
        user.passwordResetToken !== code ||
        !user.passwordResetTokenExpires ||
        user.passwordResetTokenExpires < new Date()
      ) {
        return res
          .status(HTTPSTATUS.BAD_REQUEST)
          .json({ message: "Invalid or expired code" });
      }

      res.status(HTTPSTATUS.OK).json({ message: "Code confirmed" });
    } catch (error) {
      console.error("Error confirming code:", error);
      next(error);
    }
  }

  async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, code, newPassword } = resetPasswordSchema.parse(req.body);
      const user = await UserModel.findOne({ email });

      if (
        !user ||
        user.passwordResetToken !== code ||
        !user.passwordResetTokenExpires ||
        user.passwordResetTokenExpires < new Date()
      ) {
        return res
          .status(HTTPSTATUS.BAD_REQUEST)
          .json({ message: "Invalid or expired code" });
      }

      user.password = await hashValue(newPassword);
      user.passwordResetToken = null;
      user.passwordResetTokenExpires = null;
      await user.save();

      res.status(HTTPSTATUS.OK).json({ message: "Password reset successful" });
    } catch (error) {
      console.error("Error resetting password:", error);
      next(error);
    }
  }
}

export default new AuthController();
