import { createContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            // Decode JWT to get role without an extra roundtrip, or just use localStorage
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                setUser({ id: payload.id, email: payload.email, role: payload.role });
            } catch (err) {
                console.error("Invalid token format:", err);
                localStorage.removeItem('token');
            }
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        try {
            const { data } = await api.post('/auth/login', { email, password });
            localStorage.setItem('token', data.token);
            setUser(data.user);
            if (data.user.role === 'admin') {
                navigate('/admin/dashboard');
            } else {
                navigate('/jobs');
            }
            return data;
        } catch (err) {
            // propagate a human-readable message
            const msg = err.response?.data?.error || err.message || 'Login failed';
            throw new Error(msg);
        }
    };

    const signup = async (name, email, password, role) => {
        try {
            const { data } = await api.post('/auth/signup', { name, email, password, role });
            localStorage.setItem('token', data.token);
            setUser(data.user);
            if (data.user.role === 'admin') {
                navigate('/admin/dashboard');
            } else {
                navigate('/jobs');
            }
            return data;
        } catch (err) {
            const msg = err.response?.data?.error || err.message || 'Signup failed';
            throw new Error(msg);
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
        navigate('/login');
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
