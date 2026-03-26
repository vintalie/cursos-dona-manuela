import axios from "axios";

const api = axios.create({
  baseURL: "https://ead-api.dcmmarketingdigital.com.br/api", // ajuste se necessário
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});


export default api;