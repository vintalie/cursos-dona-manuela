import api from "./api";
import type { Module } from "@/types";

export async function getModules(): Promise<Module[]> {
  const res = await api.get<Module[]>("/modules");
  return Array.isArray(res.data) ? res.data : [];
}

export async function getModule(id: number | string): Promise<Module> {
  const res = await api.get(`/modules/${id}`);
  return res.data;
}

export async function createModule(data: {
  course_id: number;
  title: string;
  description?: string;
  position?: number;
  content?: string;
}): Promise<Module> {
  const res = await api.post("/modules", data);
  return res.data;
}

export async function updateModule(id: number, data: Partial<{ title: string; description: string; position: number; content: string }>): Promise<Module> {
  const res = await api.put(`/modules/${id}`, data);
  return res.data;
}

export async function deleteModule(id: number): Promise<void> {
  await api.delete(`/modules/${id}`);
}
