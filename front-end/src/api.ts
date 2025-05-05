import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:3000/",
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
})
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  
// Interceptor para tratar erros globais
api.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        // Token inválido/expirou - redirecionar para login
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }
  );
  
  export default api;