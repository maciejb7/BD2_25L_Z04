import { User } from "../types/others";
import { ResetPasswordFormData } from "../types/requests";
import { CommonResponse, UserResponse } from "../types/responses";
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
  if (response.status !== 200) return "";
  return URL.createObjectURL(response.data);
};

export const uploadUserAvatar = async (file: File): Promise<CommonResponse> => {
  const formData = new FormData();
  formData.append("avatar", file);
  try {
    const response = await api.post<CommonResponse>(
      "/api/user/avatar/upload",
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      },
    );
    return response.data;
  } catch (error: unknown) {
    throw handleApiError(
      error,
      "Wystąpił błąd podczas przesyłania zdjęcia profilowego. Spróbuj ponownie.",
    );
  }
};

export const deleteUserAvatar = async (): Promise<CommonResponse> => {
  try {
    const response = await api.delete<CommonResponse>(
      "/api/user/avatar/delete",
      {
        withCredentials: true,
      },
    );
    return response.data;
  } catch (error: unknown) {
    throw handleApiError(
      error,
      "Wystąpił błąd podczas usuwania zdjęcia profilowego. Spróbuj ponownie.",
    );
  }
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
