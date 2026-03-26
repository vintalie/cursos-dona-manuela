import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import { showAlert } from "@/contexts/AlertPopupContext";

const apiBase = import.meta.env.VITE_API_BASE || "https://ead-api.dcmmarketingdigital.com.br";
export const getApiBase = () => apiBase.replace(/\/$/, "");

/** Resolves media URL: prepends API base if relative (e.g. /storage/...) */
export function resolveMediaUrl(url: string | null | undefined): string {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `${getApiBase()}${url.startsWith("/") ? "" : "/"}${url}`;
}

const api = axios.create({
  baseURL: `${getApiBase()}/api/`,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Refresh state — prevents parallel refresh races
let isRefreshing = false;
let refreshQueue: Array<{ resolve: (token: string) => void; reject: (err: unknown) => void }> = [];

function drainRefreshQueue(error: unknown, token: string | null) {
  refreshQueue.forEach((cb) => (error ? cb.reject(error) : cb.resolve(token!)));
  refreshQueue = [];
}

function forceLogout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  showAlert({ type: "error", message: "Sessão expirada. Faça login novamente." });
  window.location.href = "/";
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    const status = error.response?.status;
    const data = error.response?.data as { message?: string } | undefined;
    const msg = data?.message ?? error.message;

    // ── 401: try silent token refresh before giving up ──────────────────────
    if (status === 401 && !originalRequest._retry) {
      // Don't attempt refresh on the refresh endpoint itself
      if (originalRequest.url?.includes("/auth/refresh")) {
        forceLogout();
        return Promise.reject(error);
      }

      if (isRefreshing) {
        // Queue this request until the ongoing refresh completes
        return new Promise((resolve, reject) => {
          refreshQueue.push({ resolve, reject });
        }).then((newToken) => {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const res = await api.post<{ access_token: string }>("/auth/refresh");
        const newToken = res.data.access_token;
        localStorage.setItem("token", newToken);
        api.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
        drainRefreshQueue(null, newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        drainRefreshQueue(refreshError, null);
        forceLogout();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    if (status === 403) {
      showAlert({ type: "error", message: "Você não tem permissão para esta ação." });
      return Promise.reject(error);
    }

    if (status && status >= 500) {
      showAlert({ type: "error", message: "Erro no servidor. Tente novamente mais tarde." });
      return Promise.reject(error);
    }

    if (status === 404) {
      showAlert({ type: "error", message: "Recurso não encontrado." });
      return Promise.reject(error);
    }

    if (msg && status !== 422) {
      showAlert({ type: "error", message: typeof msg === "string" ? msg : "Ocorreu um erro. Tente novamente." });
    } else if (!status && error.code === "ERR_NETWORK") {
      showAlert({ type: "error", message: "Sem conexão. Verifique sua internet e tente novamente." });
    }

    return Promise.reject(error);
  }
);

export default api;
