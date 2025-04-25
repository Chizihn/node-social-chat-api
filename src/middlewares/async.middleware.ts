import { NextFunction, Request, Response } from "express";
import { CustomRequest } from "../types/custom.type";
import { ParamsDictionary } from "express-serve-static-core";
import { ParsedQs } from "qs";

type AsyncControllerType = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<any>;

type AsyncAuthControllerType<
  P extends ParamsDictionary = ParamsDictionary,
  ReqBody = any,
  ReqQuery extends ParsedQs = ParsedQs
> = (
  req: CustomRequest<P, ReqBody, ReqQuery>,
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
  <
    P extends ParamsDictionary = ParamsDictionary,
    ReqBody = any,
    ReqQuery extends ParsedQs = ParsedQs
  >(
    controller: AsyncAuthControllerType<P, ReqBody, ReqQuery>
  ): AsyncAuthControllerType<P, ReqBody, ReqQuery> =>
  async (req, res, next) => {
    try {
      await controller(req, res, next);
    } catch (error) {
      next(error);
    }
  };
