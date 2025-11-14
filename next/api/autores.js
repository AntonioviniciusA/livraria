import { api } from "./api";

export const getAutores = async () => {
  const response = await api.get("/autores");
  return response.data;
};

export const getAutorById = async (id) => {
  const response = await api.get(`/autores/${id}`);
  return response.data;
};

export const createAutor = async (autorData) => {
  const response = await api.post("/autores", autorData);
  return response.data;
};

export const updateAutor = async (id, autorData) => {
  const response = await api.put(`/autores/${id}`, autorData);
  return response.data;
};

export const deleteAutor = async (id) => {
  const response = await api.delete(`/autores/${id}`);
  return response.data;
};
