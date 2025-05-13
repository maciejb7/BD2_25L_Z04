/**
 * Basic class for all API errors.
 * Gives possibility to add a status code and meta data to the error,
 * which can be used with response or logger.
 */
export class APIError extends Error {
  statusCode: number;
  metaData: Record<string, unknown>;
  constructor(
    message: string,
    statusCode: number,
    metaData: Record<string, unknown> = {},
  ) {
    super(message);
    this.statusCode = statusCode;
    this.metaData = metaData;
  }
}

export class FieldValidationError extends APIError {}

export class UserAlreadyExistsError extends APIError {}

export class UserNotFoundError extends APIError {}

export class InvalidPasswordError extends APIError {}

export class NoRefreshTokenError extends APIError {}

export class InvalidRefreshTokenError extends APIError {}

export class ExpiredRefreshTokenError extends APIError {}

export class NoPermissionsError extends APIError {}
