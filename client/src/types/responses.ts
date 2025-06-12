import { User, UserWithSessions } from "./others";

export interface CommonResponse {
  message: string;
}

export interface ErrorResponse {
  message: string;
}

export interface UserResponse {
  user: User;
}

export interface UsersWithSessionsResponse {
  users: UserWithSessions[];
}

export interface UserWithSessionsResponse {
  user: UserWithSessions;
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

export interface BanResponse {
  givenBy: string;
  reason: string;
  givenAt: string;
}

