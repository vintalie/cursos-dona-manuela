import { useEffect, useState } from "react";
import { setDocumentTitle } from "@/config/appConfig";
import {
  getBadges,
  createBadge,
  updateBadge,
  deleteBadge,
} from "@/services/badge.service";
import { getCourses } from "@/services/course.service";
import { getGames, type Game } from "@/services/game.service";
import type { Badge } from "@/types";
import type { Course } from "@/types";
import { Star } from "lucide-react";
import { showAlert } from "@/contexts/AlertPopupContext";
import ConfirmDeleteDialog from "@/components/ui/ConfirmDeleteDialog";
import PageLoader from "@/components/ui/PageLoader";
import WysiwygEditor from "@/components/ui/WysiwygEditor";
import UrlFieldWithPicker from "@/components/media/UrlFieldWithPicker";
import { resolveMediaUrl } from "@/services/media.service";

const CRITERIA_LABELS: Record<string, string> = {
  module_perfect: "Terminar matéria acertando todas as perguntas",
  course_perfect: "Terminar curso acertando todas as perguntas",
  course_complete: "Terminar curso completo",
  course_time: "Terminar curso em X minutos",
  game_score: "Fazer pontuação mínima em minigame",
  custom: "Personalizado",
};

export default function BadgesManager() {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState<Badge | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Badge | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    short_description: "",
    long_description: "",
    image: "",
    icon: "star",
    notification_message: "",
    criteria_type: "module_perfect" as string,
    criteria_params: {} as Record<string, unknown>,
  });

  useEffect(() => {
    setDocumentTitle("Medalhas");
    Promise.all([getBadges(), getCourses(), getGames()])
      .then(([b, c, g]) => {
        setBadges(b);
        setCourses(c);
        setGames(g.games ?? []);
      })
      .catch(() => showAlert({ type: "error", message: "Erro ao carregar dados" }))
      .finally(() => setLoading(false));
  }, []);

  function resetForm() {
    setForm({
      title: "",
      short_description: "",
      long_description: "",
      image: "",
      icon: "star",
      notification_message: "",
      criteria_type: "module_perfect",
      criteria_params: {},
    });
    setExpanded(false);
    setEditing(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) return;
    try {
      if (editing) {
        await updateBadge(editing.id, form);
        setBadges((prev) => prev.map((b) => (b.id === editing.id ? { ...b, ...form } : b)));
        showAlert({ type: "success", message: "Medalha atualizada!" });
      } else {
        const created = await createBadge(form);
        setBadges((prev) => [...prev, created]);
        showAlert({ type: "success", message: "Medalha criada!" });
      }
      resetForm();
    } catch {
      showAlert({ type: "error", message: "Erro ao salvar medalha" });
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await deleteBadge(deleteTarget.id);
      setBadges((prev) => prev.filter((b) => b.id !== deleteTarget.id));
      setDeleteTarget(null);
      showAlert({ type: "success", message: "Medalha excluída!" });
    } catch {
      showAlert({ type: "error", message: "Erro ao excluir" });
    } finally {
      setDeleteLoading(false);
    }
  }

  function startEdit(b: Badge) {
    setEditing(b);
    setForm({
      title: b.title,
      short_description: b.short_description ?? "",
      long_description: b.long_description ?? "",
      image: b.image ?? "",
      icon: b.icon ?? "star",
      notification_message: b.notification_message ?? "",
      criteria_type: b.criteria_type,
      criteria_params: b.criteria_params ?? {},
    });
    setExpanded(true);
  }

  return (
    <PageLoader loading={loading}>
    <div>
      <h2 className="page-title mb-5 text-xl font-bold text-foreground">Medalhas</h2>

      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="btn-primary mb-6"
      >
        {expanded ? "Cancelar" : "Nova Medalha"}
      </button>

      {expanded && (
        <form onSubmit={handleSubmit} className="bg-card p-6 rounded-xl border border-border mb-8 max-w-2xl space-y-4">
          <h3 className="font-semibold">{editing ? "Editar Medalha" : "Nova Medalha"}</h3>

          <div>
            <label className="block text-sm font-medium mb-1">Título *</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              className="w-full p-3 border rounded-lg"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Descrição curta</label>
            <input
              type="text"
              value={form.short_description}
              onChange={(e) => setForm((f) => ({ ...f, short_description: e.target.value }))}
              className="w-full p-3 border rounded-lg"
              placeholder="Exibida em listagens"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Descrição longa</label>
            <WysiwygEditor
              value={form.long_description}
              onChange={(v) => setForm((f) => ({ ...f, long_description: v }))}
              placeholder="Exibida ao clicar na medalha"
              minHeight="160px"
              defaultMediaType="image"
            />
          </div>

          <div>
            <UrlFieldWithPicker
              label="URL da imagem"
              value={form.image}
              onChange={(v) => setForm((f) => ({ ...f, image: v }))}
              type="image"
              placeholder="https://... ou selecione da biblioteca"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Ícone (padrão: star)</label>
            <input
              type="text"
              value={form.icon}
              onChange={(e) => setForm((f) => ({ ...f, icon: e.target.value }))}
              className="w-full p-3 border rounded-lg"
              placeholder="star"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Mensagem da notificação</label>
            <input
              type="text"
              value={form.notification_message}
              onChange={(e) => setForm((f) => ({ ...f, notification_message: e.target.value }))}
              className="w-full p-3 border rounded-lg"
              placeholder="Mensagem ao ganhar a medalha"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Critério para receber</label>
            <select
              value={form.criteria_type}
              onChange={(e) => setForm((f) => ({ ...f, criteria_type: e.target.value }))}
              className="w-full p-3 border rounded-lg"
            >
              {Object.entries(CRITERIA_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>

          {form.criteria_type === "course_time" && (
            <div>
              <label className="block text-sm font-medium mb-1">Tempo máximo (minutos)</label>
              <input
                type="number"
                value={(form.criteria_params?.max_minutes as number) ?? ""}
                onChange={(e) => setForm((f) => ({
                  ...f,
                  criteria_params: { ...f.criteria_params, max_minutes: e.target.value ? parseInt(e.target.value, 10) : null },
                }))}
                className="w-full p-3 border rounded-lg"
                min={1}
              />
            </div>
          )}

          {form.criteria_type === "game_score" && (
            <>
              <div>
                <label className="block text-sm font-medium mb-1">Minigame (opcional)</label>
                <select
                  value={(form.criteria_params?.game_id as number) ?? ""}
                  onChange={(e) => setForm((f) => ({
                    ...f,
                    criteria_params: { ...f.criteria_params, game_id: e.target.value ? parseInt(e.target.value, 10) : null },
                  }))}
                  className="w-full p-3 border rounded-lg"
                >
                  <option value="">Qualquer minigame</option>
                  {games.map((g) => (
                    <option key={g.id} value={g.id}>{g.title}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Pontuação mínima (%)</label>
                <input
                  type="number"
                  value={(form.criteria_params?.min_score as number) ?? ""}
                  onChange={(e) => setForm((f) => ({
                    ...f,
                    criteria_params: { ...f.criteria_params, min_score: e.target.value ? parseInt(e.target.value, 10) : 0 },
                  }))}
                  className="w-full p-3 border rounded-lg"
                  min={0}
                  max={100}
                  placeholder="Ex: 70"
                />
              </div>
            </>
          )}

          {(form.criteria_type === "module_perfect" || form.criteria_type === "course_perfect" || form.criteria_type === "course_complete") && (
            <div>
              <label className="block text-sm font-medium mb-1">Curso específico (opcional)</label>
              <select
                value={(form.criteria_params?.course_id as number) ?? ""}
                onChange={(e) => setForm((f) => ({
                  ...f,
                  criteria_params: { ...f.criteria_params, course_id: e.target.value ? parseInt(e.target.value, 10) : null },
                }))}
                className="w-full p-3 border rounded-lg"
              >
                <option value="">Qualquer curso</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
              </select>
            </div>
          )}

          <div className="flex gap-3">
            <button type="submit" className="btn-primary">
              {editing ? "Salvar" : "Criar"}
            </button>
            <button type="button" onClick={resetForm} className="btn-secondary">
              Cancelar
            </button>
          </div>
        </form>
      )}

      <div className="badges-grid">
        {badges.map((badge) => (
          <div key={badge.id} className="badge-manager-card">
            <div className="badge-manager-header">
              {badge.image ? (
                <img src={resolveMediaUrl(badge.image)} alt={badge.title} className="badge-manager-img" />
              ) : (
                <div className="badge-icon-wrap badge-icon-wrap--xl">
                  <Star size={24} className="badge-manager-icon" />
                </div>
              )}
            </div>

            <div className="badge-manager-body">
              <h4 className="font-semibold text-foreground">{badge.title}</h4>
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {CRITERIA_LABELS[badge.criteria_type] ?? badge.criteria_type}
              </p>
            </div>

            <div className="badge-manager-footer">
              <button
                type="button"
                onClick={() => startEdit(badge)}
                className="text-sm text-primary hover:underline px-0 py-0 bg-transparent border-none mr-0"
              >
                Editar
              </button>
              <button
                type="button"
                onClick={() => setDeleteTarget(badge)}
                className="text-sm text-destructive hover:underline px-0 py-0 bg-transparent border-none mr-0"
              >
                Excluir
              </button>
            </div>
          </div>
        ))}
      </div>

      <ConfirmDeleteDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Excluir medalha"
        description={deleteTarget ? `Excluir "${deleteTarget.title}"?` : ""}
        onConfirm={handleDelete}
        loading={deleteLoading}
      />
    </div>
    </PageLoader>
  );
}
