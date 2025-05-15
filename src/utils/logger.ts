import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define colors for each level
const colors = {
  error: "red",
  warn: "yellow",
  info: "green",
  http: "magenta",
  debug: "white",
};

// Add colors to winston
winston.addColors(colors);

// Define log format
const format = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss:ms" }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`
  )
);

// Define file transport for rotating logs
const fileRotateTransport = new DailyRotateFile({
  filename: "logs/application-%DATE%.log",
  datePattern: "YYYY-MM-DD",
  maxSize: "20m",
  maxFiles: "14d",
  format: winston.format.combine(
    winston.format.uncolorize(),
    winston.format.json()
  ),
});

// Create the logger
const logger = winston.createLogger({
  level: process.env.NODE_ENV === "development" ? "debug" : "info",
  levels,
  format,
  transports: [new winston.transports.Console(), fileRotateTransport],
});

// Create a stream object for Morgan integration
export const stream = {
  write: (message: string) => {
    logger.http(message.trim());
  },
};

export default logger;
