import axios, {
  AxiosError,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import { ErrorResponse } from "../types/general.types";
import { refresh } from "./api.auth";
import { getAuthObserver } from "../utils/AuthObserver";

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
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    const accessToken = localStorage.getItem("accessToken");
    if (accessToken) {
      config.headers["Authorization"] = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error: AxiosError): Promise<AxiosError> => {
    return Promise.reject(error);
  },
);

// Add a response interceptor to refresh access token if error 401 occurs
api.interceptors.response.use(
  (response: AxiosResponse): AxiosResponse => {
    return response;
  },
  async (error: AxiosError<ErrorResponse>) => {
    if (
      error.response?.status == 401 &&
      error.response?.data.message === "Brak autoryzacji."
    ) {
      // Save current request to retry it after refreshing the token
      const originalRequest = error.config as InternalAxiosRequestConfig;

      try {
        // Refresh the token
        const response = await refresh();
        const accessToken = response.accessToken;
        localStorage.setItem("accessToken", accessToken);
        originalRequest.headers["Authorization"] = `Bearer ${accessToken}`;

        // Retry the original request with the new access token
        return api(originalRequest);
      } catch (refreshError: any) {
        // Emit logout event to notify AuthHandler to log out the user
        getAuthObserver().emitLogout(refreshError.message);
        return Promise.reject(refreshError);
      }
    }
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
