import api from './axios';

export const sendLink  = (email)  => api.post('/auth/send-link', { email });
export const verify    = (token)  => api.post('/auth/verify', { token });
export const logout    = ()       => api.post('/auth/logout');
export const getMe     = ()       => api.get('/auth/me');

export const emprendedorRegister = (formData) =>
    api.post('/auth/emprendedor/register', formData, { headers: { 'Content-Type': 'multipart/form-data' } });

export const emprendedorLogin = (email, password) =>
    api.post('/auth/emprendedor/login', { email, password });
