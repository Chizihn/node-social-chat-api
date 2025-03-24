import { Request, Response } from "express";

export interface AuthenticatedRequest extends Request {
  user?: any;
}

export interface AnyResponse extends Response {
  response?: any;
}

export interface UserRequest extends AuthenticatedRequest {
  query: {
    searchTerm: string;
  };
}
