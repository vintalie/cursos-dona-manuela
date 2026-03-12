import api from "./api";

export interface Category {
  id: number;
  name: string;
}

export async function getCategories(): Promise<Category[]> {
  const res = await api.get<Category[]>("/categories");
  return Array.isArray(res.data) ? res.data : [];
}

export async function createCategory(name: string): Promise<Category> {
  const res = await api.post("/categories", { name: name.trim() });
  return res.data;
}

export async function deleteCategory(id: number): Promise<void> {
  await api.delete(`/categories/${id}`);
}
