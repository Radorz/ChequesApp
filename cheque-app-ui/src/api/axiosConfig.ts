import axios from 'axios';

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL });
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token && config.headers) config.headers.Authorization = `${token}`;
  return config;
});

api.interceptors.response.use(
  r => r,
  err => {
    // Lanza el mensaje del server si existe
    const msg =
      err?.response?.data?.message ||
      err?.response?.data ||
      err?.message ||
      'Error inesperado';
    return Promise.reject(new Error(typeof msg === 'string' ? msg : JSON.stringify(msg)));
  }
);

export default api;