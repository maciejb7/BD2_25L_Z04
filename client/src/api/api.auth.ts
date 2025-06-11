import api, { handleApiError } from "./api";
import { getAuthObserver } from "../utils/AuthObserver";
import { LoginFormData, RegisterFormData } from "../types/requests";
import {
  AuthResponse,
  CommonResponse,
  RefreshResponse,
} from "../types/responses";

export const login = async (data: LoginFormData): Promise<AuthResponse> => {
  try {
    const response = await api.post<AuthResponse>("/api/auth/login", data);
    localStorage.setItem("accessToken", response.data.accessToken);
    localStorage.setItem("user", JSON.stringify(response.data.user));
    getAuthObserver().emitLogin(response.data.message, "success");
    return response.data;
  } catch (error: unknown) {
    throw handleApiError(error, "Wystąpił błąd logowania. Spróbuj ponownie.");
  }
};

export const register = async (
  data: RegisterFormData,
): Promise<CommonResponse> => {
  try {
    const response = await api.post<CommonResponse>("/api/auth/register", data);
    return response.data;
  } catch (error: unknown) {
    throw handleApiError(error, "Wystąpił błąd rejestracji. Spróbuj ponownie.");
  }
};

export const activateAccount = async (
  accountActivationLinkId: string,
): Promise<CommonResponse> => {
  try {
    const response = await api.post<CommonResponse>(
      `/api/auth/activate-account/${accountActivationLinkId}`,
      {},
    );
    return response.data;
  } catch (error: unknown) {
    throw handleApiError(
      error,
      "Wystąpił błąd aktywacji konta. Sprawdź link aktywacyjny lub skontaktuj się z administratorem.",
    );
  }
};

export const refresh = async (): Promise<RefreshResponse> => {
  try {
    const response = await api.post<RefreshResponse>("/api/auth/refresh");
    localStorage.setItem("accessToken", response.data.accessToken);
    return response.data;
  } catch (error: unknown) {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    throw handleApiError(error, "Wystąpił błąd odświeżania tokena.");
  }
};

export const logout = async (): Promise<CommonResponse> => {
  try {
    const response = await api.delete("/api/auth/logout");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    getAuthObserver().emitLogout(response.data.message, "success");
    return response.data;
  } catch (error: unknown) {
    throw handleApiError(error, "Wystąpił błąd wylogowania. Spróbuj ponownie.");
  }
};

export const logoutFromAllDevices = async (): Promise<CommonResponse> => {
  try {
    const response = await api.delete<CommonResponse>(
      "/api/auth/logout-from-all-devices",
    );
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    getAuthObserver().emitLogout(response.data.message, "success");
    return response.data;
  } catch (error: unknown) {
    throw handleApiError(error);
  }
};
