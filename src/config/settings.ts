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
};

export default settings;
