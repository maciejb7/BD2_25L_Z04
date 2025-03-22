export class InvalidRefreshTokenError extends Error {
  constructor(message = "Nieprawidłowy Refresh Token.") {
    super(message);
  }
}

export class ExpiredRefreshTokenError extends Error {
  constructor(message = "Refresh Token wygasł.") {
    super(message);
  }
}
