import api from "./api";
import type { LoginResponse, User } from "@/types";

export async function login(email: string, password: string): Promise<LoginResponse> {
  const response = await api.post<LoginResponse>("/auth/login", { email, password });
  return response.data;
}

export async function register(name: string, email: string, password: string, tipo: string): Promise<LoginResponse> {
  const response = await api.post<LoginResponse>("/auth/register", { name, email, password, tipo });
  return response.data;
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
