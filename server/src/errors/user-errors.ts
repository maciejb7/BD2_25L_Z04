export class UserNotFoundError extends Error {
  constructor(message = "Nie znaleziono użytkownika.") {
    super(message);
  }
}
