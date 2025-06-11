import sharp from "sharp";
import { FileUploadError } from "../errors/errors";
import path from "path";
import fs from "fs";
import { services } from "../constants/services";

export const avatarsPath = path.join(
  __dirname,
  "..",
  "..",
  "uploads",
  "avatars",
);

/**
 * Returns the path to the user's avatar image.
 * @param userId - The ID of the user.
 * @returns The path to the user's avatar image.
 */
const getUserAvatarPath = (userId: string): string => {
  return path.join(avatarsPath, `${userId}.jpg`);
};

/**
 * Checks if the user's avatar image exists and returns its path if it does.
 * @param userId - The ID of the user.
 * @returns The path to the user's avatar image if it exists, otherwise null.
 */
const getUserAvatarPathVerified = (userId: string): string | null => {
  const avatarFilePath = getUserAvatarPath(userId);
  return fs.existsSync(avatarFilePath) ? avatarFilePath : null;
};

/**
 * Checks if the uploaded image has the correct size.
 * @param file - The uploaded image file.
 * @param metaData - Optional metadata for error handling, such as service name and nickname.
 * @param minWidth - Minimum width of the image.
 * @param minHeight - Minimum height of the image.
 * @param maxWidth - Maximum width of the image.
 * @param maxHeight - Maximum height of the image.
 * @param square - Whether the image should be square (width must equal height).
 */
const checkIfImageHasCorrectSize = async (
  file: Express.Multer.File,
  metaData: Record<string, unknown> = {
    service: services.checkIfImageHasCorrectSize,
  },
  minWidth = 256,
  minHeight = 256,
  maxWidth = 1024,
  maxHeight = 1024,
  square: boolean = false,
) => {
  const imageMetadata = await sharp(file.buffer).metadata();
  const width = imageMetadata.width ?? 0;
  const height = imageMetadata.height ?? 0;

  if (width < minWidth || height < minHeight) {
    throw new FileUploadError({
      message: `Obraz jest zbyt mały. Minimalny rozmiar to ${minWidth}x${minHeight} pikseli.`,
      metaData: {
        ...metaData,
        width: width,
        height: height,
        minWidth: minWidth,
        minHeight: minHeight,
        maxWidth: maxWidth,
        maxHeight: maxHeight,
      },
      loggerMessage: "Obraz jest zbyt mały.",
      statusCode: 400,
    });
  }
  if (width > maxWidth || height > maxHeight) {
    throw new FileUploadError({
      message: `Obraz jest zbyt duży. Maksymalny rozmiar to ${maxWidth}x${maxHeight} pikseli.`,
      metaData: {
        ...metaData,
        width: width,
        height: height,
        minWidth: minWidth,
        minHeight: minHeight,
        maxWidth: maxWidth,
        maxHeight: maxHeight,
      },
      loggerMessage: "Obraz jest zbyt duży.",
    });
  }
  if (square && width !== height) {
    throw new FileUploadError({
      message: "Obraz musi być kwadratowy.",
      metaData: {
        ...metaData,
        width: width,
        height: height,
      },
      loggerMessage: "Obraz musi być kwadratowy.",
    });
  }
};

export const FileService = {
  getUserAvatarPath,
  getUserAvatarPathVerified,
  checkIfImageHasCorrectSize,
};
