import { Gender, Role } from "../db/models/user";
import { AuthService } from "../services/auth.service";
import { ValidationService } from "../services/validation.service";

export type Validator = Record<string, (value: string) => void | Promise<void>>;

export const getUserDetailsValidator = (metaData = {}): Validator => {
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
      ValidationService.chekcIfEmailIsValid(value, metaData);
      await AuthService.isEmailTaken(value);
    },
    password: (value: string) => {
      ValidationService.checkIfPasswordIsValid(value, metaData);
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
    role: (value: string) => {
      ValidationService.checkIfValueMatchesEnum(
        "Typ konta",
        value,
        Role,
        metaData,
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

export const getUserLoginValidator = (metaData = {}): Validator => {
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

export function getUserConfirmationValidator(metaData = {}): Validator {
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

export const getPasswordResetValidator = (metaData = {}): Validator => {
  return {
    passwordResetLinkId: (value: string) => {
      ValidationService.checkIfValueIsValid(
        "Id linku resetującego hasło",
        value,
        metaData,
        1,
        50,
        false,
        false,
      );
    },
    password: (value: string) => {
      ValidationService.checkIfPasswordIsValid(value, metaData);
    },
  };
};

export const getPasswordChangeValidator = (metaData = {}): Validator => {
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
      ValidationService.checkIfPasswordIsValid(value, metaData);
    },
  };
};

export const getEmailValidator = (metaData = {}): Validator => {
  return {
    email: (value: string) => {
      ValidationService.chekcIfEmailIsValid(value, metaData);
    },
  };
};

export const getUserBanValidator = (metaData = {}): Validator => {
  return {
    userId: (value: string) => {
      ValidationService.checkIfUUIDIsValid(value, "ID użytkownika", metaData);
    },
    reason: (value: string) => {
      ValidationService.checkIfValueIsValid(
        "Powód bana",
        value,
        metaData,
        1,
        500,
        false,
        false,
        false,
      );
    },
  };
};
