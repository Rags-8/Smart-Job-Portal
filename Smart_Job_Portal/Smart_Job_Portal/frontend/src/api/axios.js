import axios from 'axios';

// ensure the API url always points to the backend and includes the `/api` prefix
function getBaseUrl() {
    let url = import.meta.env.VITE_API_URL || '';
    if (!url) {
        url = 'http://localhost:5000/api';
    }
    // trailing slash normalization
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    // if user forgot the /api segment, append it
    if (!url.endsWith('/api')) {
        url += '/api';
    }
    return url;
}

const api = axios.create({
    baseURL: getBaseUrl(),
});

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

export default api;
