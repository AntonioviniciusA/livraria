import { api } from "./api";

export const getClientes = async () => {
  const response = await api.get("/clientes");
  return response.data;
};

export const getClienteById = async (id) => {
  const response = await api.get(`/clientes/${id}`);
  return response.data;
};

export const createCliente = async (clienteData) => {
  const response = await api.post("/clientes", clienteData);
  return response.data;
};

export const updateCliente = async (id, clienteData) => {
  const response = await api.put(`/clientes/${id}`, clienteData);
  return response.data;
};

export const deleteCliente = async (id) => {
  const response = await api.delete(`/clientes/${id}`);
  return response.data;
};
