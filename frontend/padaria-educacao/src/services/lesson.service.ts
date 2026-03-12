import api from "./api";
import type { Lesson } from "@/types";

export async function getLessons(): Promise<Lesson[]> {
  const res = await api.get<Lesson[]>("/lessons");
  return Array.isArray(res.data) ? res.data : [];
}

export async function createLesson(data: {
  module_id: number;
  title: string;
  description?: string;
  position?: number;
  content?: string;
}): Promise<Lesson> {
  const res = await api.post("/lessons", data);
  return res.data;
}

export async function updateLesson(id: number, data: Partial<{ title: string; description: string; position: number; content: string }>): Promise<Lesson> {
  const res = await api.put(`/lessons/${id}`, data);
  return res.data;
}

export async function deleteLesson(id: number): Promise<void> {
  await api.delete(`/lessons/${id}`);
}
