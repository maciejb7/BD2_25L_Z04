export class InvalidSessionError extends Error {
  constructor(message = "Twoja sesja jest nieprawidłowa.") {
    super(message);
  }
}

export class ExpiredSessionError extends Error {
  constructor(message = "Twoja sesja wygasła. Zaloguj się ponownie.") {
    super(message);
  }
}
