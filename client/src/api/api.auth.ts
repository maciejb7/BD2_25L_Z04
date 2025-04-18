import api, { handleApiError } from "./api";
import {
  AuthResponse,
  LoginFormData,
  RefreshResponse,
  RegisterFormData,
} from "../types/auth.types";
import { CommonResponse } from "../types/general.types";

export const login = async (data: LoginFormData): Promise<AuthResponse> => {
  try {
    const response = await api.post<AuthResponse>("/api/auth/login", data);
    localStorage.setItem("accessToken", response.data.accessToken);
    return response.data;
  } catch (error: unknown) {
    throw handleApiError(error, "Wystąpił błąd logowania. Spróbuj ponownie.");
  }
};

export const register = async (
  data: RegisterFormData,
): Promise<AuthResponse> => {
  try {
    const response = await api.post<AuthResponse>("/api/auth/register", data);
    localStorage.setItem("accessToken", response.data.accessToken);
    return response.data;
  } catch (error: unknown) {
    throw handleApiError(error, "Wystąpił błąd rejestracji. Spróbuj ponownie.");
  }
};

export const refresh = async (): Promise<RefreshResponse> => {
  try {
    const response = await api.get<RefreshResponse>("/api/auth/refresh");
    localStorage.setItem("accessToken", response.data.accessToken);
    return response.data;
  } catch (error: unknown) {
    localStorage.removeItem("accessToken");
    throw handleApiError(error, "Wystąpił błąd odświeżania tokena.");
  }
};

export const logout = async (): Promise<CommonResponse> => {
  try {
    const response = await api.delete("/api/auth/logout");
    localStorage.removeItem("accessToken");
    return response.data;
  } catch (error: unknown) {
    throw handleApiError(error, "Wystąpił błąd wylogowania. Spróbuj ponownie.");
  }
};
