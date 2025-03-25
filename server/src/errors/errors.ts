export class APIError extends Error {
  statusCode: number;
  loggerMessage: string;
  constructor(message: string, statusCode: number, loggerMessage = "") {
    super(message);
    this.statusCode = statusCode;
    this.loggerMessage = loggerMessage;
  }
}

export class FieldValidationError extends APIError {}

export class UserAlreadyExistsError extends APIError {}

export class UserNotFoundError extends APIError {}

export class InvalidPasswordError extends APIError {}
