import { api } from "./api";

export const login = async (username, password) => {
  const response = await api.post("/auth/login", {
    username,
    password,
  });
  return response.data;
};

export const register = async (
  username,
  password,
  fullName,
  email,
  groupId
) => {
  const response = await api.post("/auth/register");
  return response.data;
};

export const logout = async () => {
  const response = await api.post("/auth/logout");
  return response.data;
};

export const checkAuth = async () => {
  const response = await api.get("/auth/check");
  return response.data;
};
