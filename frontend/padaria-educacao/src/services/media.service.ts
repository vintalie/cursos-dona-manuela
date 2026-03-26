import api, { resolveMediaUrl } from "./api";
import type { Media, MediaCategory } from "@/types";

export { resolveMediaUrl };

export interface ListMediaParams {
  type?: "image" | "video" | "audio" | "document";
  source?: "gerente" | "aluno";
  category_id?: number;
  per_page?: number;
  page?: number;
}

export interface PaginatedMedia {
  data: Media[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export async function uploadFile(
  file: File,
  mediaCategoryId?: number | null
): Promise<Media> {
  const formData = new FormData();
  formData.append("file", file);
  if (mediaCategoryId != null) {
    formData.append("media_category_id", String(mediaCategoryId));
  }
  const response = await api.post<Media>("/media", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
}

export async function listMedia(params?: ListMediaParams): Promise<PaginatedMedia> {
  const searchParams = new URLSearchParams();
  if (params?.type) searchParams.set("type", params.type);
  if (params?.source) searchParams.set("source", params.source);
  if (params?.category_id != null) searchParams.set("category_id", String(params.category_id));
  if (params?.per_page) searchParams.set("per_page", String(params.per_page));
  if (params?.page) searchParams.set("page", String(params.page));

  const query = searchParams.toString();
  const url = query ? `/media?${query}` : "/media";
  const response = await api.get<PaginatedMedia>(url);
  return response.data;
}

export async function getMediaCategories(): Promise<MediaCategory[]> {
  const response = await api.get<MediaCategory[]>("/media-categories");
  return response.data;
}

export async function createMediaCategory(name: string): Promise<MediaCategory> {
  const response = await api.post<MediaCategory>("/media-categories", { name });
  return response.data;
}

export async function updateMedia(
  id: number,
  data: { media_category_id?: number | null }
): Promise<Media> {
  const response = await api.patch<Media>(`/media/${id}`, data);
  return response.data;
}

export async function deleteMedia(id: number): Promise<void> {
  await api.delete(`/media/${id}`);
}
