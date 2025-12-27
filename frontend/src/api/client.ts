import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const client = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token JWT
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Intercepteur pour gérer les erreurs d'authentification
client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API Auth
export const authAPI = {
  register: (email: string, password: string, name: string) =>
    client.post('/auth/register', { email, password, name }),
  login: (email: string, password: string) =>
    client.post('/auth/login', { email, password }),
  me: () => client.get('/auth/me'),
};

// API Reservations
export const reservationsAPI = {
  getAll: () => client.get('/reservations'),
  create: (weekStart: string) => client.post('/reservations', { week_start: weekStart }),
  delete: (id: number) => client.delete(`/reservations/${id}`),
};

// API Admin
export const adminAPI = {
  getUsers: () => client.get('/admin/users'),
  deleteUser: (id: number) => client.delete(`/admin/users/${id}`),
  getReservations: () => client.get('/admin/reservations'),
  deleteReservation: (id: number) => client.delete(`/admin/reservations/${id}`),
};

export default client;
