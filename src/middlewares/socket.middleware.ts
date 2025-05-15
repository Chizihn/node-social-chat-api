import { Request, Response, NextFunction } from "express";
import { getSocketService } from "../services/socket.service";
import { AuthenticatedRequest } from "../types/custom.type";

export const attachSocketService = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    req.socketService = getSocketService();
    next();
  } catch (error) {
    console.error("Error attaching socket service:", error);
    next();
  }
};
