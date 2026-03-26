import { useState, useEffect } from "react";
import { getCourses } from "@/services/course.service";
import { showAlert } from "@/contexts/AlertPopupContext";
import { createModule } from "@/services/module.service";
import type { Course } from "@/types";

export default function CreateMateria() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [position, setPosition] = useState("");
  const [content, setContent] = useState("");
  const [courseId, setCourseId] = useState<number | "">("");
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getCourses().then(setCourses).catch(() => setCourses([]));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      showAlert({ type: "error", message: "Título é obrigatório" });
      return;
    }
    if (!courseId) {
      showAlert({ type: "error", message: "Selecione um curso" });
      return;
    }
    setLoading(true);
    try {
      await createModule({
        course_id: courseId,
        title: title.trim(),
        description: description.trim() || undefined,
        position: position ? parseInt(position, 10) : undefined,
        content: content.trim() || undefined,
      });
      setTitle("");
      setDescription("");
      setPosition("");
      setContent("");
      setSuccess(true);
    } catch (err: unknown) {
      setError((err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Erro ao criar matéria");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card">
      <h4>Criar Matéria</h4>
      <form onSubmit={handleSubmit}>
        <input
          placeholder="Título da Matéria"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          placeholder="Descrição"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <input
          placeholder="Tópico (posição no curso)"
          type="number"
          min={0}
          value={position}
          onChange={(e) => setPosition(e.target.value)}
        />
        <select value={courseId} onChange={(e) => setCourseId(e.target.value ? Number(e.target.value) : "")}>
          <option value="">Associar ao Curso</option>
          {courses.map((c) => (
            <option key={c.id} value={c.id}>
              {c.title}
            </option>
          ))}
        </select>
        <label className="block text-sm font-medium mb-2 mt-2">Conteúdo da Matéria</label>
        <textarea
          placeholder="Digite o conteúdo aqui..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="min-h-[150px]"
        />
        <button type="submit" disabled={loading}>
          {loading ? "Criando..." : "Criar Matéria"}
        </button>
      </form>
    </div>
  );
}
