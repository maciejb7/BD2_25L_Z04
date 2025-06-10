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
