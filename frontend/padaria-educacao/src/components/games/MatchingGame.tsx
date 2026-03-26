import { useState, useEffect, useCallback } from "react";
import { completeGame } from "@/services/game.service";
import { showAlert } from "@/contexts/AlertPopupContext";
import { RotateCcw } from "lucide-react";
import GameResultActions from "./GameResultActions";

interface MatchPair {
  id: number;
  left: string;
  right: string;
}

interface MatchingGameProps {
  gameId: number;
  pairs: MatchPair[];
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

export default function MatchingGame({
  gameId,
  pairs,
  bestScore,
  onComplete,
  onExit,
  onPlayAnother,
}: MatchingGameProps) {
  const [leftItems, setLeftItems] = useState<MatchPair[]>([]);
  const [rightItems, setRightItems] = useState<MatchPair[]>([]);
  const [selectedLeft, setSelectedLeft] = useState<number | null>(null);
  const [matched, setMatched] = useState<Set<number>>(new Set());
  const [wrongPair, setWrongPair] = useState<{ left: number; right: number } | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [finished, setFinished] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [startTime] = useState(Date.now());

  const initGame = useCallback(() => {
    setLeftItems(shuffle(pairs));
    setRightItems(shuffle(pairs));
    setSelectedLeft(null);
    setMatched(new Set());
    setWrongPair(null);
    setAttempts(0);
    setFinished(false);
  }, [pairs]);

  useEffect(() => {
    initGame();
  }, [initGame]);

  function handleLeftClick(pairId: number) {
    if (matched.has(pairId) || isSubmitting || finished) return;
    setSelectedLeft(pairId);
    setWrongPair(null);
  }

  function handleRightClick(pairId: number) {
    if (matched.has(pairId) || selectedLeft === null || isSubmitting || finished) return;

    setAttempts((a) => a + 1);

    if (selectedLeft === pairId) {
      const newMatched = new Set(matched);
      newMatched.add(pairId);
      setMatched(newMatched);
      setSelectedLeft(null);
      setWrongPair(null);

      if (newMatched.size === pairs.length) {
        const score = Math.max(0, Math.round(((pairs.length * 2 - (attempts + 1 - pairs.length)) / (pairs.length * 2)) * 100));
        const clampedScore = Math.min(100, Math.max(0, score));
        const timeSeconds = Math.floor((Date.now() - startTime) / 1000);

        setFinished(true);
        setIsSubmitting(true);

        completeGame(gameId, {
          score: clampedScore,
          time_seconds: timeSeconds,
          completed: true,
          metadata: { pairs: pairs.length, attempts: attempts + 1 },
        })
          .then((res) => {
            onComplete(res.best_score, res.new_best);
          })
          .catch(() => showAlert({ type: "error", message: "Erro ao salvar o resultado." }))
          .finally(() => setIsSubmitting(false));
      }
    } else {
      setWrongPair({ left: selectedLeft, right: pairId });
      setTimeout(() => {
        setWrongPair(null);
        setSelectedLeft(null);
      }, 700);
    }
  }

  if (finished) {
    const score = Math.min(100, Math.max(0, Math.round(((pairs.length * 2 - (attempts - pairs.length)) / (pairs.length * 2)) * 100)));
    const won = score >= 70;
    return (
      <div className="match-game game-result-screen">
        <div className="match-result">
          <span className={won ? "game-result-badge won" : "game-result-badge lost"}>
            {won ? "Vitória!" : "Tente novamente"}
          </span>
          <p className="match-result-score text-muted-foreground mt-2">
            Todos os pares conectados em {attempts} tentativas ({score}%)
          </p>
          <p className="text-sm text-muted-foreground mb-4">Melhor: {bestScore}%</p>
          <GameResultActions
            onPlayAgain={initGame}
            onPlayAnother={onPlayAnother}
            onBack={onExit}
            disabled={isSubmitting}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="match-game">
      <div className="match-header">
        <div className="match-stats">
          <span>Melhor: {bestScore}%</span>
          <span>Pares: {matched.size}/{pairs.length}</span>
          <span>Tentativas: {attempts}</span>
        </div>
        <div className="match-header-actions">
          <button type="button" onClick={initGame} className="match-reset">
            <RotateCcw size={16} />
          </button>
          <button type="button" onClick={onExit} className="match-exit">
            Sair
          </button>
        </div>
      </div>

      <p className="match-instruction">
        Selecione um item da esquerda e conecte ao correspondente da direita:
      </p>

      <div className="match-columns">
        <div className="match-column">
          {leftItems.map((item) => {
            const isMatched = matched.has(item.id);
            const isSelected = selectedLeft === item.id;
            const isWrong = wrongPair?.left === item.id;
            return (
              <button
                key={`l-${item.id}`}
                type="button"
                className={`match-item match-item-left ${isMatched ? "matched" : ""} ${isSelected ? "selected" : ""} ${isWrong ? "wrong" : ""}`}
                onClick={() => handleLeftClick(item.id)}
                disabled={isMatched}
              >
                {item.left}
              </button>
            );
          })}
        </div>
        <div className="match-column">
          {rightItems.map((item) => {
            const isMatched = matched.has(item.id);
            const isWrong = wrongPair?.right === item.id;
            return (
              <button
                key={`r-${item.id}`}
                type="button"
                className={`match-item match-item-right ${isMatched ? "matched" : ""} ${isWrong ? "wrong" : ""}`}
                onClick={() => handleRightClick(item.id)}
                disabled={isMatched || selectedLeft === null}
              >
                {item.right}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
