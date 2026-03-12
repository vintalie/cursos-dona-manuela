import api from "./api";
import type { Assessment, Question } from "@/types";

export async function getAssessments(): Promise<Assessment[]> {
  const res = await api.get<Assessment[]>("/assessments");
  return Array.isArray(res.data) ? res.data : [];
}

export async function getAssessment(id: number | string): Promise<Assessment> {
  const res = await api.get(`/assessments/${id}`);
  return res.data;
}

export async function createAssessment(data: {
  module_id: number;
  lesson_id?: number | null;
  title: string;
  max_score?: number;
  min_score?: number;
  position?: number;
  worth_points?: boolean;
}): Promise<Assessment> {
  const res = await api.post("/assessments", data);
  return res.data;
}

export async function updateAssessment(id: number, data: Partial<{ title: string; max_score: number; min_score: number; position: number }>): Promise<Assessment> {
  const res = await api.put(`/assessments/${id}`, data);
  return res.data;
}

export async function deleteAssessment(id: number): Promise<void> {
  await api.delete(`/assessments/${id}`);
}
