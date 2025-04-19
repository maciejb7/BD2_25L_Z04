import { User } from "../types/general.types";

/**
 * Checks if the user is authenticated
 * by checking if the access token and user information are present in local storage.
 * @returns boolean
 */
export const isAuthenticated = (): boolean => {
  const accessToken = localStorage.getItem("accessToken");
  const userString = localStorage.getItem("user");

  const user: User | null = userString ? JSON.parse(userString) : null;

  if (!accessToken || !user) return false;

  return true;
};

/**
 * Gets the user information from local storage
 * and parses it into a User object.
 * @returns User | null
 */
export const getUser = (): User | null => {
  const userString = localStorage.getItem("user");
  return userString ? JSON.parse(userString) : null;
};
