import { User } from "../types/others";
import { ResetPasswordFormData } from "../types/requests";
import { CommonResponse, UserResponse } from "../types/responses";
import api, { handleApiError } from "./api";

interface getUserHobbies{
  userId: string;
}

export interface Hobby {
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

export interface Category {
  id: number;
  hobby_category_name: string;
  hobby_category_description: string;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

export interface UserHobby {
  id: string;
  userId: string;
  hobbyId: number;
  rating: number;
  createdAt: string;
  updatedAt: string;
  hobby: Hobby;
}

export const getUserHobbies = async (userId?: string): Promise<UserHobby[]> => {
  try {
    // Endpoint dla aktualnego użytkownika - backend automatycznie pobiera userId z tokenu
    const response = await api.get<UserHobby[]>(`/api/hobbies/user/hobbies`);
    return response.data;
  } catch (error: unknown) {
    console.error("API Error getUserHobbies:", error);
    throw handleApiError(
      error,
      "Wystąpił błąd podczas pobierania hobby użytkownika. Spróbuj ponownie.",
    );
  }
};

export const getAllHobbyCategories = async (): Promise<Category[]> => {
  try {
    const response = await api.get<Category[]>(`/api/hobbies/categories`);
    return response.data;
  } catch (error: unknown) {
    throw handleApiError(
      error,
      "Wystąpił błąd podczas pobierania kategori. Spróbuj ponownie.",
    );
  }
};

export const getHobbyByCategory = async (category: number): Promise<Hobby[]> => {
  try{
    const response = await api.get<Hobby[]>(`/api/hobbies/categories/${category}/hobbies`);
    return response.data;
  }
  catch (error: unknown) {
    throw handleApiError(
      error,
      "Wystąpił błąd podczas pobierania hobby. Spróbuj ponownie.",
    );
  }
}

export const getAllHobby = async (): Promise<Hobby[]> => {
  try {
    const response = await api.get<Hobby[]>(`/api/hobbies/hobbies`);
    return response.data;
  } catch (error: unknown) {
    throw handleApiError(
      error,
      "Wystąpił błąd podczas pobierania wszystkich hobby. Spróbuj ponownie.",
    );
  }
}

// Nowa funkcja do oceniania hobby
export const rateHobby = async (hobbyId: number, rating: number): Promise<any> => {
  try {
    const response = await api.post(`/api/hobbies/user/hobbies/rate`, {
      hobbyId,
      rating
    });
    return response.data;
  } catch (error: unknown) {
    throw handleApiError(
      error,
      "Wystąpił błąd podczas oceniania hobby. Spróbuj ponownie.",
    );
  }
};

// Nowa funkcja do usuwania oceny hobby
export const removeHobbyRating = async (hobbyId: number): Promise<any> => {
  try {
    const response = await api.delete(`/api/hobbies/user/hobbies/${hobbyId}`);
    return response.data;
  } catch (error: unknown) {
    throw handleApiError(
      error,
      "Wystąpił błąd podczas usuwania oceny hobby. Spróbuj ponownie.",
    );
  }
};