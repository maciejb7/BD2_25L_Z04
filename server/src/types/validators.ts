import { Gender } from "../db/models/user";
import { isEmailTaken, isNicknameTaken } from "../services/auth.service";
import {
  checkIfAgeBetween,
  checkIfValueIsValid,
  checkIfValueMatchesEnum,
  isEmailValid,
  isPasswordValid,
} from "../services/validation.service";
import { emptyMetaData } from "./others";

export type Validator = Record<string, (value: string) => void | Promise<void>>;

export const getUserDetailsValidator = (
  metaData = emptyMetaData,
): Validator => {
  return {
    nickname: async (value: string) => {
      checkIfValueIsValid("Nick", value, metaData, 3, 20, false, false);
      await isNicknameTaken(value);
    },
    email: async (value: string) => {
      isEmailValid(value, metaData);
      await isEmailTaken(value);
    },
    password: (value: string) => {
      isPasswordValid(value, metaData);
    },
    name: (value: string) => {
      checkIfValueIsValid("Imię", value, metaData, 2, 50, true, true);
    },
    surname: (value: string) => {
      checkIfValueIsValid("Nazwisko", value, metaData, 2, 50, true, true);
    },
    gender: (value: string) => {
      checkIfValueMatchesEnum("Płeć", value, Gender, metaData);
    },
    birthDate: (value: string) => {
      checkIfAgeBetween(value, metaData);
    },
  };
};

export const getUserLoginValidator = (metaData = emptyMetaData): Validator => {
  return {
    nicknameOrEmail: (value: string) => {
      checkIfValueIsValid("Login", value, metaData, 1, 50, false, false);
    },
    password: (value: string) => {
      checkIfValueIsValid("Hasło", value, metaData, 1, 50, false, false);
    },
  };
};

export function getUserConfirmationValidator(
  metaData = emptyMetaData,
): Validator {
  return {
    nickname: (value: string) => {
      checkIfValueIsValid("Login", value, metaData, 1, 50, false, false);
    },
    password: (value: string) => {
      checkIfValueIsValid("Hasło", value, metaData, 1, 50, false, false);
    },
  };
}

export function getPasswordChangeValidator(
  metaData = emptyMetaData,
): Validator {
  return {
    oldPassword: (value: string) => {
      checkIfValueIsValid("Stare hasło", value, metaData, 1, 50, false, false);
    },
    newPassword: (value: string) => {
      isPasswordValid(value, metaData);
    },
  };
}
