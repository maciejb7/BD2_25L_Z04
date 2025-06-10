import { UserWithSessions } from "../types/others";
import { CommonResponse } from "../types/responses";
import api, { handleApiError } from "./api";

interface UserWithSessionsResponse {
  users: UserWithSessions[];
}

export const getUsersFromAPIAdmin =
  async (): Promise<UserWithSessionsResponse> => {
    try {
      const response =
        await api.get<UserWithSessionsResponse>("/api/admin/users");
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
