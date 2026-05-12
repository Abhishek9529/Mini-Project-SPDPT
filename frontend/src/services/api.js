import axios from "axios";

const normalizeApiBaseUrl = (url) => {
  const fallbackUrl = "http://localhost:3000/api";
  const baseUrl = (url || fallbackUrl).replace(/\/$/, "");

  return baseUrl.endsWith("/api") ? baseUrl : `${baseUrl}/api`;
};

const API = axios.create({
  baseURL: normalizeApiBaseUrl(import.meta.env.VITE_API_BASE_URL)
});

// Attach JWT token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auto-logout on 401 (expired/invalid token)
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("student");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default API;
