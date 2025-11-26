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

export const getUserProfile = async () => {
  const response = await api.get("/auth/profile");
  setUserInfo(response.data);
  return response.data;
};
export const getToken = () => {
  return localStorage.getItem("token");
};

export const setToken = (token) => {
  localStorage.setItem("token", token);
};

export const clearToken = () => {
  localStorage.removeItem("token");
};
export const getUserInfo = async () => {
  const userInfo = localStorage.getItem("user");
  if (!userInfo) {
    return await getUserProfile();
  }
  return userInfo ? JSON.parse(userInfo) : null;
};
export const setUserInfo = (userInfo) => {
  localStorage.setItem("user", JSON.stringify(userInfo));
};

export const getUsers = async () => {
  const response = await api.get("/usuarios/");
  return response.data;
};
