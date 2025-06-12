import { getloggerMessage } from "../constants/loggerMessages";
import { services } from "../constants/services";

interface ApiErrorOptions {
  message?: string;
  statusCode?: number;
  metaData?: Record<string, unknown>;
  makeLog?: boolean;
  loggerMessage?: string;
}

const buildLoggerMessage = (
  metaData?: Record<string, unknown>,
  message?: string,
): string => {
  const service =
    typeof metaData?.service === "string" ? metaData.service : undefined;
  return `${getloggerMessage(service)}: ${message ?? "Wystąpił nieoczekiwany błąd podczas przetwarzania żądania."}`;
};

export class ApiError extends Error {
  options: ApiErrorOptions;
  constructor({
    message = "Wystąpił nieoczekiwany błąd podczas przetwarzania żądania.",
    statusCode = 500,
    metaData = { service: services.default },
    makeLog = true,
    loggerMessage = buildLoggerMessage(metaData),
  }: ApiErrorOptions) {
    super(message);
    this.options = {
      message,
      statusCode,
      metaData,
      makeLog,
      loggerMessage,
    };
  }
}

export class NoAuthenticationError extends ApiError {
  constructor(options: ApiErrorOptions = {}) {
    super({
      ...options,
      statusCode: options.statusCode ?? 401,
      message: options.message ?? "Brak autoryzacji.",
      loggerMessage: buildLoggerMessage(
        options.metaData,
        options.loggerMessage ??
          "Użytkownik próbuje uzyskać dostęp do endpointu bez autoryzacji, endpoint pomimo, że powinien jest niezabezpieczony przez middleware.",
      ),
    });
  }
}

export class FieldValidationError extends ApiError {
  constructor(options: ApiErrorOptions = {}) {
    super({
      ...options,
      statusCode: options.statusCode ?? 400,
      message:
        options.message ??
        "Błąd walidacji danych podczas przetwarzania żądania.",
      loggerMessage: buildLoggerMessage(
        options.metaData,
        options.loggerMessage ??
          "Wystąpił błąd walidacji danych podczas przetwarzania żądania. ",
      ),
    });
  }
}

export class UserAlreadyExistsByNicknameError extends ApiError {
  constructor(options: ApiErrorOptions = {}) {
    super({
      ...options,
      statusCode: options.statusCode ?? 409,
      message: options.message ?? "Użytkownik o podanym nicku już istnieje.",
      loggerMessage: buildLoggerMessage(
        options.metaData,
        options.loggerMessage ?? "Użytkownik o podanym nicku już istnieje.",
      ),
    });
  }
}

export class UserAlreadyExistsByEmailError extends ApiError {
  constructor(options: ApiErrorOptions = {}) {
    super({
      ...options,
      statusCode: options.statusCode ?? 409,
      message:
        options.message ?? "Użytkownik o podanym adresie e-mail już istnieje.",
      loggerMessage: buildLoggerMessage(
        options.metaData,
        options.loggerMessage ??
          "Użytkownik o podanym adresie e-mail już istnieje.",
      ),
    });
  }
}

export class UserNotFoundError extends ApiError {
  constructor(options: ApiErrorOptions = {}) {
    super({
      ...options,
      statusCode: options.statusCode ?? 404,
      message: options.message ?? "Nie znaleziono użytkownika.",
      loggerMessage: buildLoggerMessage(
        options.metaData,
        options.loggerMessage ??
          "Nie można znaleźć użytkownika - nie istnieje.",
      ),
    });
  }
}

export class UserAvatarNotFoundError extends ApiError {
  constructor(options: ApiErrorOptions = {}) {
    super({
      ...options,
      statusCode: 404,
      message:
        options.message ?? "Nie znaleziono zdjęcia profilowego użytkownika.",
      loggerMessage: buildLoggerMessage(
        options.metaData,
        options.loggerMessage ??
          "Nie można znaleźć zdjęcia profilowego użytkownika - nie istnieje.",
      ),
    });
  }
}

export class UserNotActiveError extends ApiError {
  constructor(options: ApiErrorOptions = {}) {
    super({
      ...options,
      statusCode: 403,
      message:
        options.message ??
        "Twoje konto jest nieaktywne. Aktywuj je, aby się zalogować.",
      loggerMessage: buildLoggerMessage(
        options.metaData,
        options.loggerMessage ??
          "Użytkownik próbuje uzyskać dostęp do endpointu, ale jego konto jest nieaktywne.",
      ),
    });
  }
}

