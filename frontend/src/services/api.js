// Servicio de API — Secure Workspace
// Cliente Axios con interceptor JWT para autenticación automática

import axios from 'axios';

// URL base de la API
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor: agrega el token JWT a cada petición
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor: redirige al login si el token expira (401)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// ──── Endpoints de Autenticación ────

export const register = (email, password) =>
  api.post('/auth/register', { email, password });

export const login = (email, password) =>
  api.post('/auth/login', { email, password });

// ──── Endpoints de Espacios de Trabajo ────

export const getWorkspaces = () => api.get('/workspaces/');

export const createWorkspace = (name, description = '') =>
  api.post('/workspaces/', { name, description });

// ──── Endpoints de Notas ────

export const getNotes = (workspaceId = null) => {
  const params = workspaceId ? { workspace_id: workspaceId } : {};
  return api.get('/notes/', { params });
};

export const createNote = (title, content, workspaceId) =>
  api.post('/notes/', { title, content, workspace_id: workspaceId });

export const deleteNote = (noteId) => api.delete(`/notes/${noteId}`);

export default api;
