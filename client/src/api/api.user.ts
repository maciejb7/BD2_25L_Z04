import { ResetPasswordFormData } from "../types/auth.types";
import { CommonResponse, User, UserResponse } from "../types/general.types";
import api, { handleApiError } from "./api";

export const getUserFromAPI = async (): Promise<User> => {
  const response = await api.get<UserResponse>("/api/user");
  const user = response.data.user;
  localStorage.setItem("user", JSON.stringify(user));
  return user;
};

export const getUserAvatar = async (): Promise<string> => {
  const response = await api.get(`/api/user/avatar`, {
    responseType: "blob",
    withCredentials: true,
  });
  return URL.createObjectURL(response.data);
};

export const changeUserInfoField = async (
  name: string,
  value: string,
): Promise<CommonResponse> => {
  try {
    const response = await api.post<CommonResponse>("/api/user/change-info", {
      name: name,
      value: value,
    });
    return response.data;
  } catch (error: unknown) {
    throw handleApiError(
      error,
      "Wystąpił błąd zmiany danych użytkownika. Spróbuj ponownie.",
    );
  }
};

export const changePassword = async (
  data: ResetPasswordFormData,
): Promise<CommonResponse> => {
  try {
    const response = await api.post<CommonResponse>(
      "/api/user/change-password",
      data,
    );
    return response.data;
  } catch (error: unknown) {
    throw handleApiError(
      error,
      "Wystąpił błąd zmiany hasła. Spróbuj ponownie.",
    );
  }
};
