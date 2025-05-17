import { logout } from "../api/api.auth";
import { User } from "../types/general.types";

/**
 * Checks if the user is authenticated.
 * by checking if the access token and user information are present in local storage.
 * @returns boolean
 */
export const isAuthenticated = async (): Promise<boolean> => {
  const accessToken = localStorage.getItem("accessToken");
  const userString = localStorage.getItem("user");

  const user: User | null = userString ? JSON.parse(userString) : null;

  if (!accessToken || !user) {
    await logout();
    return false;
  }

  return true;
};

/**
 * Gets the user information from local storage.
 * and parses it into a User object.
 * @returns User | null
 */
export const getUserFromStorage = (): User | null => {
  const userString = localStorage.getItem("user");
  return userString ? JSON.parse(userString) : null;
};
