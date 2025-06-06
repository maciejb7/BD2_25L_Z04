import { EnumLike, z } from "zod";
import { FieldValidationError } from "../errors/errors";
import { DateTime } from "luxon";
import { validationErrorLoggerMessages } from "../errors/loggerMessages";

/**
 * Capitalizes the first letter of a string.
 * @param string The string to capitalize.
 * @returns The capitalized string.
 */
export const capitalizeFirstLetter = (string: string): string => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

/**
 * Checks if a value matches a given enum.
 * @param name The name of the field being validated.
 * @param value The value to check against the enum.
 * @param enumObject The enum object to validate against.
 * @param metaData Additional metadata for error handling.
 * @throws {FieldValidationError} If the value does not match the enum.
 */
const checkIfValueMatchesEnum = (
  name: string,
  value: string,
  enumObject: EnumLike,
  metaData = { service: "" },
) => {
  name = capitalizeFirstLetter(name);
  const enumSchema = z.nativeEnum(enumObject);
  const isMatching = enumSchema.safeParse(value);

  if (!isMatching.success) {
    const errorMessage = `${name} musi mieć jedną z określonych wartości: ${Object.values(enumObject).join(", ")}.`;

    throw new FieldValidationError({
      message: errorMessage,
      metaData: { ...metaData, field: name, value: value },
      loggerMessage: `${validationErrorLoggerMessages(metaData.service)}: ${errorMessage}`,
    });
  }
};

/**
 * Validates a string value against various criteria.
 * @param name The name of the field being validated.
 * @param value The value to validate.
 * @param metaData Additional metadata for error handling.
 * @param minLength Minimum length of the string.
 * @param maxLength Maximum length of the string.
 * @param forbiddenNumbers Whether numbers are forbidden in the string.
 * @param forbiddenSpecialChars Whether special characters are forbidden in the string.
 * @throws {FieldValidationError} If the value does not meet validation criteria.
 */
