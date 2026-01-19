import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器：添加token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器：处理错误
api.interceptors.response.use(
  (response) => response.data as any,
  (error) => {
    // 401 错误：未授权（可能是 token 过期或无效）
    // 但不要在登录页面时重定向（避免循环）
    if (error.response?.status === 401) {
      const isLoginPage = window.location.pathname.includes('/login');
      if (!isLoginPage) {
        localStorage.removeItem('token');
        const basename = import.meta.env.BASE_URL || '/assets-management/';
        window.location.href = `${basename}login`;
      }
    }
    return Promise.reject(error);
  }
);

export default api;

