import dotenv from "dotenv";

dotenv.config();

interface ISettings {
  MONGO_URI: string;
  PORT: string;
  JWT_SECRET: string;
  JWT_SECRET_EXPIRES: string;
  SMTP_HOST: string;
  SMTP_PORT: string;
  SMTP_USER: string;
  SMTP_PASS: string;
  EMAIL_FROM: string;

  // Redis Configuration
  REDIS_HOST: string;
  REDIS_PORT: number;
  REDIS_PASSWORD: string;

  // Rate Limiting Configuration
  RATE_LIMIT_WINDOW: number;
  RATE_LIMIT_MAX: number;
  AUTH_RATE_LIMIT_WINDOW: number;
  AUTH_RATE_LIMIT_MAX: number;
}

const settings: ISettings = {
  MONGO_URI: process.env.MONGO_URI as string,
  PORT: process.env.PORT as string,
  JWT_SECRET: process.env.JWT_SECRET as string,
  JWT_SECRET_EXPIRES: process.env.JWT_SECRET_EXPIRES as string,
  SMTP_HOST: process.env.SMTP_HOST as string,
  SMTP_PORT: process.env.SMTP_PORT as string,
  SMTP_USER: process.env.SMTP_USER as string,
  SMTP_PASS: process.env.SMTP_PASS as string,
  EMAIL_FROM: process.env.EMAIL_FROM as string,

  // Redis Configuration
  REDIS_HOST: process.env.REDIS_HOST || "localhost",
  REDIS_PORT: parseInt(process.env.REDIS_PORT || "6379", 10),
  REDIS_PASSWORD: process.env.REDIS_PASSWORD || "",

  // Rate Limiting Configuration
  RATE_LIMIT_WINDOW: parseInt(process.env.RATE_LIMIT_WINDOW || "900000", 10), // 15 minutes
  RATE_LIMIT_MAX: parseInt(process.env.RATE_LIMIT_MAX || "100", 10),
  AUTH_RATE_LIMIT_WINDOW: parseInt(
    process.env.AUTH_RATE_LIMIT_WINDOW || "3600000",
    10
  ), // 1 hour
  AUTH_RATE_LIMIT_MAX: parseInt(process.env.AUTH_RATE_LIMIT_MAX || "5", 10),
};

export default settings;
