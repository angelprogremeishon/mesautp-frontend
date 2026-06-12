import api from './axios';

// ── Flujo nuevo: registro con enlace + ingreso con PIN ──────────────────────
export const checkEmail = (email) => api.post('/auth/check-email', { email });
export const sendLink   = (email) => api.post('/auth/send-link', { email });
export const verify     = (token) => api.post('/auth/verify', { token });

export const completarRegistro = (payload) =>
    api.post('/auth/completar-registro', payload);

export const loginPin = (email, pin) =>
    api.post('/auth/login-pin', { email, pin });

// ── Sesión ──────────────────────────────────────────────────────────────────
export const logout = () => api.post('/auth/logout');
export const getMe  = () => api.get('/auth/me');

// ── Emprendedor (correo + contraseña) ────────────────────────────────────────
export const emprendedorRegister = (formData) =>
    api.post('/auth/emprendedor/register', formData, { headers: { 'Content-Type': 'multipart/form-data' } });

export const emprendedorLogin = (email, password) =>
    api.post('/auth/emprendedor/login', { email, password });