export class InvalidPasswordError extends ApiError {
  constructor(options: ApiErrorOptions = {}) {
    super({
      ...options,
      statusCode: options.statusCode ?? 401,
      message: options.message ?? "Nieprawidłowe hasło.",
      loggerMessage: buildLoggerMessage(
        options.metaData,
        options.loggerMessage ?? "Użytkownik podał nieprawidłowe hasło.",
      ),
    });
  }
}

export class NoRefreshTokenError extends ApiError {
  constructor(options: ApiErrorOptions = {}) {
    super({
      ...options,
      statusCode: options.statusCode ?? 401,
      message: "Nie jesteś zalogowany. Zaloguj się ponownie.",
      loggerMessage: buildLoggerMessage(
        options.metaData,
        options.loggerMessage ??
          "W żądaniu użytkownika nie znaleziono wymaganego tokenu odświeżającego.",
      ),
    });
  }
}

export class InvalidRefreshTokenError extends ApiError {
  constructor(options: ApiErrorOptions = {}) {
    super({
      ...options,
      statusCode: options.statusCode ?? 401,
      message: options.message ?? "Nie znaleziono sesji. Zaloguj się ponownie.",
      loggerMessage: buildLoggerMessage(
        options.metaData,
        options.loggerMessage ??
          "W żądaniu użytkownika znaleziono nieprawidłowy lub nieistniejący token odświeżający.",
      ),
    });
  }
}

export class ExpiredRefreshTokenError extends ApiError {
  constructor(options: ApiErrorOptions = {}) {
    super({
      ...options,
      statusCode: options.statusCode ?? 401,
      message: options.message ?? "Twoja sesja wygasła. Zaloguj się ponownie.",
      loggerMessage: buildLoggerMessage(
        options.metaData,
        options.loggerMessage ??
          "W żądaniu użytkownika znaleziono wygasły token odświeżający.",
      ),
    });
  }
}

export class FileUploadError extends ApiError {
  constructor(options: ApiErrorOptions = {}) {
    super({
      ...options,
      statusCode: options.statusCode ?? 400,
      message: options.message ?? "Błąd przesyłania pliku.",
      loggerMessage: buildLoggerMessage(
        options.metaData,
        options.loggerMessage ?? "Wystąpił błąd podczas przesyłania pliku.",
      ),
    });
  }
}

export class ActivationLinkNotFoundError extends ApiError {
  constructor(options: ApiErrorOptions = {}) {
    super({
      ...options,
      statusCode: options.statusCode ?? 404,
      message: options.message ?? "Nie znaleziono linku aktywacyjnego.",
      loggerMessage: buildLoggerMessage(
        options.metaData,
        options.loggerMessage ??
          "Użytkownik próbuje aktywować konto, ale podany link aktywacyjny nie istnieje.",
      ),
    });
  }
}

export class ActivationLinkExpiredError extends ApiError {
  constructor(options: ApiErrorOptions = {}) {
    super({
      ...options,
      statusCode: options.statusCode ?? 400,
      message:
        options.message ??
        "Link aktywacyjny wygasł. Proszę zarejestrować się ponownie.",
      loggerMessage: buildLoggerMessage(
        options.metaData,
        options.loggerMessage ??
          "Użytkownik próbuje aktywować konto, ale link aktywacyjny wygasł.",
      ),
    });
  }
}

export class PasswordResetLinkNotFoundError extends ApiError {
  constructor(options: ApiErrorOptions = {}) {
    super({
      ...options,
      statusCode: options.statusCode ?? 404,
      message: options.message ?? "Nie znaleziono linku do resetu hasła.",
      loggerMessage: buildLoggerMessage(
        options.metaData,
        options.loggerMessage ??
          "Użytkownik próbuje zresetować swoje hasło, ale podany link nie istnieje.",
      ),
    });
  }
}

export class PasswordResetLinkExpiredError extends ApiError {
  constructor(options: ApiErrorOptions = {}) {
    super({
      ...options,
      statusCode: options.statusCode ?? 400,
      message: options.message ?? "Link do resetu hasła wygasł.",
      loggerMessage: buildLoggerMessage(
        options.metaData,
        options.loggerMessage ??
          "Użytkownik próbuje zresetować swoje hasło, ale link wygasł.",
      ),
    });
  }
}

export class ForbiddenActionError extends ApiError {
  constructor(options: ApiErrorOptions = {}) {
    super({
      ...options,
      statusCode: options.statusCode ?? 403,
      message: options.message ?? "Ta akcja jest niedozwolona.",
      loggerMessage: buildLoggerMessage(
        options.metaData,
        options.loggerMessage ??
          "Użytkownik próbuje wykonać akcję, która jest niedozwolona.",
      ),
    });
  }
}
