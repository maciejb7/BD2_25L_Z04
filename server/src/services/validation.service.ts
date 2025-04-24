import { EnumLike, z } from "zod";
import { FieldValidationError } from "../errors/errors";
import { DateTime } from "luxon";

/**
 * Service for validating user input.
 */
export class ValidationService {
  /**
   * Validates a string field that must match an enum.
   * @param value The value to validate.
   * @param enumObj The enum object to match the given value.
   * @param fieldName The name of the field.
   * @throws FieldValidationError if the validation fails.
   * @returns void
   */
  static doesStringFieldMatchesEnum(
    value: string,
    enumObj: EnumLike,
    fieldName: string,
  ): void {
    const enumSchema = z.nativeEnum(enumObj);
    const validationResult = enumSchema.safeParse(value);

    if (!validationResult.success) {
      throw new FieldValidationError(
        `Pole ${fieldName} musi być jednym z: ${Object.values(enumObj).join(", ")}.`,
        400,
      );
    }
  }

  /**
   * Validates a string field.
   * @param value The value to validate.
   * @param fieldName The name of the field.
   * @param minLength The minimum length of the field.
   * @param maxLength The maximum length of the field.
   * @throws FieldValidationError if the validation fails.
   * @returns void
   */
  static isStringFieldValid(
    value: string,
    fieldName: string,
    minLength = 1,
    maxLength = 500,
  ): void {
    const fieldSchema = z
      .string()
      .nonempty({
        message: `Pole ${fieldName} nie może być puste.`,
      })
      .min(minLength, {
        message: `Pole ${fieldName} musi mieć co najmniej ${minLength} znaków.`,
      })
      .regex(/^\S*$/, {
        message: `Pole ${fieldName} nie może zawierać spacji.`,
      })
      .max(maxLength, {
        message: `Pole ${fieldName} nie może mieć więcej niż ${maxLength} znaków.`,
      });

    const validationResult = fieldSchema.safeParse(value);

    if (!validationResult.success) {
      throw new FieldValidationError(
        validationResult.error.errors[0].message,
        400,
      );
    }
  }
  /**
   * Validates an email.
   * @param email The email to validate.
   * @throws FieldValidationError if the validation fails.
   * @returns void
   */
  static isEmailValid(email: string): void {
    const emailSchema = z
      .string()
      .nonempty({ message: "Email nie może być pusty." })
      .regex(/^\S*$/, { message: "Email nie może zawierać spacji." })
      .email({ message: "Email jest niepoprawny." });

    const validationResult = emailSchema.safeParse(email);

    if (!validationResult.success) {
      throw new FieldValidationError(
        validationResult.error.errors[0].message,
        400,
      );
    }
  }

  /**
   * Validates a password.
   * @param password The password to validate.
   * @throws FieldValidationError if the validation fails.
   * @returns void
   */
  static isPasswordValid(password: string): void {
    const passwordSchema = z
      .string()
      .nonempty({
        message: "Hasło nie może być puste.",
      })
      .min(8, { message: "Hasło musi mieć co najmniej 8 znaków." })
      .regex(/^\S*$/, { message: "Hasło nie może zawierać spacji." })
      .regex(/[a-z]/, { message: "Hasło musi zawierać małą literę." })
      .regex(/[A-Z]/, { message: "Hasło musi zawierać dużą literę." })
      .regex(/[0-9]/, { message: "Hasło musi zawierać cyfrę." })
      .regex(/[!@#$%^&*()_\-+={}[\]:;"'<>,.?/~`|\\]/, {
        message: "Hasło musi zawierać znak specjalny.",
      })
      .max(50, { message: "Hasło nie może mieć więcej niż 50 znaków." });

    const validationResult = passwordSchema.safeParse(password);

    if (!validationResult.success) {
      throw new FieldValidationError(
        validationResult.error.errors[0].message,
        400,
      );
    }
  }

  static isDateValid(date: string): DateTime {
    const dateSchema = z
      .string()
      .nonempty({
        message: "Data nie może być pusta.",
      })
      .regex(/^\d{4}-\d{2}-\d{2}$/, {
        message: "Data musi być w formacie YYYY-MM-DD.",
      });

    const formatValidation = dateSchema.safeParse(date);
    if (!formatValidation.success) {
      throw new FieldValidationError(
        formatValidation.error.errors[0].message,
        400,
      );
    }

    const parsedDate = DateTime.fromISO(date);

    if (!parsedDate.isValid) {
      throw new FieldValidationError(
        `Nieprawidłowa data: ${parsedDate.invalidExplanation || "Format daty jest niepoprawny."}`,
        400,
      );
    }

    return parsedDate;
  }

  static isBirthDateValid(
    birthDate: DateTime,
    yearsMin: number,
    yearsMax: number,
  ): void {
    const today = DateTime.now();
    const oldestDate = today.minus({ years: yearsMax });
    const youngestDate = today.minus({ years: yearsMin });

    if (birthDate > today) {
      throw new FieldValidationError(
        "Data urodzenia nie może być w przyszłości.",
        400,
      );
    }

    if (birthDate <= oldestDate) {
      throw new FieldValidationError(
        `Nie możesz mieć więcej niż ${yearsMax} lat.`,
        400,
      );
    }

    if (birthDate >= youngestDate) {
      throw new FieldValidationError(
        `Musisz mieć co najmniej ${yearsMin} lat.`,
        400,
      );
    }
  }
}
