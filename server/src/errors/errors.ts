interface ApiErrorOptions {
  message?: string;
  statusCode?: number;
  metaData?: Record<string, unknown>;
  loggerMessage?: string;
}

export class ApiError extends Error {
  statusCode: number;
  metaData: Record<string, unknown>;
  loggerMessage: string;

  constructor({
    message = "Wystąpił nieoczekiwany błąd podczas przetwarzania żądania.",
    statusCode = 500,
    metaData = {},
    loggerMessage = "Wystąpił nieoczekiwany błąd podczas przetwarzania żądania.",
  }: ApiErrorOptions) {
    super(message);
    this.statusCode = statusCode;
    this.metaData = metaData;
    this.loggerMessage = loggerMessage;
  }
}

export class NoAuthenticationError extends ApiError {
  constructor(options: ApiErrorOptions = {}) {
    super({
      ...options,
      statusCode: 401,
      message: options.message ?? "Brak autoryzacji.",
      loggerMessage:
        options.loggerMessage ??
        "Brak autoryzacji - niezabezpieczony endpoint, który powinien być zabezpieczony.",
    });
  }
}

export class FieldValidationError extends ApiError {
  constructor(options: ApiErrorOptions = {}) {
    super({
      ...options,
      statusCode: 400,
      message: options.message ?? "Błąd walidacji danych.",
      loggerMessage: options.loggerMessage ?? "Błąd walidacji danych.",
    });
  }
}

export class UserAlreadyExistsByNicknameError extends ApiError {
  constructor(options: ApiErrorOptions = {}) {
    super({
      ...options,
      statusCode: 409,
      message: options.message ?? "Użytkownik o podanym nicku już istnieje.",
      loggerMessage:
        options.loggerMessage ?? "Użytkownik o podanym nicku już istnieje.",
    });
  }
}

export class UserAlreadyExistsByEmailError extends ApiError {
  constructor(options: ApiErrorOptions = {}) {
    super({
      ...options,
      statusCode: 409,
      message:
        options.message ?? "Użytkownik o podanym adresie e-mail już istnieje.",
      loggerMessage:
        options.loggerMessage ??
        "Użytkownik o podanym adresie e-mail już istnieje.",
    });
  }
}

export class UserNotFoundError extends ApiError {
  constructor(options: ApiErrorOptions = {}) {
    super({
      ...options,
      statusCode: 404,
      message: options.message ?? "Nie znaleziono użytkownika.",
      loggerMessage: options.loggerMessage ?? "Nie znaleziono użytkownika.",
    });
  }
}

export class InvalidPasswordError extends ApiError {
  constructor(options: ApiErrorOptions = {}) {
    super({
      ...options,
      statusCode: 401,
      message: options.message ?? "Nieprawidłowe hasło.",
      loggerMessage: options.loggerMessage ?? "Nieprawidłowe hasło.",
    });
  }
}

export class NoRefreshTokenError extends ApiError {
  constructor(options: ApiErrorOptions = {}) {
    super({
      ...options,
      statusCode: 401,
      message:
        options.message ?? "Nie jesteś zalogowany. Brak tokenu odświeżającego.",
      loggerMessage: options.loggerMessage ?? `Brak tokenu odświeżającego.`,
    });
  }
}

export class InvalidRefreshTokenError extends ApiError {
  constructor(options: ApiErrorOptions = {}) {
    super({
      ...options,
      statusCode: 401,
      message: options.message ?? "Nie znaleziono sesji. Zaloguj się ponownie.",
      loggerMessage:
        options.loggerMessage ?? "Nieprawidłowy token odświeżający.",
    });
  }
}

export class ExpiredRefreshTokenError extends ApiError {
  constructor(options: ApiErrorOptions = {}) {
    super({
      ...options,
      statusCode: 401,
      message: options.message ?? "Twoja sesja wygasła. Zaloguj się ponownie.",
      loggerMessage: options.loggerMessage ?? "Token odświeżający wygasł.",
    });
  }
}

export class FileUploadError extends ApiError {
  constructor(options: ApiErrorOptions = {}) {
    super({
      ...options,
      statusCode: 400,
      message: options.message ?? "Błąd przesyłania pliku.",
      loggerMessage: options.loggerMessage ?? "Błąd przesyłania pliku.",
    });
  }
}
