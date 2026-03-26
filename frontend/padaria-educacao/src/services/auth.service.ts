import api from "./api";
import type { LoginResponse, User } from "@/types";

export async function checkEmail(email: string): Promise<{ exists: boolean }> {
  const response = await api.post<{ exists: boolean }>("/auth/check-email", { email });
  return response.data;
}

export async function login(email: string, password: string): Promise<LoginResponse> {
  const response = await api.post<LoginResponse>("/auth/login", { email, password });
  return response.data;
}

export async function register(
  name: string,
  email: string,
  password: string,
  tipo?: "gerente" | "aluno"
): Promise<LoginResponse> {
  const response = await api.post<LoginResponse>("/auth/register", {
    name,
    email,
    password,
    ...(tipo && { tipo }),
  });
  return response.data;
}

/** URL para iniciar o fluxo de login com Google (redireciona para o backend) */
export function getGoogleLoginUrl(): string {
  const apiBase = import.meta.env.VITE_API_BASE || "https://ead-api.dcmmarketingdigital.com.br";
  const frontendUrl = window.location.origin;
  const base = apiBase.replace(/\/$/, "");
  return `${base}/api/auth/google?frontend_url=${encodeURIComponent(frontendUrl)}`;
}

export async function getMe(): Promise<User> {
  const response = await api.get<User>("/auth/me");
  return response.data;
}

export async function updateProfile(data: Partial<{
  name: string;
  full_name: string;
  avatar: string;
  gender: string;
  address: string;
  whatsapp: string;
  phone: string;
}>): Promise<User> {
  const response = await api.put<User>("/auth/me", data);
  return response.data;
}

export async function logoutApi(): Promise<void> {
  await api.post("/auth/logout");
}

export async function refreshToken(): Promise<{ access_token: string }> {
  const response = await api.post<{ access_token: string }>("/auth/refresh");
  return response.data;
}

export async function uploadAvatar(file: File): Promise<User> {
  const formData = new FormData();
  formData.append("file", file);
  const response = await api.post<User>("/auth/avatar", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
}
