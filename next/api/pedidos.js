import { api } from "./api";

export const getPedidos = async () => {
  const response = await api.get("/pedidos");
  return response.data;
};

export const createPedido = async (pedidoData) => {
  const response = await api.post("/pedidos", pedidoData);
  return response.data;
};
export const updatePedido = async (pedidoId, pedidoData) => {
  const response = await api.put(`/pedidos/${pedidoId}`, pedidoData);
  return response.data;
};
export const deletePedido = async (pedidoId) => {
  const response = await api.delete(`/pedidos/${pedidoId}`);
  return response.data;
};
export const getPedidoById = async (pedidoId) => {
  const response = await api.get(`/pedidos/${pedidoId}`);
  return response.data;
};
export const getPedidosByUserId = async (userId) => {
  const response = await api.get(`/pedidos/user/${userId}`);
  return response.data;
};
