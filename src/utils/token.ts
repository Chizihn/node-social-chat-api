import { Response } from "express";
import jwt from "jsonwebtoken";
import settings from "../config/settings";

export const generateToken = (userId: string, res: Response) => {
  const token = jwt.sign({ userId }, settings.JWT_SECRET, {
    expiresIn: "7d",
  });
  res.cookie("authToken", token, {
    maxAge: 7 * 24 * 60 * 60 * 1000,
    // httpOnly: ,
    // secure: ,
    sameSite: "strict",
  });

  return token;
};
