import { User } from "../types";
import { UserResponse } from "../types/auth.types";
import api from "./api";

export const getUserFromAPI = async (): Promise<User> => {
  const response = await api.get<UserResponse>("/api/user");
  const user = response.data.user;
  localStorage.setItem("user", JSON.stringify(user));
  return user;
};

export const getUserAvatar = async (): Promise<string> => {
  const response = await api.get(`/api/user/avatar`, {
    responseType: "blob",
    withCredentials: true,
  });
  return URL.createObjectURL(response.data);
};
