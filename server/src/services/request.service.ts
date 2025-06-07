import { Request } from "express";
import {
  FieldValidationError,
  NoAuthenticationError,
  NoRefreshTokenError,
} from "../errors/errors";
import { AuthenticatedUserPayload } from "../middlewares/auth.middleware";
import { Validator } from "../types/validators";
import { services } from "../constants/services";

/**
 * Extracts the authenticated user payload from the request object.
 *
 * @param request - The Express request object containing user information.
 * @param metaData - Optional metadata for error handling, defaults to the service name.
 * @returns An object containing the authenticated user's ID, nickname, and role.
 * @throws NoAuthenticationError if the user is not authenticated.
 */
const extractAuthenticatedUserPayload = (
  request: Request,
  metaData: Record<string, unknown> = {
    service: services.extractUserPayload,
  },
): AuthenticatedUserPayload => {
  if (
    !request.user ||
    !request.user.userId ||
    !request.user.userNickname ||
    !request.user.userRole
  )
    throw new NoAuthenticationError({ metaData: metaData });
  return {
    userId: request.user.userId,
    userNickname: request.user.userNickname,
    userRole: request.user.userRole,
  };
};

/**
 * Extracts a path parameter from the request object and validates it.
 * @param request - The Express request object containing the path parameters.
 * @param name - The name of the path parameter to extract.
 * @param metaData - Optional metadata for error handling, defaults to the service name.
 * @param validator - An optional validator function to validate the extracted parameter.
 * @returns A promise that resolves to the extracted path parameter as a string.
 * @throws FieldValidationError if the path parameter is missing or validation fails.
 */
const extractPathParameter = async (
  request: Request,
  name: string,
  metaData: Record<string, unknown> = {
    service: services.extractPathParameter,
  },
  validator?: Validator,
): Promise<string> => {
  const value = request.params[name];

  if (value === undefined || value === null || value === "") {
    throw new FieldValidationError({
      message: `Parametr ${name} jest wymagane w tym żądaniu.`,
      statusCode: 400,
      metaData: {
        ...metaData,
        field: name,
      },
      loggerMessage: `Użytkownik nie podał wymaganego parametru ścieżki ${name}.`,
    });
  }

  if (validator && validator[name as string]) {
    await validator[name as string](value);
  }

  return value;
};

/**
 * Extracts the refresh token from the request cookies.
 * @param request - The Express request object containing cookies.
 * @param metaData - Optional metadata for error handling, defaults to the service name.
 * @returns The refresh token as a string.
 * @throws NoRefreshTokenError if the refresh token is not found in the cookies.
 */
const extractRefreshToken = (
  request: Request,
  metaData = { service: services.extractToken },
): string => {
  const refreshToken = request.cookies?.refreshToken;

  if (!refreshToken)
    throw new NoRefreshTokenError({
      metaData: metaData,
    });

  return refreshToken;
};

/**
 * Extracts specified fields from the request body and validates them.
 * @param requestBody - The request body containing the fields to extract.
 * @param requestFields - An array of field names to extract from the request body.
 * @param metaData - Optional metadata for error handling, defaults to the service name.
 * @param validator - An optional validator function to validate the extracted fields.
 * @returns A promise that resolves to an object containing the extracted fields.
 * @throws FieldValidationError if any of the required fields are missing or validation fails.
 */
const extractRequestFields = async <T>(
  requestBody: Record<string, string>,
  requestFields: (keyof T)[],
  metaData = {
    service: services.extractFields,
  },
  validator?: Validator,
): Promise<T> => {
  const entries = await Promise.all(
    requestFields.map(async (field) => {
      const value = requestBody[field as string];

      if (value === undefined || value === null || value === "") {
        throw new FieldValidationError({
          message: `Pole ${field as string} jest wymagane w tym żądaniu.`,
          statusCode: 400,
          metaData: {
            ...metaData,
            field: field as string,
          },
          loggerMessage: `Użytkownik nie podał wymaganego pola ${field as string}.`,
        });
      }

      const trimmedValue = value.trim();

      if (validator && validator[field as string]) {
        await validator[field as string](trimmedValue);
      }

      return [field, trimmedValue];
    }),
  );

  return Object.fromEntries(entries) as T;
};

export const RequestService = {
  extractAuthenticatedUserPayload,
  extractPathParameter,
  extractRefreshToken,
  extractRequestFields,
};
