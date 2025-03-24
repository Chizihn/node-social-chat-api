import { NextFunction, Request, Response } from "express";
import { extractJwt } from "../utils/extractJwt";
import { HTTPSTATUS } from "../config/http.config";
import { AuthenticatedRequest } from "../types/custom.type";

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const user = await extractJwt(req, res, next);
    if (!user) {
      // Only send the response here
      return res.status(HTTPSTATUS.UNAUTHORIZED).json({
        message: "Unauthorized - authentication failed",
      });
    }

    const authReq = req as AuthenticatedRequest;
    authReq.user = user;

    next();
  } catch (error) {
    next(error);
  }
};

export const adminMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await extractJwt(req, res, next);
    if (!user) {
      res.status(HTTPSTATUS.NOT_FOUND).json({
        message: "Unauthorized - user not found",
      });
      return;
    }

    // if (!user.isAdmin) {
    //   res.status(HTTPSTATUS.FORBIDDEN).json({
    //     message: "Forbidden - admin privileges required",
    //   });
    //   return;
    // }

    const authReq = req as AuthenticatedRequest;
    authReq.user = user;

    next();
  } catch (error) {
    next(error);
  }
};
