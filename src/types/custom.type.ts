import { Request } from "express";
import { ParamsDictionary } from "express-serve-static-core";
import { ParsedQs } from "qs";

export interface AuthenticatedRequest extends Request {
  user?: any;
}

export interface CustomRequest<
  Params extends ParamsDictionary = ParamsDictionary,
  ReqBody = any,
  ReqQuery extends ParsedQs = ParsedQs
> extends AuthenticatedRequest {
  params: Params;
  body: ReqBody;
  query: ReqQuery;
}
