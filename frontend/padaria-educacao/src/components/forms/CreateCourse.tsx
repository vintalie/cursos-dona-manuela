import { useState, useEffect } from "react";
import { createCourse, getCourses } from "@/services/course.service";
import type { Course } from "@/types";

export default function CreateCourse() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [featured, setFeatured] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);

  useEffect(() => {
    getCourses().then(setCourses).catch(() => setCourses([]));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess(false);
    if (!title.trim()) {
      setError("Título é obrigatório");
      return;
    }
    setLoading(true);
    try {
      const novo = await createCourse({
        title: title.trim(),
        description: description.trim() || undefined,
        difficulty: difficulty || undefined,
        target_role: targetRole.trim() || undefined,
        featured,
      });
      setCourses((prev) => [novo, ...prev]);
      setTitle("");
      setDescription("");
      setDifficulty("");
      setTargetRole("");
      setFeatured(false);
      setSuccess(true);
    } catch (err: unknown) {
      setError((err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Erro ao criar curso");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card">
      <h4>Criar Curso</h4>
      <form onSubmit={handleSubmit}>
        <input
          placeholder="Título do Curso"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          placeholder="Descrição"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
          <option value="">Dificuldade</option>
          <option value="Iniciante">Iniciante</option>
          <option value="Intermediário">Intermediário</option>
          <option value="Avançado">Avançado</option>
        </select>
        <input
          placeholder="Categoria de Funcionários Alvo"
          value={targetRole}
          onChange={(e) => setTargetRole(e.target.value)}
        />
        <label className="flex items-center gap-2 mb-3 text-sm">
          <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} />
          Destacar curso
        </label>
        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
        {success && <p className="text-green-600 text-sm mb-2">Curso criado com sucesso!</p>}
        <button type="submit" disabled={loading}>
          {loading ? "Criando..." : "Criar Curso"}
        </button>
      </form>
      {courses.length > 0 && (
        <div className="mt-4">
          <h5 className="text-sm font-medium mb-2">Cursos existentes ({courses.length})</h5>
          <ul className="text-sm text-muted-foreground space-y-1">
            {courses.slice(0, 10).map((c) => (
              <li key={c.id}>{c.title}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
