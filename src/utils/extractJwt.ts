import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import settings from "../config/settings";
import UserModel from "../models/user.model";

export const extractJwt = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    // Don't send a response here, just return null
    return null;
  }
  const decoded = jwt.verify(token, settings.JWT_SECRET) as {
    userId: string;
  };
  if (!decoded || !decoded.userId) {
    // Don't send a response here, just return null
    return null;
  }
  const user = await UserModel.findById(decoded.userId);
  return user;
};

// export const extractJwt = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   const token = req.headers.authorization?.split(" ")[1];
//   if (!token) {
//     res.status(HTTPSTATUS.UNAUTHORIZED).json({
//       message: "Unauthorized - no token provided",
//     });
//     return null;
//   }
//   try {
//     const decoded = jwt.verify(token, settings.JWT_SECRET) as {
//       userId: string;
//     };
//     if (!decoded || !decoded.userId) {
//       res.status(HTTPSTATUS.UNAUTHORIZED).json({
//         message: "Unauthorised access - invalid token",
//         errorCode: ErrorCodeEnum.UNAUTHORIZED,
//       });
//       return null;
//     }
//     const user = await UserModel.findById(decoded.userId);
//     return user;
//   } catch (error) {
//     res.status(HTTPSTATUS.UNAUTHORIZED).json({
//       message: "Unauthorized - invalid token",
//       errorCode: ErrorCodeEnum.UNAUTHORIZED,
//     });
//     return null;
//   }
// };
