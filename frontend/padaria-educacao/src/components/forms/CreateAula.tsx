import { useState, useEffect } from "react";
import { getCourses } from "@/services/course.service";
import { showAlert } from "@/contexts/AlertPopupContext";
import { createLesson } from "@/services/lesson.service";
import type { Course, Module } from "@/types";

export default function CreateAula() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [position, setPosition] = useState("");
  const [content, setContent] = useState("");
  const [moduleId, setModuleId] = useState<number | "">("");
  const [courses, setCourses] = useState<Course[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getCourses().then(setCourses).catch(() => setCourses([]));
  }, []);

  useEffect(() => {
    const mods = courses.flatMap((c) => (c.modules ?? []).map((m) => ({ ...m })));
    setModules(mods);
  }, [courses]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      showAlert({ type: "error", message: "Título é obrigatório" });
      return;
    }
    if (!moduleId) {
      showAlert({ type: "error", message: "Selecione uma matéria" });
      return;
    }
    setLoading(true);
    try {
      await createLesson({
        module_id: moduleId,
        title: title.trim(),
        description: description.trim() || undefined,
        position: position ? parseInt(position, 10) : undefined,
        content: content.trim() || undefined,
      });
      setTitle("");
      setDescription("");
      setPosition("");
      setContent("");
      showAlert({ type: "success", message: "Aula criada com sucesso!" });
    } catch (err: unknown) {
      showAlert({ type: "error", message: (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Erro ao criar aula" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card">
      <h4>Criar Aula</h4>
      <form onSubmit={handleSubmit}>
        <input
          placeholder="Título da Aula"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          placeholder="Descrição"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <input
          placeholder="Tópico (posição na matéria)"
          type="number"
          min={0}
          value={position}
          onChange={(e) => setPosition(e.target.value)}
        />
        <select value={moduleId} onChange={(e) => setModuleId(e.target.value ? Number(e.target.value) : "")}>
          <option value="">Associar à Matéria</option>
          {modules.map((m) => (
            <option key={m.id} value={m.id}>
              {m.title} (Curso #{m.course_id})
            </option>
          ))}
        </select>
        <label className="block text-sm font-medium mb-2 mt-2">Conteúdo da Aula</label>
        <textarea
          placeholder="Digite o conteúdo aqui..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="min-h-[150px]"
        />
        <button type="submit" disabled={loading}>
          {loading ? "Criando..." : "Criar Aula"}
        </button>
      </form>
    </div>
  );
}
