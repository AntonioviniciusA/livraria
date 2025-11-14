import { api } from "./api";

export const getLivros = async () => {
  const response = await api.get("/livros");
  return response.data;
};

export const getLivroById = async (id) => {
  const response = await api.get(`/livros/${id}`);
  return response.data;
};

export const createLivro = async (livroData) => {
  const response = await api.post("/livros", livroData);
  return response.data;
};
export const updateLivro = async (id, livroData) => {
  const response = await api.put(`/livros/${id}`, livroData);
  return response.data;
};

export const deleteLivro = async (id) => {
  const response = await api.delete(`/livros/${id}`);
  return response.data;
};
