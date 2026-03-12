import api from "./api";
import type { Badge } from "@/types";

export async function getBadges(): Promise<Badge[]> {
  const res = await api.get<Badge[]>("/badges");
  return res.data;
}

export async function getBadge(id: number): Promise<Badge> {
  const res = await api.get<Badge>(`/badges/${id}`);
  return res.data;
}

export async function createBadge(data: {
  title: string;
  short_description?: string;
  long_description?: string;
  image?: string;
  icon?: string;
  notification_message?: string;
  criteria_type: string;
  criteria_params?: Record<string, unknown>;
}): Promise<Badge> {
  const res = await api.post<Badge>("/badges", data);
  return res.data;
}

export async function updateBadge(id: number, data: Partial<{
  title: string;
  short_description: string;
  long_description: string;
  image: string;
  icon: string;
  notification_message: string;
  criteria_type: string;
  criteria_params: Record<string, unknown>;
}>): Promise<Badge> {
  const res = await api.put<Badge>(`/badges/${id}`, data);
  return res.data;
}

export async function deleteBadge(id: number): Promise<void> {
  await api.delete(`/badges/${id}`);
}
