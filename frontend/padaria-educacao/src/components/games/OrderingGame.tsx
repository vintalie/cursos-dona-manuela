import { useState, useEffect, useCallback, useMemo } from "react";
import { completeGame } from "@/services/game.service";
import { showAlert } from "@/contexts/AlertPopupContext";
import { RotateCcw } from "lucide-react";
import GameResultActions from "./GameResultActions";

interface OrderingItem {
  id: number;
  text: string;
}

function normalizeItems(raw: unknown[]): OrderingItem[] {
  return raw
    .filter((it) => it && typeof it === "object")
    .map((it, idx) => {
      const obj = it as Record<string, unknown>;
      const text = (obj.text ?? obj.label ?? obj.name ?? obj.content ?? "") as string;
      const id = typeof obj.id === "number" ? obj.id : idx + 1;
      return { id, text: String(text ?? "").trim() || `Item ${idx + 1}` };
    });
}

interface OrderingGameProps {
  gameId: number;
  items: OrderingItem[] | unknown[];
  bestScore: number;
  onComplete: (score: number, newBest: boolean) => void;
  onExit: () => void;
  onPlayAnother?: () => void;
}

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export default function OrderingGame({
  gameId,
  items: rawItems,
  bestScore,
  onComplete,
  onExit,
  onPlayAnother,
}: OrderingGameProps) {
  const items = useMemo(
    () => (Array.isArray(rawItems) ? normalizeItems(rawItems) : []),
    [gameId, rawItems]
  );
  const correctOrder = items.map((it) => it.id);
  const [available, setAvailable] = useState<OrderingItem[]>([]);
  const [selected, setSelected] = useState<OrderingItem[]>([]);
  const [result, setResult] = useState<boolean[] | null>(null);
  const [finalScore, setFinalScore] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [startTime] = useState(Date.now());

  const initGame = useCallback(() => {
    setAvailable(shuffle(items));
    setSelected([]);
    setResult(null);
    setFinalScore(null);
  }, [items]);

  useEffect(() => {
    initGame();
  }, [initGame]);

  function handlePickItem(item: OrderingItem) {
    if (result || isSubmitting) return;
    setSelected((prev) => [...prev, item]);
    setAvailable((prev) => prev.filter((i) => i.id !== item.id));
  }

  function handleUndoLast() {
    if (result || isSubmitting || selected.length === 0) return;
    const last = selected[selected.length - 1];
    setSelected((prev) => prev.slice(0, -1));
    setAvailable((prev) => [...prev, last]);
  }

  function handleVerify() {
    const checks = selected.map((item, i) => item.id === correctOrder[i]);
    setResult(checks);

    const correctCount = checks.filter(Boolean).length;
    const score = Math.round((correctCount / items.length) * 100);
    setFinalScore(score);
    const timeSeconds = Math.floor((Date.now() - startTime) / 1000);

    setIsSubmitting(true);
    completeGame(gameId, {
      score,
      time_seconds: timeSeconds,
      completed: true,
      metadata: { correct: correctCount, total: items.length },
    })
      .then((res) => {
        onComplete(res.best_score, res.new_best);
      })
      .catch(() => showAlert({ type: "error", message: "Erro ao salvar o resultado." }))
      .finally(() => setIsSubmitting(false));
  }

  const allSelected = selected.length === items.length;
  const maxScore = items.length;

  return (
    <div className="ordering-game">
      <div className="ordering-game-header">
        <div className="ordering-game-stats">
          <span>Melhor: {bestScore}%</span>
          <span>Itens: {selected.length}/{maxScore}</span>
        </div>
        <div className="ordering-game-actions">
          <button type="button" onClick={initGame} className="ordering-game-reset" disabled={isSubmitting}>
            <RotateCcw size={16} /> Reiniciar
          </button>
          <button type="button" onClick={onExit} className="ordering-game-exit" disabled={isSubmitting}>
            Sair
          </button>
        </div>
      </div>

      <p className="ordering-game-instruction">
        Toque nos itens na ordem correta do processo:
      </p>

      {selected.length > 0 && (
        <div className="ordering-selected-area">
          <h4 className="ordering-area-title">Sua sequência:</h4>
          <div className="ordering-selected-list">
            {selected.map((item, i) => (
              <div
                key={item.id}
                className={`ordering-selected-item ${
                  result ? (result[i] ? "correct" : "wrong") : ""
                }`}
              >
                <span className="ordering-number">{i + 1}</span>
                <span className="ordering-text">{item.text}</span>
              </div>
            ))}
          </div>
          {!result && !isSubmitting && (
            <button type="button" onClick={handleUndoLast} className="ordering-undo-btn">
              Desfazer último
            </button>
          )}
        </div>
      )}

      {available.length > 0 && !result && (
        <div className="ordering-available-area">
          <h4 className="ordering-area-title">Itens disponíveis:</h4>
          <div className="ordering-available-list">
            {available.map((item) => (
              <button
                key={item.id}
                type="button"
                className="ordering-available-item"
                onClick={() => handlePickItem(item)}
                disabled={isSubmitting}
              >
                {item.text}
              </button>
            ))}
          </div>
        </div>
      )}

      {allSelected && !result && (
        <button
          type="button"
          className="ordering-verify-btn"
          onClick={handleVerify}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Verificando..." : "Verificar ordem"}
        </button>
      )}

      {result && finalScore !== null && (
        <div className="ordering-result game-result-screen">
          <span className={finalScore >= 70 ? "game-result-badge won" : "game-result-badge lost"}>
            {finalScore >= 70 ? "Vitória!" : "Tente novamente"}
          </span>
          <p className="ordering-result-text text-muted-foreground mt-2">
            Você acertou {result.filter(Boolean).length} de {items.length} posições ({finalScore}%)
          </p>
          <GameResultActions
            onPlayAgain={initGame}
            onPlayAnother={onPlayAnother}
            onBack={onExit}
            disabled={isSubmitting}
          />
        </div>
      )}
    </div>
  );
}
