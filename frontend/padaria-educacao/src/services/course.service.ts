import api from "./api";
import type { Course } from "@/types";

export async function getCourses(): Promise<Course[]> {
  const res = await api.get<Course[] | { data: Course[] }>("/courses");
  const data = res.data;
  if (Array.isArray(data)) return data;
  return (data as { data?: Course[] }).data ?? [];
}

export type CourseWithProgress = Course & {
  user_progress?: number;
  completed_lesson_ids?: number[];
  completed_assessment_ids?: number[];
  is_enrolled?: boolean;
};

export async function getCourse(id: number | string): Promise<CourseWithProgress> {
  const res = await api.get(`/courses/${id}`);
  return res.data;
}

export async function createCourse(data: {
  title: string;
  description?: string;
  short_description?: string;
  difficulty?: string;
  featured?: boolean;
  target_role?: string;
  category_id?: number | null;
}): Promise<Course> {
  const res = await api.post("/courses", data);
  return res.data;
}

export async function updateCourse(id: number, data: Partial<{ title: string; description: string; short_description: string; difficulty: string; featured: boolean; category_id: number | null }>): Promise<Course> {
  const res = await api.put(`/courses/${id}`, data);
  return res.data;
}

export async function deleteCourse(id: number): Promise<void> {
  await api.delete(`/courses/${id}`);
}

export async function toggleCourseFeature(id: number): Promise<Course> {
  const res = await api.post(`/courses/${id}/feature`);
  return res.data;
}

export async function enrollInCourse(courseId: number | string): Promise<{ course: Course; message: string }> {
  const res = await api.post(`/courses/${courseId}/enroll`);
  return res.data;
}

export async function completeLesson(courseId: number | string, lessonId: number): Promise<{ progress: number }> {
  const res = await api.post(`/courses/${courseId}/lessons/${lessonId}/complete`);
  return res.data;
}

export async function completeAssessment(courseId: number | string, assessmentId: number, score?: number): Promise<{ progress: number }> {
  const res = await api.post(`/courses/${courseId}/assessments/${assessmentId}/complete`, { score: score ?? 0 });
  return res.data;
}
