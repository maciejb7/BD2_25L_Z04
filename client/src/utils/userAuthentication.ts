import { refresh } from "../api/api.auth";
import { getUserFromAPI } from "../api/api.user";
import { User } from "../types/general.types";
import { getAuthObserver } from "./AuthObserver";

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
 * Gets user from local storage or API if not found.
 * @returns user object
 */
export const getUser = async (): Promise<User> => {
  let user = getUserFromStorage();

  if (!user) {
    user = await getUserFromAPI();
    localStorage.setItem("user", JSON.stringify(user));
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
  return !!(accessToken && user);
};

/**
 * Checks if user is authenticated by checking local storage and API.
 * @returns true if user is authenticated, false otherwise
 */
export const isUserAuthenticated = async (): Promise<boolean> => {
  const accessToken = localStorage.getItem("accessToken");

  // If access token is not found, try to refresh it.
  if (!accessToken) {
    try {
      await refresh();
    } catch (error: any) {
      // Do not show alert if there is no refresh token (user is not logged in).
      if (error.message !== "Nie jesteś zalogowany.")
        getAuthObserver().emitLogout(error.message, "info");
      return false;
    }
  }

  // Check if user there is a user in local storage, if not, get it from API.
  await getUser();

  return true;
};
