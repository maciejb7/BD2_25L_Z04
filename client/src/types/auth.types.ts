import { User } from "./general.types";

export interface LoginForm {
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
}

export interface AuthResponse {
  message: string;
  accessToken: string;
  user: User;
}
