import api, { handleApiError } from "./api";

export interface UserLocation {
  location_id: string;
  user_id: string;
  latitude: number;
  longitude: number;
  address: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Get another user's location
 * @param userId - ID of the user to get location for
 * @returns Promise with user location data or null if not found
 */
export const getUserLocation = async (userId: string): Promise<UserLocation | null> => {
  try {
    const response = await api.get<UserLocation>(`/api/location/${userId}`);
    return response.data;
  } catch (error: unknown) {
    // Return null if location not found (404) instead of throwing
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as any;
      if (axiosError.response?.status === 404) {
        return null;
      }
    }
    throw handleApiError(
      error,
      "Wystąpił błąd podczas pobierania lokalizacji użytkownika.",
    );
  }
};

/**
 * Get current user's location
 * @returns Promise with current user's location data or null if not found
 */
export const getCurrentUserLocation = async (): Promise<UserLocation | null> => {
  try {
    const response = await api.get<UserLocation>("/api/location");
    return response.data;
  } catch (error: unknown) {
    // Return null if location not found (404) instead of throwing
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as any;
      if (axiosError.response?.status === 404) {
        return null;
      }
    }
    throw handleApiError(
      error,
      "Wystąpił błąd podczas pobierania twojej lokalizacji.",
    );
  }
};

/**
 * Set or update current user's location
 * @param locationData - Location data to set
 * @returns Promise with success message
 */
export const setUserLocation = async (locationData: {
  latitude: number;
  longitude: number;
  address?: string;
}): Promise<{ message: string; location: UserLocation }> => {
  try {
    const response = await api.post("/api/location", locationData);
    return response.data;
  } catch (error: unknown) {
    throw handleApiError(
      error,
      "Wystąpił błąd podczas ustawiania lokalizacji.",
    );
  }
};

/**
 * Delete current user's location
 * @returns Promise with success message
 */
export const deleteUserLocation = async (): Promise<{ message: string }> => {
  try {
    const response = await api.delete("/api/location");
    return response.data;
  } catch (error: unknown) {
    throw handleApiError(
      error,
      "Wystąpił błąd podczas usuwania lokalizacji.",
    );
  }
};

/**
 * Get distance between current user and another user
 * @param userId - ID of the other user
 * @returns Promise with distance data
 */
export const getDistanceToUser = async (userId: string): Promise<{
  distance: number;
  unit: string;
}> => {
  try {
    const response = await api.get(`/api/location/distance/${userId}`);
    return response.data;
  } catch (error: unknown) {
    throw handleApiError(
      error,
      "Wystąpił błąd podczas obliczania odległości.",
    );
  }
};