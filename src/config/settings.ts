import dotenv from "dotenv";

dotenv.config();

interface ISettings {
  MONGO_URI: string;
  PORT: string;
  JWT_SECRET: string;
  JWT_SECRET_EXPIRES: string;
}

const settings: ISettings = {
  MONGO_URI: process.env.MONGO_URI as string,
  PORT: process.env.PORT as string,
  JWT_SECRET: process.env.JWT_SECRET as string,
  JWT_SECRET_EXPIRES: process.env.JWT_SECRET_EXPIRES as string,
};

console.log(settings);

export default settings;
