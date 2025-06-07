import { User } from "../types/others";
import { ResetPasswordFormData } from "../types/requests";
import { CommonResponse, UserResponse } from "../types/responses";
import api, { handleApiError } from "./api";

interface getUserHobbies{
  userId: string;
}

interface Hobby {
  id: number;
  hobby_name: string;
  hobby_description: string;
  hobby_category_id: number;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  category: {
    hobby_category_name: string;
    hobby_category_description: string;
  };
}

export const getUserHobbies = async (userId: string): Promise<Hobby[]> => {
  try {
    const response = await api.get<Hobby[]>(`/api/hobbies/${userId}`);
    return response.data;
  } catch (error: unknown) {
    throw handleApiError(
      error,
      "Wystąpił błąd podczas pobierania hobby użytkownika. Spróbuj ponownie.",
    );
  }
};

export const getAllHobbyCategories = async (): Promise<User[]> => {
  try {
    const response = await api.get<User[]>(`/api/hobbies/categories`);
    return response.data;
  } catch (error: unknown) {
    throw handleApiError(
      error,
      "Wystąpił błąd podczas pobierania kategori. Spróbuj ponownie.",
    );
  }
};

export const getHobbyBycategory = async (category: number): Promise<UserResponse> => {
  try {
    const response = await api.get<User[]>(`/hobbies/categories/${category}/hobbies`);
    return response.data;
  } catch (error: unknown) {
    throw handleApiError(
      error,
      "Wystąpił błąd podczas pobierania hobby. Spróbuj ponownie.",
    );
  }
}