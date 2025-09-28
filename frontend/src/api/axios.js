// src/api/axios.js
import axios from 'axios';

const api = axios.create({
  baseURL: "https://college-time-table-backend.onrender.com/api",
  withCredentials: true, // agar cookies/session use kar rahe ho
});



// request interceptor to add token
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
}, err => Promise.reject(err));

export default api;
