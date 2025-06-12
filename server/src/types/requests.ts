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

export interface EmailRequest {
  email: string;
}

export const emailRequestFields: (keyof EmailRequest)[] = ["email"];

export interface PasswordResetRequest {
  passwordResetLinkId: string;
  password: string;
}

export const passwordResetRequestFields: (keyof PasswordResetRequest)[] = [
  "passwordResetLinkId",
  "password",
];

export interface UserBanRequest {
  userToBanId: string;
  reason: string;
}

export const userBanRequestFields: (keyof UserBanRequest)[] = [
  "userToBanId",
  "reason",
];
