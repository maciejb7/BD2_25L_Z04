import { Gender } from "../db/models/user";
import AuthService from "../services/auth.service";
import { ValidationService } from "../services/validation.service";

export const userValidator: Record<
  string,
  (value: string) => void | Promise<void>
> = {
  nickname: async (value: string) => {
    ValidationService.isStringFieldValid(value, "Nick", 3, 20);
    await AuthService.isNicknameTaken(value);
  },
  email: async (value: string) => {
    ValidationService.isEmailValid(value);
    await AuthService.isEmailTaken(value);
  },
  password: (value: string) => {
    ValidationService.isPasswordValid(value);
  },
  name: (value: string) => {
    ValidationService.isStringFieldValid(value, "Imię", 2, 50);
  },
  surname: (value: string) => {
    ValidationService.isStringFieldValid(value, "Nazwisko", 2, 50);
  },
  gender: (value: string) => {
    ValidationService.doesStringFieldMatchesEnum(value, Gender, "Płeć");
  },
  birthDate: (value: string) => {
    ValidationService.isBirthDateValid(value);
  },
};

export const loginValidator: Record<string, (value: string) => void> = {
  nicknameOrEmail: (value: string) => {
    ValidationService.isStringFieldValid(value, "Login", 3, 50);
  },
  password: (value: string) => {
    ValidationService.isStringFieldValid(value, "Hasło", 6, 50);
  },
};
