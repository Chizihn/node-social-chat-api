import UserModel from "../models/user.model";
import { IProfileUpdate } from "../types/profile.type";

export class ProfileService {
  static async getProfile(userId: string) {
    return UserModel.findById(userId).select(
      "id username firstName lastName email gender dateOfBirth location hobbies interests avatar bio isPrivate isVerified createdAt -password"
    );
  }

  static async updateProfile(userId: string, updateData: IProfileUpdate) {
    return UserModel.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true }
    ).select("-password");
  }

  static async toggleProfilePrivacy(userId: string) {
    const user = await UserModel.findById(userId);
    if (!user) return null;

    user.isPrivate = !user.isPrivate;
    await user.save();

    return user;
  }

  static async updateAvatar(userId: string, avatarUrl: string) {
    return UserModel.findByIdAndUpdate(
      userId,
      { $set: { avatar: avatarUrl } },
      { new: true }
    ).select("-password");
  }

  static async updateCoverImage(userId: string, coverImageUrl: string) {
    return UserModel.findByIdAndUpdate(
      userId,
      { $set: { coverImage: coverImageUrl } },
      { new: true }
    ).select("-password");
  }
}
