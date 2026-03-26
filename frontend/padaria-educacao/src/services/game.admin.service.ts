import api from "./api";
import type { Game } from "./game.service";

export interface GameFormData {
  title: string;
  description?: string | null;
  type: "memory" | "ordering" | "visual_quiz" | "true_false" | "matching" | "word_scramble" | "next_ingredient";
  config: Record<string, unknown>;
  course_id?: number | null;
  module_id?: number | null;
  order?: number;
  is_active?: boolean;
}

export async function listAllGames(): Promise<Game[]> {
  const res = await api.get<{ games: Game[] }>("/games/admin");
  return res.data.games;
}

export async function createGame(data: GameFormData): Promise<Game> {
  const res = await api.post<Game>("/games", data);
  return res.data;
}

export async function updateGame(id: number, data: Partial<GameFormData>): Promise<Game> {
  const res = await api.put<Game>(`/games/${id}`, data);
  return res.data;
}

export async function deleteGame(id: number): Promise<void> {
  await api.delete(`/games/${id}`);
}
