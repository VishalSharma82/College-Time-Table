import axios from "axios";

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL 
    ? `${process.env.REACT_APP_API_URL}/api`
    : "http://localhost:5000/api",
  withCredentials: true, // important if using cookies
});

// ✅ Add token automatically to every request
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default API;
