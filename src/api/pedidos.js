import api from './axios';

export const getPedidos   = ()            => api.get('/pedidos');
export const crearPedido  = (data)        => api.post('/pedidos', data);
export const calificar    = (id, data)    => api.post(`/pedidos/${id}/calificar`, data);
