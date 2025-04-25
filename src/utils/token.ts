import { Response } from "express";
import jwt from "jsonwebtoken";
import settings from "../config/settings";

export const generateToken = (userId: string, res: Response) => {
  const token = jwt.sign({ userId }, settings.JWT_SECRET, {
    expiresIn: "2d",
  });
  res.cookie("token", token, {
    maxAge: 7 * 24 * 60 * 60 * 1000,
    // httpOnly: ,
    // secure: ,
    sameSite: "strict",
  });

  return token;
};

export const generateEmailVerificationOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const generateRandomOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const tokenExpires = (date: Date) => {
  const expiration = new Date(date.getTime()); // copy the timestamp
  expiration.setHours(expiration.getHours() + 1);
  return expiration;
};

export const checkTokenExpiration = (
  tokenExpiresDate: Date,
  gracePeriodMinutes: number = 0
) => {
  const expirationWithGracePeriod = new Date(
    tokenExpiresDate.getTime() + gracePeriodMinutes * 60 * 1000
  );

  return new Date() <= expirationWithGracePeriod;
};
