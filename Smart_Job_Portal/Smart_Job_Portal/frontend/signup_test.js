// simple script to mimic AuthContext.signup using axios instance
import axios from 'axios';

function getBaseUrl() {
    let url = process.env.VITE_API_URL || '';
    if (!url) {
        url = 'http://localhost:5000/api';
    }
    if (url.endsWith('/')) url = url.slice(0, -1);
    if (!url.endsWith('/api')) url += '/api';
    return url;
}

(async () => {
    try {
        const api = axios.create({ baseURL: getBaseUrl() });
        const { data } = await api.post('/auth/signup', { name: 'NodeClient', email: 'nodeclient@example.com', password: 'xyz', role: 'user' });
        console.log('signup response', data);
    } catch (e) {
        console.error('error', e.response?.data || e.message);
    }
})();