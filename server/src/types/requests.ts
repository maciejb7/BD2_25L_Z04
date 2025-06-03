import { Validator } from "./validators";

/**
 * Extracts specified fields from the request body and validates them.
 * @param requestBody - The body of the request containing the fields.
 * @param requestFields - An array of field names to extract from the request body.
 * @param validator - An object containing validation functions for each field.
 * @returns A promise that resolves to an object containing the extracted and validated fields.
 * @throws Will throw an error if a validation fails.
 */
export const extractRequestFields = async <T>(
  requestBody: Record<string, string>,
  requestFields: (keyof T)[],
  validator: Validator,
): Promise<T> => {
  return Object.fromEntries(
    requestFields.map((field) => {
      const value = requestBody[field as string];
      const trimmedValue = value ? value.trim() : "";
      if (validator[field as string]) validator[field as string](trimmedValue);

      return [field, trimmedValue];
    }),
  ) as T;
};

export interface RegisterRequest {
  nickname: string;
  email: string;
  name: string;
  surname: string;
  password: string;
  gender: string;
  birthDate: string;
}

export const registerRequestFields: (keyof RegisterRequest)[] = [
  "nickname",
  "email",
  "name",
  "surname",
  "password",
  "gender",
  "birthDate",
];

export interface LoginRequest {
  nicknameOrEmail: string;
  password: string;
}

export const loginRequestFields: (keyof LoginRequest)[] = [
  "nicknameOrEmail",
  "password",
];

export interface ConfirmationRequest {
  nickname: string;
  password: string;
}

export const confirmationRequestFields: (keyof ConfirmationRequest)[] = [
  "nickname",
  "password",
];

export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
}

export const changePasswordRequestFields: (keyof ChangePasswordRequest)[] = [
  "oldPassword",
  "newPassword",
];

export interface ChangeUserDetailsRequest {
  name: string;
  value: string;
}

export const changeUserDetailsRequestFields: (keyof ChangeUserDetailsRequest)[] =
  ["name", "value"];
