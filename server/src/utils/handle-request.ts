import { Request, Response, NextFunction } from "express";

/**
 * Wrapper for handling asynchronous request handlers in Express in order to catch errors and pass them to the next middleware.
 * @param func - The asynchronous function to handle the request.
 * @returns A function that takes a request, response, and next function,
 */
export const handleRequest = (
  func: (req: Request, res: Response, next: NextFunction) => Promise<void>,
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    func(req, res, next).catch(next);
  };
};
