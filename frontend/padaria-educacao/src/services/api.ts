import axios, { AxiosError } from "axios";
import { toast } from "sonner";

const apiBase = "https://ead-api.dcmmarketingdigital.com.br"; 
const api = axios.create({
  baseURL: `${apiBase.replace(/\/$/, "")}/api/`,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const status = error.response?.status;
    const data = error.response?.data as { message?: string } | undefined;
    const msg = data?.message ?? error.message;

    if (status === 401) {
      toast.error("Sessão expirada. Faça login novamente.");
      localStorage.removeItem("token");
      window.location.href = "/";
      return Promise.reject(error);
    }

    if (status === 403) {
      toast.error("Você não tem permissão para esta ação.");
      return Promise.reject(error);
    }

    if (status && status >= 500) {
      toast.error("Erro no servidor. Tente novamente mais tarde.");
      return Promise.reject(error);
    }

    if (status === 404) {
      toast.error("Recurso não encontrado.");
      return Promise.reject(error);
    }

    if (msg && status !== 422) {
      toast.error(typeof msg === "string" ? msg : "Ocorreu um erro. Tente novamente.");
    } else if (!status && error.code === "ERR_NETWORK") {
      toast.error("Sem conexão. Verifique sua internet e tente novamente.");
    }

    return Promise.reject(error);
  }
);

export default api;
