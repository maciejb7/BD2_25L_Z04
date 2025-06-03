import multer, { FileFilterCallback, StorageEngine } from "multer";
import { Request, Response, NextFunction, RequestHandler } from "express";
import { FileUploadError } from "../errors/errors";
import logger from "../logger";

interface FileMiddlewareOptions {
  formField: string;
  maxSizeMB?: number;
  allowedMimeTypes?: string[];
  storage?: StorageEngine;
}

/**
 * Middleware for handling file uploads using multer.
 * Validates file type and size, and handles errors.
 * Use only after "authenticateUser" middleware.
 * @param options - Configuration options for the middleware.
 * @returns Middleware function for handling file uploads.
 */
export const uploadSingleFile = (
  options: FileMiddlewareOptions,
): RequestHandler => {
  const {
    formField,
    maxSizeMB = 5,
    allowedMimeTypes = ["image/jpeg", "image/png"],
    storage = multer.memoryStorage(),
  } = options;

  const upload = multer({
    storage,
    limits: {
      fileSize: maxSizeMB * 1024 * 1024,
    },
    fileFilter: (req, file, cb: FileFilterCallback) => {
      const nickname = req.user?.userNickname ?? "unknown";
      const formField = file.fieldname;

      if (!allowedMimeTypes.includes(file.mimetype)) {
        const error = new FileUploadError({
          message: "Niedozwolony typ pliku.",
          metaData: {
            service: "file_upload",
            nickname: nickname,
            formField: formField,
            mimetype: file.mimetype,
            loggerMessage:
              "Błąd przy uploadowaniu pliku: Niedozwolony typ pliku.",
          },
          statusCode: 400,
        });

        return cb(error);
      }

      cb(null, true);
    },
  }).single(formField);

  return (req: Request, res: Response, next: NextFunction) => {
    const nickname = req.user?.userNickname;

    upload(req, res, (error) => {
      if (error instanceof FileUploadError) {
        logger.error(error.loggerMessage, {
          ...error.metaData,
        });

        return res.status(error.statusCode).json({ message: error.message });
      }

      if (error instanceof multer.MulterError) {
        if (error.code === "LIMIT_FILE_SIZE") {
          const sizeLimit = `${maxSizeMB}MB`;

          logger.error("Plik przekracza maksymalny rozmiar.", {
            service: "file-upload",
            nickname: nickname,
            formField: formField,
            limit: sizeLimit,
          });

          return res.status(400).json({
            message: `Plik jest zbyt duży. Maksymalny rozmiar to ${sizeLimit}.`,
          });
        }

        logger.error("Błąd przy uploadzie pliku (multer): ", error, {
          service: "file-upload",
          nickname: nickname,
          formField: formField,
        });

        return res.status(500).json({
          message: `Wystąpił nieznany błąd podczas przesyłania pliku. Skontaktuj się z administratorem.`,
        });
      }

      if (error) {
        logger.error("Błąd przy uploadzie pliku: ", error, {
          service: "file-upload",
          nickname: nickname,
          formField: formField,
        });

        return res.status(500).json({
          message:
            "Wystąpił nieznany błąd podczas przesyłania pliku. Skontaktuj się z administratorem.",
        });
      }

      if (!req.file) {
        logger.error("Nie przesłano pliku do uploadu pomimo takiego wymogu.", {
          service: "file-upload",
          formField: formField,
          nickname: nickname,
        });

        return res.status(400).json({
          message: "Nie przesłano żadnego pliku. Spróbuj ponownie.",
        });
      }

      next();
    });
  };
};

export const FileMiddleware = {
  uploadSingleFile,
};
