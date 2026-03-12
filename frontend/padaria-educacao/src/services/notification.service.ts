import api from "./api";

export interface Notification {
  id: number;
  user_id: number;
  type: string;
  title: string;
  message: string | null;
  data: Record<string, unknown> | null;
  read_at: string | null;
  created_at: string;
}

export interface NotificationsResponse {
  notifications: Notification[];
  unread_count: number;
}

export async function getNotifications(unreadOnly = false): Promise<NotificationsResponse> {
  const res = await api.get<NotificationsResponse>("/notifications", {
    params: { unread_only: unreadOnly },
  });
  return res.data;
}

export async function markAsRead(id: number): Promise<void> {
  await api.post(`/notifications/${id}/read`);
}

export async function markAllAsRead(): Promise<void> {
  await api.post("/notifications/read-all");
}

export async function deleteAllNotifications(): Promise<void> {
  await api.delete("/notifications");
}

export async function reportLeftIncomplete(data: {
  context: string;
  course_id?: number;
  module_id?: number;
}): Promise<void> {
  await api.post("/notifications/report-left-incomplete", data);
}

export async function broadcastNotification(data: {
  title: string;
  message: string;
  user_ids?: number[];
  send_to_all?: boolean;
}): Promise<{ count: number }> {
  const res = await api.post<{ count: number }>("/notifications/broadcast", data);
  return res.data;
}
