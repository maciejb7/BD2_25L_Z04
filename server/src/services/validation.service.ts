import { z } from "zod";

/**
 * Service for validating user input.
 */
export class ValidationService {
  /**
   * Validates a string field.
   * @param value The value to validate.
   * @param fieldName The name of the field.
   * @param minLength The minimum length of the field.
   * @param maxLength The maximum length of the field.
   * @returns True if the field is valid, otherwise an error message.
   */
  static isStringFieldValid(
    value: string,
    fieldName: string,
    minLength: number,
    maxLength: number,
  ): boolean | string {
    const fieldSchema = z
      .string()
      .nonempty({
        message: `Pole "${fieldName}" nie może być puste.`,
      })
      .min(minLength, {
        message: `Pole "${fieldName}" musi mieć co najmniej ${minLength} znaków.`,
      })
      .regex(/^\S*$/, {
        message: `Pole ${fieldName} nie może zawierać spacji.`,
      })
      .max(maxLength, {
        message: `Pole "${fieldName}" nie może mieć więcej niż ${maxLength} znaków.`,
      });

    const validationResult = fieldSchema.safeParse(value);

    if (validationResult.success) {
      return true;
    } else {
      return validationResult.error.errors[0].message;
    }
  }
  /**
   * Validates an email.
   * @param email The email to validate.
   * @returns True if the email is valid, otherwise an error message.
   */
  static isEmailValid(email: string): boolean | string {
    const emailSchema = z
      .string()
      .nonempty({ message: "Email nie może być pusty." })
      .regex(/^\S*$/, { message: "Email nie może zawierać spacji." })
      .email({ message: "Email jest niepoprawny." });

    const validationResult = emailSchema.safeParse(email);

    if (validationResult.success) {
      return true;
    } else {
      return validationResult.error.errors[0].message;
    }
  }

  /**
   * Validates a password.
   * @param password The password to validate.
   * @returns True if the password is valid, otherwise an error message.
   */
  static isPasswordValid(password: string): boolean | string {
    const passwordSchema = z
      .string()
      .nonempty({
        message: 'Pole "Hasło" nie może być puste.',
      })
      .min(8, { message: "Hasło musi mieć co najmniej 8 znaków." })
      .regex(/^\S*$/, { message: "Hasło nie może zawierać spacji." })
      .regex(/[a-z]/, { message: "Hasło musi zawierać małą literę." })
      .regex(/[A-Z]/, { message: "Hasło musi zawierać dużą literę." })
      .regex(/[0-9]/, { message: "Hasło musi zawierać cyfrę." })
      .regex(/[!@#$%^&*()_\-+={}[\]:;"'<>,.?/~`|\\]/, {
        message: "Hasło musi zawierać znak specjalny",
      })
      .max(50, { message: "Hasło nie może mieć więcej niż 50 znaków." });

    const validationResult = passwordSchema.safeParse(password);

    if (validationResult.success) {
      return true;
    } else {
      return validationResult.error.errors[0].message;
    }
  }
}
