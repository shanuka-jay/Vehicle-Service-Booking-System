import axios from "axios";

const apiBase = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const serverBase = apiBase.replace(/\/api$/, "");

export const api = axios.create({ baseURL: apiBase });

api.interceptors.request.use(config => {
  const token = localStorage.getItem("axleora_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(response => response, error => {
  if (error.response?.status === 401 && localStorage.getItem("axleora_token")) {
    localStorage.removeItem("axleora_token");
    localStorage.removeItem("axleora_user");
    if (!location.pathname.includes("/admin/login")) location.href = "/admin/login";
  }
  return Promise.reject(error);
});

export const fileUrl = url => {
  if (!url) return "";
  if (/^https?:\/\//i.test(url) || url.startsWith("/images/")) return url;
  return `${serverBase}${url}`;
};
