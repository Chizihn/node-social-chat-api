import { z } from "zod";

export const updateProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").optional(),
  bio: z.string().max(500, "Bio cannot exceed 500 characters").optional(),
  location: z
    .string()
    .max(100, "Location cannot exceed 100 characters")
    .optional(),
  website: z.string().url("Invalid website URL").optional(),
  avatar: z.string().optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(6, "Password must be at least 6 characters"),
  newPassword: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .refine((val) => /[0-9]/.test(val), {
      message: "Password must contain at least one number",
    })
    .refine((val) => /[A-Z]/.test(val), {
      message: "Password must contain at least one uppercase letter",
    }),
});

export const emailSettingsSchema = z.object({
  emailNotifications: z.boolean(),
  marketingEmails: z.boolean().optional(),
});

export const privacySettingsSchema = z.object({
  isPrivateProfile: z.boolean(),
  showOnlineStatus: z.boolean(),
  allowMessagesFromNonFriends: z.boolean(),
});
