import { NextFunction, Request, Response } from "express";
import { ApiError } from "../errors/errors";
import logger from "../logger";

/**
 * Global error handler. Handles errors thrown in all controllers logs them and returns a response to the client.
 */
export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (error instanceof ApiError) {
    // Clean up metaData by removing empty strings
    const filteredMetaData = Object.fromEntries(
      Object.entries(error.options.metaData ?? {}).filter(
        ([, value]) => value !== "" && value !== undefined,
      ),
    );

    if (error.options.makeLog)
      logger.error(
        error.options.loggerMessage ??
          "Wystąpił błąd podczas przetwarzania żądania.",
        filteredMetaData,
      );

    res.status(error.options.statusCode ?? 500).json({
      message: error.message,
    });

    return;
  }

  logger.error("Wystąpił błąd serwera podczas przetwarzania żądania: ", error);

  res.status(500).json({
    message: error.message,
  });
};
