import api from './axios';

export const getExternos     = (params) => api.get('/locales/externos', { params });
export const getExterno      = (id)     => api.get(`/locales/externos/${id}`);
export const getInternos     = (params) => api.get('/locales/internos', { params });
export const getInterno      = (id)     => api.get(`/locales/internos/${id}`);
