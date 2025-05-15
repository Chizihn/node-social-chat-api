import { UploadApiResponse } from "cloudinary";
import fs from "fs";
import cloudinary from "../config/cloudinary";

export class CloudinaryService {
  /**
   * Upload a file to Cloudinary
   * @param filePath - Path to the file to upload
   * @param folder - Folder in Cloudinary to store the file
   * @returns Promise with Cloudinary upload response
   */
  static async uploadFile(
    filePath: string,
    folder: string = "uploads"
  ): Promise<UploadApiResponse> {
    try {
      // Upload the file to Cloudinary
      const result = await cloudinary.uploader.upload(filePath, {
        folder,
        resource_type: "auto", // auto-detect whether it's an image or video
      });

      // Delete the file from local storage after upload
      fs.unlinkSync(filePath);

      return result;
    } catch (error) {
      // Delete the file from local storage if upload fails
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      throw error;
    }
  }

  /**
   * Delete a file from Cloudinary
   * @param publicId - Public ID of the file to delete
   * @returns Promise with Cloudinary deletion response
   */
  static async deleteFile(publicId: string): Promise<any> {
    return await cloudinary.uploader.destroy(publicId);
  }

  /**
   * Extract public ID from Cloudinary URL
   * @param url - Cloudinary URL
   * @returns Public ID
   */
  static extractPublicId(url: string): string {
    const parts = url.split("/");
    const fileName = parts[parts.length - 1];
    const folder = parts[parts.length - 2];
    return `${folder}/${fileName.split(".")[0]}`; // removes file extension
  }
}
