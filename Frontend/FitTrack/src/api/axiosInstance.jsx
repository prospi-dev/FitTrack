import axios from 'axios';

// Base URL points to backend

const axiosInstance = axios.create({
    baseURL: 'http://localhost:7239/api',
})

// Request interceptor - automatically adds JWT token to headers
// to every request if one exists in localStorage
// This means we never have to manually add the token to each request
axiosInstance.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
})

export default axiosInstance;