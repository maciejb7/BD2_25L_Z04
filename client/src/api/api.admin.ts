import { UserWithSessions } from "../types/others";
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
