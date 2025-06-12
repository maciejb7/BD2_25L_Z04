import { getUserFromAPI } from "../api/api.user";
import { User } from "../types/others";

/**
 * Gets user from local storage.
 * @returns user object or null if not found or invalid
 */
export const getUserFromStorage = (): User | null => {
  const userString = localStorage.getItem("user");
  let user;
  try {
    user = userString ? JSON.parse(userString) : null;
  } catch {
    return null;
  }

  return user;
};

/**
 * Checks if user is authenticated by checking local storage.
 * Only for initial check (first component render).
 * @returns true if user is authenticated, false otherwise
 */
export const isUserAuthenticatedByStorage = (): boolean => {
  const accessToken = localStorage.getItem("accessToken");
  const user = getUserFromStorage();

  const isAuthenticated = Boolean(accessToken) && Boolean(user);

  if (!isAuthenticated) {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
  }

  return isAuthenticated;
};

export const isUserAdminByStorage = (): boolean => {
  const user = getUserFromStorage();
  return user ? user.role === "admin" : false;
};

export const isUserAdmin = async (): Promise<boolean> => {
  const user = await getUserFromAPI();
  return user.role === "admin";
};
