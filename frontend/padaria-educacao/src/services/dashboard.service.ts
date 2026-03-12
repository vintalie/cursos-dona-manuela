import api from "./api";

export interface DashboardData {
  featured_courses: Array<{
    id: number;
    title: string;
    short_description?: string;
    category?: { id: number; name: string } | null;
    progress: number;
    badges: Array<{ id: number; title: string; icon?: string; image?: string }>;
  }>;
  courses_in_progress: Array<{
    id: number;
    title: string;
    short_description?: string;
    progress: number;
    category?: { id: number; name: string } | null;
  }>;
  badges: Array<{
    id: number;
    title: string;
    short_description?: string;
    long_description?: string;
    image?: string;
    icon?: string;
    earned_at: string;
  }>;
}

export async function getDashboard(): Promise<DashboardData> {
  const res = await api.get<DashboardData>("/dashboard");
  return res.data;
}
