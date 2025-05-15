import { z } from "zod";
import { GenderEnum } from "../enums/user.enum";

export const signupSchema = z.object({
  username: z.string().min(1, "Username is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must have a minimum of 6 characters"),
});

export const signinScehma = z.object({
  email: z.string().email("Invalid email address").trim().optional(),
  username: z.string().optional(),
  password: z.string(),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address").trim(),
});

export const confirmResetSchema = z.object({
  email: z.string().email("Invalid email address").trim(),
  code: z.string().max(6, "Otp code must be 6"),
});

export const resetPasswordSchema = z.object({
  code: z.string().max(6, "Otp code must be 6"),
  email: z.string().email("Invalid email address").trim(),
  newPassword: z
    .string()
    .min(6, "Password must have a minimum of 6 characters"),
});

export const updateProfileSchema = z.object({
  firstName: z
    .string()
    .min(2, "First name must be at least 2 characters")
    .optional(),
  lastName: z
    .string()
    .min(2, "Last name must be at least 2 characters")
    .optional(),
  gender: z
    .enum([GenderEnum.MALE, GenderEnum.FEMALE, GenderEnum.OTHER] as const)
    .optional(),
  dateOfBirth: z.string().optional(),
  location: z.string().optional(),
  hobbies: z.array(z.string()).optional(),
});

export const searchFriendQuerySchema = z.object({
  query: z
    .string()
    .min(1, "Search term must be at least 1 character long")
    .trim(),
});
