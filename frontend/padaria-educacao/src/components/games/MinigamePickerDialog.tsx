import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { listAllGames } from "@/services/game.admin.service";
import type { Game } from "@/services/game.service";
import { Gamepad2 } from "lucide-react";

const TYPE_LABELS: Record<string, string> = {
  memory: "Memória",
  ordering: "Monte a Receita",
  visual_quiz: "Identifique o Produto",
  true_false: "V ou F",
  matching: "Conecte os Pares",
  word_scramble: "Descubra a Palavra",
  next_ingredient: "Qual o Próximo?",
};

interface MinigamePickerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (gameId: number) => void;
}

export default function MinigamePickerDialog({ open, onOpenChange, onSelect }: MinigamePickerDialogProps) {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    listAllGames()
      .then(setGames)
      .catch(() => setGames([]))
      .finally(() => setLoading(false));
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="minigame-picker-dialog">
        <DialogHeader>
          <DialogTitle>Inserir Minigame</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground mb-3">Selecione um minigame para inserir na aula:</p>

        {loading && <p className="text-sm text-center py-6 text-muted-foreground">Carregando...</p>}

        {!loading && games.length === 0 && (
          <div className="text-center py-6 text-muted-foreground">
            <Gamepad2 size={32} className="mx-auto mb-2 opacity-50" />
            <p className="text-sm">Nenhum minigame criado.</p>
            <p className="text-xs">Crie minigames no painel de gerenciamento.</p>
          </div>
        )}

        {!loading && games.length > 0 && (
          <div className="minigame-picker-list">
            {games.map((game) => (
              <button
                key={game.id}
                type="button"
                className="minigame-picker-item"
                onClick={() => {
                  onSelect(game.id);
                  onOpenChange(false);
                }}
              >
                <div className="minigame-picker-item-info">
                  <span className="minigame-picker-item-title">{game.title}</span>
                  <span className="minigame-picker-item-type">{TYPE_LABELS[game.type] ?? game.type}</span>
                </div>
                {game.description && (
                  <span className="minigame-picker-item-desc">{game.description}</span>
                )}
              </button>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
