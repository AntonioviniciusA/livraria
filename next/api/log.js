import { api } from "./api";

export const getLogs = async () => {
  const response = await api.get("/logs");
  return response.data;
};

export const createLog = async (logData) => {
  const response = await api.post("/logs", logData);
  return response.data;
};

export const getLogsByType = async (type) => {
  const response = await api.get(`/logs/type/${type}`);
  return response.data;
};

export const getLogsByUser = async (user) => {
  const response = await api.get(`/logs/user/${user}`);
  return response.data;
};
