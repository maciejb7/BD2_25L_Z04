import { Request, Response, NextFunction } from "express";
import { ApiError } from "../errors/errors";
import logger from "../logger";

export function errorHandler(
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  if (error instanceof ApiError) {
    logger.error(error.loggerMessage, error.metaData);

    res.status(error.statusCode).json({
      message: error.message,
    });

    return;
  }

  logger.error("Nieoczekiwany błąd serwera", error);

  res.status(500).json({
    message: error.message,
  });
}
