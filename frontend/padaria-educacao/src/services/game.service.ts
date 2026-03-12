import api from "./api";

export interface Game {
  id: number;
  slug: string;
  title: string;
  description: string | null;
  type: string;
  config: Record<string, unknown>;
  course_id: number | null;
  module_id: number | null;
  best_score: number;
  attempts: number;
  unlocked: boolean;
}

export interface GamesResponse {
  games: Game[];
}

export async function getGames(params?: {
  course_id?: number;
  module_id?: number;
  type?: string;
}): Promise<GamesResponse> {
  const res = await api.get<GamesResponse>("/games", { params });
  return res.data;
}

export async function getGame(id: number): Promise<Game & { best_score: number; attempts: number }> {
  const res = await api.get<Game & { best_score: number; attempts: number }>(`/games/${id}`);
  return res.data;
}

export async function completeGame(
  gameId: number,
  data: { score: number; time_seconds?: number; completed?: boolean; metadata?: Record<string, unknown> }
): Promise<{ session_id: number; score: number; best_score: number; new_best: boolean }> {
  const res = await api.post(`/games/${gameId}/complete`, data);
  return res.data;
}
