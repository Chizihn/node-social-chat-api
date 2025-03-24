import { NextFunction, Request, Response } from "express";
import { AuthenticatedRequest, UserRequest } from "../types/custom.type";

type AsyncControllerType = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<any>;

type AsyncAuthControllerType = (
  req: UserRequest,
  res: Response,
  next: NextFunction
) => Promise<any>;

export const asyncHandler =
  (controller: AsyncControllerType): AsyncControllerType =>
  async (req, res, next) => {
    try {
      await controller(req, res, next);
    } catch (error) {
      next(error);
    }
  };

export const asyncAuthHandler =
  (controller: AsyncAuthControllerType): AsyncAuthControllerType =>
  async (req, res, next) => {
    try {
      await controller(req as UserRequest, res, next);
    } catch (error) {
      next(error);
    }
  };
