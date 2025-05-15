import { Request } from "express";
import { ParamsDictionary } from "express-serve-static-core";
import { ParsedQs } from "qs";
import { SocketService } from "../services/socket.service";

export interface AuthenticatedRequest extends Request {
  user?: any;
  socketService?: SocketService;
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
