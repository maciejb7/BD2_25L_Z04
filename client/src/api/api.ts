import axios from "axios";
import { ErrorResponse } from "../types/general.types";

const API_URL = import.meta.env.VITE_API_URL;

if (!API_URL) {
  throw new Error("API_URL is not defined in the environment variables.");
}

// Create an axios instance with the base URL
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add a request interceptor to include the access token in the headers
api.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem("accessToken");
    if (accessToken) {
      config.headers["Authorization"] = `Bearer ${accessToken}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

export default api;

export const handleApiError = (error: unknown, defaultMessage?: string) => {
  if (axios.isAxiosError<ErrorResponse>(error)) {
    const message = error.response?.data.message || defaultMessage;
    throw new Error(message);
  }

  throw new Error(defaultMessage);
};
