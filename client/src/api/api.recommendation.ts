import api, { handleApiError } from "./api";

export interface RecommendationResponse {
  recommendations: RecommendedUser[];
  count: number;
}

export interface RecommendedUser {
  userId: string;
  nickname: string;
  name: string;
  surname: string;
  birthDate: string;
  gender: string;
  role: string;
  createdAt: string;
}

export interface InteractionResponse {
  message: string;
  isMatch: boolean;
  match?: {
    matchId: string;
    matchedAt: string;
    otherUser: RecommendedUser;
  };
}

export interface MatchResponse {
  matches: Match[];
  count: number;
}

export interface Match {
  matchId: string;
  matchedAt: string;
  otherUser: RecommendedUser;
}

export const getRecommendations = async (
  limit: number = 10
): Promise<RecommendationResponse> => {
  try {
    const response = await api.get<RecommendationResponse>(
      `/api/recommendations?limit=${limit}`
    );
    return response.data;
  } catch (error: unknown) {
    throw handleApiError(
      error,
      "Wystąpił błąd podczas pobierania rekomendacji. Spróbuj ponownie."
    );
  }
};

export const recordInteraction = async (
  targetUserId: string,
  action: "like" | "dislike"
): Promise<InteractionResponse> => {
  try {
    const response = await api.post<InteractionResponse>("/api/interactions", {
      targetUserId,
      action,
    });
    return response.data;
  } catch (error: unknown) {
    throw handleApiError(
      error,
      "Wystąpił błąd podczas zapisywania interakcji. Spróbuj ponownie."
    );
  }
};

export const getMatches = async (): Promise<MatchResponse> => {
  try {
    const response = await api.get<MatchResponse>("/api/interactions/matches");
    return response.data;
  } catch (error: unknown) {
    throw handleApiError(
      error,
      "Wystąpił błąd podczas pobierania dopasowań. Spróbuj ponownie."
    );
  }
};