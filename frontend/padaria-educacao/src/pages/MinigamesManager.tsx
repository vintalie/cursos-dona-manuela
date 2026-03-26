import { useEffect, useState } from "react";
import { setDocumentTitle } from "@/config/appConfig";
import { listAllGames, deleteGame } from "@/services/game.admin.service";
import type { Game } from "@/services/game.service";
import MinigameEditorDialog from "@/components/games/MinigameEditorDialog";
import ConfirmDeleteDialog from "@/components/ui/ConfirmDeleteDialog";
import PageLoader from "@/components/ui/PageLoader";
import EmptyState from "@/components/ui/EmptyState";
import { showAlert } from "@/contexts/AlertPopupContext";
import { Gamepad2, Plus, Pencil, Trash2, Copy } from "lucide-react";

const TYPE_LABELS: Record<string, string> = {
  memory: "Jogo da Memória",
  ordering: "Monte a Receita",
  visual_quiz: "Identifique o Produto",
  true_false: "Verdadeiro ou Falso",
  matching: "Conecte os Pares",
  word_scramble: "Descubra a Palavra",
  next_ingredient: "Qual o Próximo?",
};

const TYPE_COLORS: Record<string, string> = {
  memory: "bg-blue-500/15 text-blue-700",
  ordering: "bg-green-500/15 text-green-700",
  visual_quiz: "bg-purple-500/15 text-purple-700",
  true_false: "bg-amber-500/15 text-amber-700",
  matching: "bg-cyan-500/15 text-cyan-700",
  word_scramble: "bg-rose-500/15 text-rose-700",
  next_ingredient: "bg-orange-500/15 text-orange-700",
};

function getConfigCount(game: Game): string {
  const cfg = game.config as Record<string, unknown>;
  if (game.type === "memory" && Array.isArray(cfg.pairs)) return `${cfg.pairs.length} pares`;
  if (game.type === "ordering" && Array.isArray(cfg.items)) return `${cfg.items.length} itens`;
  if (game.type === "visual_quiz" && Array.isArray(cfg.questions)) return `${cfg.questions.length} questões`;
  if (game.type === "true_false" && Array.isArray(cfg.statements)) return `${cfg.statements.length} afirmações`;
  if (game.type === "matching" && Array.isArray(cfg.pairs)) return `${cfg.pairs.length} pares`;
  if (game.type === "word_scramble" && Array.isArray(cfg.words)) return `${cfg.words.length} palavras`;
  if (game.type === "next_ingredient" && Array.isArray(cfg.ingredients)) return `${cfg.ingredients.length} ingredientes`;
  return "";
}

function getIframeHtml(gameId: number): string {
  const base = window.location.origin;
  return `<iframe src="${base}/minigame/play/${gameId}" width="100%" height="420" frameborder="0" allowfullscreen></iframe>`;
}

export default function MinigamesManager() {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingGame, setEditingGame] = useState<Game | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Game | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    setDocumentTitle("Gerenciar Minigames");
  }, []);

  function fetchGames() {
    setLoading(true);
    listAllGames()
      .then(setGames)
      .catch(() => { setGames([]); showAlert({ type: "error", message: "Erro ao carregar minigames." }); })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    fetchGames();
  }, []);

  function handleCreate() {
    setEditingGame(null);
    setEditorOpen(true);
  }

  function handleEdit(game: Game) {
    setEditingGame(game);
    setEditorOpen(true);
  }

  function handleCopyIframe(game: Game) {
    navigator.clipboard.writeText(getIframeHtml(game.id)).then(
      () => showAlert({ type: "success", message: "Código iframe copiado!" }),
      () => showAlert({ type: "error", message: "Erro ao copiar." })
    );
  }

  async function handleDeleteConfirm() {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await deleteGame(deleteTarget.id);
      showAlert({ type: "success", message: "Minigame excluído!" });
      fetchGames();
    } catch {
      showAlert({ type: "error", message: "Erro ao excluir." });
    } finally {
      setDeleteLoading(false);
      setDeleteTarget(null);
    }
  }

  return (
    <PageLoader loading={loading}>
      <div className="minigames-manager-page">
        <div className="minigames-manager-header">
          <h2 className="page-title">Gerenciar Minigames</h2>
          <button type="button" className="minigames-manager-create-btn" onClick={handleCreate}>
            <Plus size={18} /> Criar Minigame
          </button>
        </div>

        {!loading && games.length === 0 && (
          <EmptyState
            icon={<Gamepad2 size={48} />}
            title="Nenhum minigame"
            description="Crie seu primeiro minigame para disponibilizar aos alunos."
          />
        )}

        {games.length > 0 && (
          <div className="minigames-manager-grid">
            {games.map((game) => (
              <div key={game.id} className="minigame-manager-card">
                <div className="minigame-manager-card-top">
                  <h4 className="minigame-manager-card-title">{game.title}</h4>
                  <div className="minigame-manager-card-meta">
                    <span className={`minigame-type-chip ${TYPE_COLORS[game.type] ?? ""}`}>
                      {TYPE_LABELS[game.type] ?? game.type}
                    </span>
                    <span className="text-xs text-muted-foreground">{getConfigCount(game)}</span>
                  </div>
                  {game.description && (
                    <p className="minigame-manager-card-desc">{game.description}</p>
                  )}
                </div>
                <div className="minigame-manager-card-actions">
                  <button type="button" onClick={() => handleCopyIframe(game)} title="Copiar iframe" className="minigame-action-btn">
                    <Copy size={15} /> iframe
                  </button>
                  <button type="button" onClick={() => handleEdit(game)} title="Editar" className="minigame-action-btn">
                    <Pencil size={15} /> Editar
                  </button>
                  <button type="button" onClick={() => setDeleteTarget(game)} title="Excluir" className="minigame-action-btn minigame-action-btn--danger">
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <MinigameEditorDialog
          open={editorOpen}
          onOpenChange={setEditorOpen}
          editGame={editingGame}
          onSaved={fetchGames}
        />

        <ConfirmDeleteDialog
          open={!!deleteTarget}
          onOpenChange={(open) => !open && setDeleteTarget(null)}
          title="Excluir minigame"
          description={deleteTarget ? `Deseja realmente excluir "${deleteTarget.title}"? Todos os dados de progresso dos alunos serão perdidos.` : ""}
          onConfirm={handleDeleteConfirm}
          loading={deleteLoading}
        />
      </div>
    </PageLoader>
  );
}
