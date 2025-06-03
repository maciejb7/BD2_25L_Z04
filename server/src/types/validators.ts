import { Gender } from "../db/models/user";
import { AuthService } from "../services/auth.service";
import { ValidationService } from "../services/validation.service";
import { emptyMetaData } from "./others";

export type Validator = Record<string, (value: string) => void | Promise<void>>;

export const getUserDetailsValidator = (
  metaData = emptyMetaData,
): Validator => {
  return {
    nickname: async (value: string) => {
      ValidationService.checkIfValueIsValid(
        "Nick",
        value,
        metaData,
        3,
        20,
        false,
        false,
      );
      await AuthService.isNicknameTaken(value);
    },
    email: async (value: string) => {
      ValidationService.isEmailValid(value, metaData);
      await AuthService.isEmailTaken(value);
    },
    password: (value: string) => {
      ValidationService.isPasswordValid(value, metaData);
    },
    name: (value: string) => {
      ValidationService.checkIfValueIsValid(
        "Imię",
        value,
        metaData,
        2,
        50,
        true,
        true,
      );
    },
    surname: (value: string) => {
      ValidationService.checkIfValueIsValid(
        "Nazwisko",
        value,
        metaData,
        2,
        50,
        true,
        true,
      );
    },
    gender: (value: string) => {
      ValidationService.checkIfValueMatchesEnum(
        "Płeć",
        value,
        Gender,
        metaData,
      );
    },
    birthDate: (value: string) => {
      ValidationService.checkIfAgeBetween(value, metaData);
    },
  };
};

export const getUserLoginValidator = (metaData = emptyMetaData): Validator => {
  return {
    nicknameOrEmail: (value: string) => {
      ValidationService.checkIfValueIsValid(
        "Login",
        value,
        metaData,
        1,
        50,
        false,
        false,
      );
    },
    password: (value: string) => {
      ValidationService.checkIfValueIsValid(
        "Hasło",
        value,
        metaData,
        1,
        50,
        false,
        false,
      );
    },
  };
};

export function getUserConfirmationValidator(
  metaData = emptyMetaData,
): Validator {
  return {
    nickname: (value: string) => {
      ValidationService.checkIfValueIsValid(
        "Login",
        value,
        metaData,
        1,
        50,
        false,
        false,
      );
    },
    password: (value: string) => {
      ValidationService.checkIfValueIsValid(
        "Hasło",
        value,
        metaData,
        1,
        50,
        false,
        false,
      );
    },
  };
}

export function getPasswordChangeValidator(
  metaData = emptyMetaData,
): Validator {
  return {
    oldPassword: (value: string) => {
      ValidationService.checkIfValueIsValid(
        "Stare hasło",
        value,
        metaData,
        1,
        50,
        false,
        false,
      );
    },
    newPassword: (value: string) => {
      ValidationService.isPasswordValid(value, metaData);
    },
  };
}
