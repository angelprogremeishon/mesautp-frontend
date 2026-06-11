import api from './axios';

export const getDashboard      = ()           => api.get('/emprendedor');
export const registrar         = (formData)   => api.post('/emprendedor/registro', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const actualizarLocal   = (formData)   => api.post('/emprendedor/local', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const guardarProducto   = (formData)   => api.post('/emprendedor/productos', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const confirmarPedido   = (id)         => api.post(`/emprendedor/pedidos/${id}/confirmar`);
export const marcarListo       = (id)         => api.post(`/emprendedor/pedidos/${id}/listo`);
