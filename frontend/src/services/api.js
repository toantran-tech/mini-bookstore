import axios from 'axios';

// Khi build trên Vercel: VITE_API_URL = https://your-app.railway.app/api
// Khi chạy local:        VITE_API_URL không có → fallback localhost:8080
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api',
});


api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

export default api;