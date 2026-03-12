import api from "./api";
import type { Question } from "@/types";

export async function createQuestion(data: {
  assessment_id: number;
  text: string;
  answer_text?: string | null;
  is_multiple_choice?: boolean;
  score?: number;
}): Promise<Question> {
  const res = await api.post("/questions", data);
  return res.data;
}

export async function updateQuestion(id: number, data: Partial<{ text: string; answer_text: string | null; score: number }>): Promise<Question> {
  const res = await api.put(`/questions/${id}`, data);
  return res.data;
}

export async function deleteQuestion(id: number): Promise<void> {
  await api.delete(`/questions/${id}`);
}
