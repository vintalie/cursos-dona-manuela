import { useState, useEffect } from "react";
import { getCourses } from "@/services/course.service";
import { showAlert } from "@/contexts/AlertPopupContext";
import { createAssessment } from "@/services/assessment.service";
import CreatePergunta from "./CreatePergunta";
import type { Course, Module } from "@/types";

export default function CreateAvaliacao() {
  const [title, setTitle] = useState("");
  const [moduleId, setModuleId] = useState<number | "">("");
  const [maxScore, setMaxScore] = useState("");
  const [worthPoints, setWorthPoints] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [assessmentId, setAssessmentId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getCourses().then(setCourses).catch(() => setCourses([]));
  }, []);

  useEffect(() => {
    const mods = courses.flatMap((c) => (c.modules ?? []).map((m) => ({ ...m })));
    setModules(mods);
  }, [courses]);

  async function handleCreateAssessment(e: React.FormEvent) {
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
      const a = await createAssessment({
        module_id: moduleId,
        title: title.trim(),
        max_score: maxScore ? parseInt(maxScore, 10) : undefined,
        worth_points: worthPoints,
      });
      setAssessmentId(a.id);
      showAlert({ type: "success", message: "Avaliação criada! Adicione perguntas abaixo." });
    } catch (err: unknown) {
      showAlert({ type: "error", message: (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Erro ao criar avaliação" });
    } finally {
      setLoading(false);
    }
  }

  function handleReset() {
    setAssessmentId(null);
    setTitle("");
    setModuleId("");
    setMaxScore("");
    setWorthPoints(false);
  }

  return (
    <div className="card">
      <h4>Criar Avaliação</h4>
      {!assessmentId ? (
        <form onSubmit={handleCreateAssessment}>
          <input
            placeholder="Título da Avaliação"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <select value={moduleId} onChange={(e) => setModuleId(e.target.value ? Number(e.target.value) : "")}>
            <option value="">Associar à Matéria</option>
            {modules.map((m) => (
              <option key={m.id} value={m.id}>
                {m.title} (Curso #{m.course_id})
              </option>
            ))}
          </select>
          <label className="flex items-center gap-2 mb-3 text-sm">
            <input type="checkbox" checked={worthPoints} onChange={(e) => setWorthPoints(e.target.checked)} />
            Valer Pontos?
          </label>
          <input
            placeholder="Nota máxima da avaliação"
            type="number"
            min={0}
            value={maxScore}
            onChange={(e) => setMaxScore(e.target.value)}
          />
          <button type="submit" disabled={loading}>
            {loading ? "Criando..." : "Criar Avaliação"}
          </button>
        </form>
      ) : (
        <>
          <p className="text-green-600 text-sm mb-2">Avaliação criada. Adicione perguntas:</p>
          <CreatePergunta assessmentId={assessmentId} onQuestionAdded={() => {}} />
          <button type="button" className="mt-4" onClick={handleReset}>
            Criar outra avaliação
          </button>
        </>
      )}
    </div>
  );
}
