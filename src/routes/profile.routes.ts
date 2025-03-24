import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import { asyncAuthHandler } from "../middlewares/async.middleware";
import {
  getCurrentUserProfile,
  updateUserProfile,
} from "../controllers/profile.controller";

const profileRoutes = Router();

profileRoutes.get(
  "/profile",
  authMiddleware,
  asyncAuthHandler(getCurrentUserProfile)
);
profileRoutes.put(
  "/profile/update",
  authMiddleware,
  asyncAuthHandler(updateUserProfile)
);

export default profileRoutes;

// export const uploadProfilePicture = [
//     // Use multer for handling the image upload
//     upload.single("profileImage"),  // 'profileImage' is the field name in the form
//     async (req: Request, res: Response, next: NextFunction) => {
//       try {
//         // Check if file was uploaded
//         if (!req.file) {
//           return res.status(400).json({ message: "No file uploaded" });
//         }

//         // Get the user from the token or session (you may need to implement authentication)
//         const userId = req.userId;  // Assuming userId is stored in the request object

//         // Find the user in the database
//         const user = await UserModel.findById(userId);
//         if (!user) {
//           return res.status(404).json({ message: "User not found" });
//         }

//         // Save the file path to the user's profile
//         user.profileImage = req.file.path;  // Save the file path (you could save a URL if using a cloud storage service)

//         // Save the updated user data
//         await user.save();

//         // Respond with the updated user information and the image URL
//         res.status(200).json({
//           message: "Profile picture uploaded successfully",
//           profileImage: req.file.path,  // Return the image path or URL
//           user,
//         });
//       } catch (error) {
//         console.error("Error uploading profile picture:", error);
//         next(error);  // Pass the error to the global error handler
//       }
//     },
//   ];
