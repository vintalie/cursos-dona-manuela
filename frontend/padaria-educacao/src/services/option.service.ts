import api from "./api";
import type { Option } from "@/types";

export async function createOption(data: {
  question_id: number;
  label: string;
  text: string;
  is_correct: boolean;
}): Promise<Option> {
  const res = await api.post("/options", data);
  return res.data;
}

export async function updateOption(id: number, data: Partial<{ text: string; is_correct: boolean }>): Promise<Option> {
  const res = await api.put(`/options/${id}`, data);
  return res.data;
}
