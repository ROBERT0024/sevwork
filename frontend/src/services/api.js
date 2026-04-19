// Servicio de API — Secure Workspace
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const api = axios.create({ baseURL: API_URL, headers: { 'Content-Type': 'application/json' } });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
api.interceptors.response.use(
  (r) => r,
  (error) => {
    if (error.response?.status === 401) { localStorage.clear(); window.location.href = '/'; }
    return Promise.reject(error);
  }
);

export const register = (email, password) => api.post('/auth/register', { email, password });
export const login    = (email, password) => api.post('/auth/login',    { email, password });
export const getWorkspaces   = ()                => api.get('/workspaces/');
export const createWorkspace = (name, desc = '') => api.post('/workspaces/', { name, description: desc });
export const updateWorkspace = (id, data)        => api.patch(`/workspaces/${id}`, data);
export const deleteWorkspace = (id)              => api.delete(`/workspaces/${id}`);
export const getNotes = (wsId = null, search = '', tag = '', trash = false) => {
  const p = {};
  if (wsId)   p.workspace_id = wsId;
  if (search) p.search = search;
  if (tag)    p.tag    = tag;
  p.is_trash = trash;
  return api.get('/notes/', { params: p });
};
export const createNote = (title, content, wsId, tag = '', note_type = 'note', is_pinned = false) =>
  api.post('/notes/', { title, content, workspace_id: wsId, tag, note_type, is_pinned });
export const updateNote = (id, data) => api.put(`/notes/${id}`, data);
export const deleteNote = (id)       => api.delete(`/notes/${id}`);
export const getTasks = (wsId = null, search = '', trash = false) => {
  const p = { is_trash: trash };
  if (wsId)   p.workspace_id = wsId;
  if (search) p.search = search;
  return api.get('/tasks/', { params: p });
};
export const createTask = (title, wsId, priority = 'medium', due_date = null, desc = '', comments = '') =>
  api.post('/tasks/', { title, workspace_id: wsId, priority, due_date, description: desc, comments });
export const updateTask = (id, data) => api.patch(`/tasks/${id}`, data);
export const deleteTask = (id)       => api.delete(`/tasks/${id}`);
export default api;
