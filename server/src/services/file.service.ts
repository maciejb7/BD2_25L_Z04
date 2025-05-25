import sharp from "sharp";
import { FileUploadError } from "../errors/errors";
import path from "path";
import fs from "fs";

export const avatarsPath = path.join(
  __dirname,
  "..",
  "..",
  "uploads",
  "avatars",
);

export class FileService {
  static async hasImageCorrectSize(
    file: Express.Multer.File,
    minWidth = 256,
    minHeight = 256,
    maxWidth = 1024,
    maxHeight = 1024,
    square: boolean = false,
  ): Promise<void> {
    const imageMetadata = await sharp(file.buffer).metadata();
    const width = imageMetadata.width ?? 0;
    const height = imageMetadata.height ?? 0;

    if (width < minWidth || height < minHeight) {
      throw new FileUploadError(
        `Obraz jest zbyt mały. Minimalny rozmiar to ${minWidth}x${minHeight} pikseli.`,
        400,
      );
    }
    if (width > maxWidth || height > maxHeight) {
      throw new FileUploadError(
        `Obraz jest zbyt duży. Maksymalny rozmiar to ${maxWidth}x${maxHeight} pikseli.`,
        400,
      );
    }
    if (square && width !== height) {
      throw new FileUploadError(`Obraz musi być kwadratowy.`, 400);
    }
  }

  static getUserAvatarPath(userId: string): string {
    return path.join(avatarsPath, `${userId}.jpg`);
  }

  static getUserAvatar(userId: string): string | null {
    const avatarFilePath = this.getUserAvatarPath(userId);
    return fs.existsSync(avatarFilePath) ? avatarFilePath : null;
  }
}
