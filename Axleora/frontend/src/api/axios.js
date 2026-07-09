import axios from "axios";
export const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api" });
api.interceptors.request.use(config => {
  const token = localStorage.getItem("axleora_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
api.interceptors.response.use(r => r, error => {
  if (error.response?.status === 401 && localStorage.getItem("axleora_token")) {
    localStorage.removeItem("axleora_token");
    localStorage.removeItem("axleora_user");
    if (!location.pathname.includes("/admin/login")) location.href = "/admin/login";
  }
  return Promise.reject(error);
});
export const fileUrl = url => url ? `${(import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace(/\/api$/, "")}${url}` : "";