const checkIfValueIsValid = (
  name: string,
  value: string,
  metaData = { service: "" },
  minLength = 1,
  maxLength = 500,
  forbiddenNumbers = false,
  forbiddenSpecialChars = false,
) => {
  name = capitalizeFirstLetter(name);
  let fieldSchema = z
    .string()
    .nonempty({
      message: `${name} nie może być puste.`,
    })
    .min(minLength, {
      message: `${name} musi mieć co najmniej ${minLength} znaków.`,
    })
    .regex(/^\S*$/, {
      message: `${name} nie może zawierać spacji.`,
    })
    .max(maxLength, {
      message: `${name} nie może mieć więcej niż ${maxLength} znaków.`,
    });

  if (forbiddenNumbers) {
    fieldSchema = fieldSchema.regex(/^[^\d]*$/, {
      message: `${name} nie może zawierać cyfr.`,
    });
  }

  if (forbiddenSpecialChars) {
    fieldSchema = fieldSchema.regex(
      /^[^!@#$%^&*()_\-+={}[\]:;"'<>,.?/~`|\\]*$/,
      {
        message: `${name} nie może zawierać znaków specjalnych.`,
      },
    );
  }

  const isValid = fieldSchema.safeParse(value);

  if (!isValid.success) {
    console.log(
      `Validation error for field "${name}": ${isValid.error.errors[0].message}`,
    );
    throw new FieldValidationError({
      message: isValid.error.errors[0].message,
      metaData: { ...metaData, field: name, value: value },
      loggerMessage: `${validationErrorLoggerMessages(metaData.service)}: ${isValid.error.errors[0].message}`,
    });
  }
};

/**
 * Validates an email address.
 * @param email The email address to validate.
 * @param metaData Additional metadata for error handling.
 * @throws {FieldValidationError} If the email is invalid.
 */
const isEmailValid = (email: string, metaData = { service: "" }) => {
  const emailSchema = z
    .string()
    .nonempty({ message: "Email nie może być pusty." })
    .regex(/^\S*$/, { message: "Email nie może zawierać spacji." })
    .email({ message: "Email jest niepoprawny." });

  const isValid = emailSchema.safeParse(email);

  if (!isValid.success) {
    throw new FieldValidationError({
      message: isValid.error.errors[0].message,
      metaData: { ...metaData, field: "Email", value: email },
      loggerMessage: `${validationErrorLoggerMessages(metaData.service)}: ${isValid.error.errors[0].message}`,
    });
  }
};

/**
 * Validates a password against security criteria.
 * @param password The password to validate.
 * @param metaData Additional metadata for error handling.
 * @throws {FieldValidationError} If the password does not meet validation criteria.
 */
const isPasswordValid = (password: string, metaData = { service: "" }) => {
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

  const isValid = passwordSchema.safeParse(password);

  if (!isValid.success) {
    throw new FieldValidationError({
      message: isValid.error.errors[0].message,
      metaData: { ...metaData, field: "Hasło" },
      loggerMessage: `${validationErrorLoggerMessages(metaData.service)}: ${isValid.error.errors[0].message}`,
    });
  }
};

/**
 * Converts a date string in the format YYYY-MM-DD to a DateTime object.
 * @param date The date string to convert.
 * @param metaData Additional metadata for error handling.
 * @returns A DateTime object representing the date.
 * @throws {FieldValidationError} If the date is invalid or in the wrong format.
 */
const getDateTimeFromDate = (
  date: string,
  metaData = { service: "" },
): DateTime => {
  const dateSchema = z
    .string()
    .nonempty({
      message: "Data nie może być pusta.",
    })
    .regex(/^\d{4}-\d{2}-\d{2}$/, {
      message: "Data musi być w formacie YYYY-MM-DD.",
    });

  const dateValidationResult = dateSchema.safeParse(date);
  if (!dateValidationResult.success) {
    throw new FieldValidationError({
      message: dateValidationResult.error.errors[0].message,
      metaData: { ...metaData, field: "Data", value: date },
      loggerMessage: `${validationErrorLoggerMessages(metaData.service)}: ${dateValidationResult.error.errors[0].message}`,
    });
  }

  const convertedDate = DateTime.fromISO(date);

  if (!convertedDate.isValid) {
    throw new FieldValidationError({
      message: `Format daty ${date} jest niepoprawny.`,
      metaData: { ...metaData, field: "Data", value: date },
      loggerMessage: `${validationErrorLoggerMessages(metaData.service)}: Format daty ${date} jest niepoprawny.`,
    });
  }

  return convertedDate;
};

/**
 * Checks if a date is between a minimum and maximum age.
 * @param date The date to check, either as a string in the format YYYY-MM-DD or as a DateTime object.
 * @param metaData Additional metadata for error handling.
 * @param yearsMin Minimum age in years.
 * @param yearsMax Maximum age in years.
 * @throws {FieldValidationError} If the date is not within the specified age range.
 */
const checkIfAgeBetween = (
  date: string | DateTime,
  metaData = { service: "" },
  yearsMin = 13,
  yearsMax = 105,
) => {
  if (typeof date === "string") date = getDateTimeFromDate(date);

  const today = DateTime.now();
  const minimalDate = today.minus({ years: yearsMin });
  const maximalDate = today.minus({ years: yearsMax });

  if (date > today)
    throw new FieldValidationError({
      message: "Nie mogłeś urodzić się w przyszłości.",
      metaData: { ...metaData, field: "Data urodzenia", value: date.toISO() },
      loggerMessage: `${validationErrorLoggerMessages(metaData.service)}: Nie mogłeś urodzić się w przyszłości.`,
    });

  if (date <= maximalDate)
    throw new FieldValidationError({
      message: `Nie możesz mieć więcej niż ${yearsMax} lat.`,
      metaData: { ...metaData, field: "Data urodzenia", value: date.toISO() },
      loggerMessage: `${validationErrorLoggerMessages(metaData.service)}: Nie możesz mieć więcej niż ${yearsMax} lat.`,
    });

  if (date >= minimalDate)
    throw new FieldValidationError({
      message: `Musisz mieć co najmniej ${yearsMin} lat.`,
      metaData: { ...metaData, field: "Data urodzenia", value: date.toISO() },
      loggerMessage: `${validationErrorLoggerMessages(metaData.service)}: Musisz mieć co najmniej ${yearsMin} lat.`,
    });
};

/**
 *  Checks if a UUID is valid.
 * @param uuid The UUID string to validate.
 * @param fieldName The name of the field being validated, used for error messages.
 * @throws {FieldValidationError} If the UUID is not valid.
 */
const checkIfUUIDIsValid = (uuid: string, fieldName: string) => {
  const uuidSchema = z
    .string()
    .nonempty({ message: `${fieldName} nie może być pusty.` })
    .uuid({ message: `${fieldName} musi być poprawnym UUID.` });

  const isValid = uuidSchema.safeParse(uuid);
  if (!isValid.success) {
    throw new FieldValidationError({
      message: isValid.error.errors[0].message,
    });
  }
};

export const ValidationService = {
  checkIfValueMatchesEnum,
  checkIfValueIsValid,
  isEmailValid,
  isPasswordValid,
  getDateTimeFromDate,
  checkIfAgeBetween,
  checkIfUUIDIsValid,
  capitalizeFirstLetter,
};
