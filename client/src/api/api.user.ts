import { User } from "../types";
import api from "./api";

export const getUserFromAPI = async (): Promise<User> => {
  const response = await api.get<User>("/api/user");
  localStorage.setItem("user", JSON.stringify(response.data));
  return response.data;
};

export const getUserAvatar = async (): Promise<string> => {
  const response = await api.get(`/api/user/avatar`, {
    responseType: "blob",
    withCredentials: true,
  });
  return URL.createObjectURL(response.data);
};
