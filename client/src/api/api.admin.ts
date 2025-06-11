import { UserWithSessions } from "../types/others";
import { BanResponse, CommonResponse } from "../types/responses";
import api, { handleApiError } from "./api";

interface UsersWithSessionsResponse {
  users: UserWithSessions[];
}

interface UserWithSessionsResponse {
  user: UserWithSessions;
}

export const getUserFromAPIAdmin = async (
  userId: string,
): Promise<UserWithSessionsResponse> => {
  try {
    const response = await api.get<UserWithSessionsResponse>(
      `/api/admin/user/${userId}`,
    );
    return response.data;
  } catch (error: unknown) {
    throw handleApiError(
      error,
      "Wystąpił błąd podczas pobierania danych użytkownika. Spróbuj ponownie później.",
    );
  }
};

export const getUserBanStatusAdmin = async (
  bannedUserId: string,
): Promise<BanResponse> => {
  try {
    const response = await api.get<BanResponse>(
      `/api/admin/user/ban-status/${bannedUserId}`,
    );
    return response.data;
  } catch (error: unknown) {
    throw handleApiError(
      error,
      "Wystąpił błąd podczas sprawdzania statusu bana użytkownika. Spróbuj ponownie później.",
    );
  }
};

export const uploadUserAvatarAdmin = async (
  userId: string,
  file: File,
): Promise<CommonResponse> => {
  const formData = new FormData();
  formData.append("avatar", file);
  try {
    const response = await api.post<CommonResponse>(
      `/api/admin/user/avatar/upload/${userId}`,
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

export const getUserAvatarAdmin = async (userId: string): Promise<string> => {
  const response = await api.get(`/api/admin/user/avatar/${userId}`, {
    responseType: "blob",
    withCredentials: true,
  });
  if (response.status !== 200) return "";
  return URL.createObjectURL(response.data);
};

export const deleteUserAvatarAdmin = async (
  userId: string,
): Promise<CommonResponse> => {
  try {
    const response = await api.delete<CommonResponse>(
      `/api/admin/user/avatar/delete/${userId}`,
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

export const getUsersFromAPIAdmin =
  async (): Promise<UsersWithSessionsResponse> => {
    try {
      const response =
        await api.get<UsersWithSessionsResponse>("/api/admin/users");
      return response.data;
    } catch (error: unknown) {
      throw handleApiError(
        error,
        "Wystąpił błąd podczas pobierania użytkowników. Spróbuj ponownie później.",
      );
    }
  };

export const deleteUserAccountByAdmin = async (
  userId: string,
): Promise<CommonResponse> => {
  try {
    const response = await api.delete<CommonResponse>(
      `/api/admin/user/delete/${userId}`,
    );
    return response.data;
  } catch (error: unknown) {
    throw handleApiError(
      error,
      "Wystąpił błąd podczas usuwania konta użytkownika. Spróbuj ponownie później.",
    );
  }
};

export const banUserAccount = async (
  userToBanId: string,
  reason: string,
): Promise<CommonResponse> => {
  try {
    const response = await api.post<CommonResponse>(`/api/admin/user/ban/`, {
      userToBanId,
      reason,
    });
    return response.data;
  } catch (error: unknown) {
    throw handleApiError(
      error,
      "Wystąpił błąd podczas banowania użytkownika. Spróbuj ponownie później.",
    );
  }
};

export const unbanUserAccount = async (
  userToUnbanId: string,
): Promise<CommonResponse> => {
  try {
    const response = await api.delete<CommonResponse>(
      `/api/admin/user/unban/${userToUnbanId}`,
    );
    return response.data;
  } catch (error: unknown) {
    throw handleApiError(
      error,
      "Wystąpił błąd podczas odbanowywania użytkownika. Spróbuj ponownie później.",
    );
  }
};

export const changeUserInfoFieldAdmin = async (
  name: string,
  value: string,
  userId: string,
): Promise<CommonResponse> => {
  try {
    const response = await api.post<CommonResponse>(
      `/api/admin/user/change-info/${userId}`,
      { name: name, value: value },
    );
    return response.data;
  } catch (error: unknown) {
    throw handleApiError(
      error,
      "Wystąpił błąd zmiany danych użytkownika. Spróbuj ponownie.",
    );
  }
};
