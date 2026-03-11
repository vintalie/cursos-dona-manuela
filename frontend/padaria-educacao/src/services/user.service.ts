import api from "./api";
import type { User } from "@/types";

export async function getUsers(): Promise<User[]> {
  const res = await api.get("/users");
  // Backend retorna paginação: { data: User[], meta, links }
  return res.data.data;
}

export async function createUser(data: {
  name: string;
  email: string;
  tipo: string;
  password: string;
}): Promise<User> {
  const res = await api.post("/users", data);
  return res.data as User;
}

export async function deleteUser(id: number) {
  await api.delete(`/users/${id}`);
}