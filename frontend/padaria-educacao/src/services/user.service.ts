import api from "./api";
import type { User } from "@/types";

export async function getUsers(): Promise<User[]> {
  const res = await api.get("/users");
  return res.data.data;
}

export async function createUser(data: {
  name: string;
  email: string;
  tipo: string;
  password: string;
}) {
  const res = await api.post("/users", data);
  return res.data;
}

export async function deleteUser(id: number) {
  await api.delete(`/users/${id}`);
}