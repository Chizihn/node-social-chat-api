import { NextFunction, Response } from "express";
import { AuthenticatedRequest } from "../types/custom.type";
import { HTTPSTATUS } from "../config/http.config";
import { updateProfileSchema } from "../validators/auth.validator";
import { ProfileService } from "../services/profile.service";
import { z } from "zod";
import { IProfileUpdate } from "../types/profile.type";

export class ProfileController {
  static async getProfile(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res
          .status(HTTPSTATUS.UNAUTHORIZED)
          .json({ message: "User not authenticated" });
      }

      const profile = await ProfileService.getProfile(userId);
      if (!profile) {
        return res
          .status(HTTPSTATUS.NOT_FOUND)
          .json({ message: "Profile not found" });
      }

      res.status(HTTPSTATUS.OK).json({
        message: "Profile retrieved successfully",
        data: profile,
      });
    } catch (error) {
      console.error("Get Profile Error:", error);
      next(error);
    }
  }

  static async updateProfile(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const validatedData = updateProfileSchema.parse(
        req.body
      ) as IProfileUpdate;
      const userId = req.user?.id;

      if (!userId) {
        return res
          .status(HTTPSTATUS.UNAUTHORIZED)
          .json({ message: "User not authenticated" });
      }

      const updatedProfile = await ProfileService.updateProfile(
        userId,
        validatedData
      );
      if (!updatedProfile) {
        return res
          .status(HTTPSTATUS.NOT_FOUND)
          .json({ message: "Profile not found" });
      }

      res.status(HTTPSTATUS.OK).json({
        message: "Profile updated successfully",
        data: updatedProfile,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(HTTPSTATUS.BAD_REQUEST).json({
          message: "Invalid input data",
          errors: error.errors,
        });
      }
      console.error("Update Profile Error:", error);
      next(error);
    }
  }

  static async updateAvatar(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const userId = req.user?.id;
      let avatarUrl = req.body.avatarUrl;

      if (req.file) {
        const { CloudinaryService } = require("../utils/cloudinary");
        const result = await CloudinaryService.uploadFile(
          req.file.path,
          "avatars"
        );
        avatarUrl = result.secure_url;
      }

      if (!avatarUrl) {
        return res
          .status(HTTPSTATUS.BAD_REQUEST)
          .json({ message: "Avatar URL is required" });
      }

      if (!userId) {
        return res
          .status(HTTPSTATUS.UNAUTHORIZED)
          .json({ message: "User not authenticated" });
      }

      const updatedProfile = await ProfileService.updateAvatar(
        userId,
        avatarUrl
      );
      if (!updatedProfile) {
        return res
          .status(HTTPSTATUS.NOT_FOUND)
          .json({ message: "Profile not found" });
      }

      res.status(HTTPSTATUS.OK).json({
        message: "Avatar updated successfully",
        data: updatedProfile,
      });
    } catch (error) {
      console.error("Update Avatar Error:", error);
      next(error);
    }
  }

  static async togglePrivacy(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res
          .status(HTTPSTATUS.UNAUTHORIZED)
          .json({ message: "User not authenticated" });
      }

      const updatedProfile = await ProfileService.toggleProfilePrivacy(userId);
      if (!updatedProfile) {
        return res
          .status(HTTPSTATUS.NOT_FOUND)
          .json({ message: "Profile not found" });
      }

      res.status(HTTPSTATUS.OK).json({
        message: "Profile privacy updated successfully",
        data: updatedProfile,
      });
    } catch (error) {
      console.error("Toggle Privacy Error:", error);
      next(error);
    }
  }

  static async updateCoverImage(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const userId = req.user?.id;
      let coverImageUrl = req.body.coverImageUrl;

      if (req.file) {
        const { CloudinaryService } = require("../utils/cloudinary");
        const result = await CloudinaryService.uploadFile(
          req.file.path,
          "covers"
        );
        coverImageUrl = result.secure_url;
      }

      if (!coverImageUrl) {
        return res
          .status(HTTPSTATUS.BAD_REQUEST)
          .json({ message: "Cover image URL is required" });
      }

      if (!userId) {
        return res
          .status(HTTPSTATUS.UNAUTHORIZED)
          .json({ message: "User not authenticated" });
      }

      const updatedProfile = await ProfileService.updateCoverImage(
        userId,
        coverImageUrl
      );
      if (!updatedProfile) {
        return res
          .status(HTTPSTATUS.NOT_FOUND)
          .json({ message: "Profile not found" });
      }

      res.status(HTTPSTATUS.OK).json({
        message: "Cover image updated successfully",
        data: updatedProfile,
      });
    } catch (error) {
      console.error("Update Cover Image Error:", error);
      next(error);
    }
  }
}
