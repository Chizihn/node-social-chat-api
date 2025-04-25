import { Document } from "mongoose";
import { GenderEnumType } from "../enums/user.enum";

export interface UserDocument extends Document {
  username: string;
  email: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  gender?: GenderEnumType | null;
  dateOfBirth?: string;
  location?: string;
  hobbies?: string[];
  interests?: string[];
  avatar?: string;
  coverImage?: string;
  bio?: string;
  isPrivate?: boolean;
  isVerified: boolean;
  emailVerificationToken: string | null;
  emailVerificationTokenExpires: Date | null;
  passwordResetToken: string;
  passwordResetTokenExpires: Date | null;
  comparePassword: (value: string) => Promise<boolean>;
  omitPassword(): Omit<UserDocument, "password">;
}
