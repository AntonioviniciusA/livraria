import { api } from "./api";

export const getCategorias = async () => {
  const response = await api.get("/categorias");
  return response.data;
};

export const getCategoriaById = async (id) => {
  const response = await api.get(`/categorias/${id}`);
  return response.data;
};

export const createCategoria = async (categoriaData) => {
  const response = await api.post("/categorias", categoriaData);
  return response.data;
};
export const updateCategoria = async (id, categoriaData) => {
  const response = await api.put(`/categorias/${id}`, categoriaData);
  return response.data;
};
export const deleteCategoria = async (id) => {
  const response = await api.delete(`/categorias/${id}`);
  return response.data;
};
