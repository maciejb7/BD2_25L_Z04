import path from "path";
import fs from "fs";
import winston from "winston";
import "winston-daily-rotate-file";
import { DateTime } from "luxon";

/**
 * Winston logger configuration
 */

// Ensure logs directory exists
const logDirectory = path.resolve("logs");
if (!fs.existsSync(logDirectory)) {
  fs.mkdirSync(logDirectory);
}

const dailyRotateFileTransport = new winston.transports.DailyRotateFile({
  filename: path.join(logDirectory, "clingclang-%DATE%.log"),
  datePattern: "YYYY-MM-DD",
  zippedArchive: true,
  maxSize: "20m",
  maxFiles: "14d",
  utc: true,
});

const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp({
      format: () => DateTime.utc().toISO(), // Use UTC timestamps
    }),
    winston.format.json(), // Output logs in JSON format
  ),
  defaultMeta: { service: "clingclang-server" },
  transports: [
    new winston.transports.File({
      filename: path.join(logDirectory, "error.log"),
      level: "error",
    }),
    new winston.transports.File({
      filename: path.join(logDirectory, "combined.log"),
    }),
    dailyRotateFileTransport, // Daily rotating log files
  ],
});

if (process.env.LOGS_WINSTON_CONSOLE === "true") {
  logger.add(
    new winston.transports.Console({
      level: "debug",
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.timestamp({
          format: () => DateTime.utc().toISO(), // Ensure timestamp is in UTC
        }),
        winston.format.printf(({ timestamp, level, message, ...meta }) => {
          return `${timestamp} ${level}: ${message} ${Object.keys(meta).length ? JSON.stringify(meta) : ""}`;
        }),
      ),
    }),
  );
}

export default logger;
