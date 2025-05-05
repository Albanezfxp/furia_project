import axios from "axios";

// Configuração base do Axios
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000",
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token JWT
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para tratamento global de erros
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    
    if (error.response?.status === 500) {
      console.error('Server Error:', error);
      return Promise.reject(new Error('O servidor encontrou um erro'));
    }

    return Promise.reject(error);
  }
);

// API Service - Métodos organizados
export const ApiService = {
  // Exemplo de endpoint autenticado
  async getFuriaNews() {
    try {
      const response = await api.get('/furia/news');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch news:', error);
      throw error;
    }
  },

  // Exemplo de login
  async login(credentials: { email: string; password: string }) {
    const response = await api.post('/user/login', credentials);
    return response.data;
  },

  // Exemplo de endpoint público
  async getPublicData() {
    const response = await axios.get(`${import.meta.env.VITE_API_URL}/public/data`);
    return response.data;
  }
};

export default api;