import api from "./api";

export type UserStatus = 'nao_iniciado' | 'em_andamento' | 'aprovado' | 'reprovado';

export interface PerformanceUser {
  id: number;
  name: string;
  email: string;
  courses_completed: number;
  average_score: number;
  assessments_completed: number;
  status: UserStatus;
}

export interface PerformanceCourse {
  id: number;
  title: string;
  category_id?: number;
}

export interface PerformanceOverview {
  users: PerformanceUser[];
  courses: PerformanceCourse[];
  overall: {
    total_users: number;
    nao_iniciado: number;
    em_andamento: number;
    approved: number;
    failed: number;
    average_score: number;
    total_assessments: number;
  };
}

export interface CourseStats {
  course: { id: number; title: string };
  speedometer: { acertos: number; erros: number };
  timeline: { date: string; media: number }[];
  pie: { name: string; value: number; color: string }[];
  total_assessments: number;
}

export interface UserPerformanceData {
  user: { id: number; name: string; email: string };
  stats: {
    average_score: number;
    assessments_completed: number;
    courses_completed: number;
    status: UserStatus;
  };
  courses: { id: number; title: string; progress: number }[];
  timeline: { date: string; media: number }[];
}

export async function getPerformanceOverview(): Promise<PerformanceOverview> {
  const res = await api.get<PerformanceOverview>("/performance/overview");
  return res.data;
}

export async function getCourseStats(courseId: number): Promise<CourseStats> {
  const res = await api.get<CourseStats>(`/performance/course/${courseId}`);
  return res.data;
}

export async function getMyPerformance(): Promise<UserPerformanceData> {
  const res = await api.get<UserPerformanceData>("/performance/me");
  return res.data;
}

export async function getUserPerformance(userId: number): Promise<UserPerformanceData> {
  const res = await api.get<UserPerformanceData>(`/performance/user/${userId}`);
  return res.data;
}
