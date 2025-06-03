import sharp from "sharp";
import { FileUploadError } from "../errors/errors";
import path from "path";
import fs from "fs";
import { emptyMetaData } from "../types/others";
import { loggerMessages } from "../errors/loggerMessages";

export const avatarsPath = path.join(
  __dirname,
  "..",
  "..",
  "uploads",
  "avatars",
);

export const getUserAvatarPath = (userId: string): string => {
  return path.join(avatarsPath, `${userId}.jpg`);
};

export const getUserAvatarPathVerified = (userId: string): string | null => {
  const avatarFilePath = getUserAvatarPath(userId);
  return fs.existsSync(avatarFilePath) ? avatarFilePath : null;
};

export const checkIfImageHasCorrectSize = async (
  file: Express.Multer.File,
  metaData = emptyMetaData,
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
      loggerMessage: `${loggerMessages(metaData.service)}: Obraz jest zbyt mały.`,
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
      loggerMessage: `${loggerMessages(metaData.service)}: Obraz jest zbyt duży.`,
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
      loggerMessage: `${loggerMessages(metaData.service)}: Obraz musi być kwadratowy.`,
    });
  }
};
