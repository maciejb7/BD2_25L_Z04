import { User } from "./general.types";

export interface LoginFormData {
  nicknameOrEmail: string;
  password: string;
}

export interface RegisterFormData {
  nickname: string;
  name: string;
  surname: string;
  email: string;
  password: string;
  gender: "male" | "female" | null;
  birthDate: string;
}

export interface RefreshResponse {
  message: string;
  accessToken: string;
}

export interface AuthResponse {
  message: string;
  accessToken: string;
  user: User;
}

export interface UserResponse {
  user: User;
}
