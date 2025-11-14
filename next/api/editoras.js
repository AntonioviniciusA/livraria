import { api } from "./api";

export const getEditoras = async () => {
  const response = await api.get("/editoras");
  return response.data;
};

export const getEditoraById = async (id) => {
  const response = await api.get(`/editoras/${id}`);
  return response.data;
};

export const createEditora = async (editoraData) => {
  const response = await api.post("/editoras", editoraData);
  return response.data;
};

export const updateEditora = async (id, editoraData) => {
  const response = await api.put(`/editoras/${id}`, editoraData);
  return response.data;
};

export const deleteEditora = async (id) => {
  const response = await api.delete(`/editoras/${id}`);
  return response.data;
};
