import { Request, Response, NextFunction } from "express";
import { ApiError } from "../errors/errors";
import logger from "../logger";

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (error instanceof ApiError) {
    // Clean up metaData by removing empty strings
    const filteredMetaData = Object.fromEntries(
      Object.entries(error.metaData).filter(([, value]) => value !== ""),
    );
    logger.error(error.loggerMessage, filteredMetaData);

    res.status(error.statusCode).json({
      message: error.message,
    });

    return;
  }

  logger.error("Nieoczekiwany błąd serwera", error);

  res.status(500).json({
    message: error.message,
  });
};
