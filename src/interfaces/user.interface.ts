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
  profileImage?: string;
  bio?: string;
  comparePassword: (value: string) => Promise<boolean>;
  omitPassword(): Omit<UserDocument, "password">;
}
