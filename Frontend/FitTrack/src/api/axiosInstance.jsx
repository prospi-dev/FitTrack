import axios from 'axios';

// Base URL points to backend

// const axiosInstance = axios.create({
//     baseURL: 'https://localhost:7239/api',
// })

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://localhost:5173/api',
})

console.log(import.meta.env.VITE_API_URL)
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

// Response interceptor — if any request gets a 401,
// clear the session and send the user back to login.
// This handles expired tokens automatically.
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default axiosInstance;