import { useState, useEffect, useCallback } from "react";
import { completeGame } from "@/services/game.service";
import { toast } from "sonner";

interface Pair {
  id: number;
  label: string;
  emoji: string;
}

interface MemoryGameProps {
  gameId: number;
  pairs: Pair[];
  bestScore: number;
  onComplete: (score: number, newBest: boolean) => void;
  onExit: () => void;
}

interface Card {
  pairId: number;
  emoji: string;
  label: string;
  id: string;
}

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export default function MemoryGame({
  gameId,
  pairs,
  bestScore,
  onComplete,
  onExit,
}: MemoryGameProps) {
  const [cards, setCards] = useState<Card[]>([]);
  const [flipped, setFlipped] = useState<Set<string>>(new Set());
  const [matched, setMatched] = useState<Set<number>>(new Set());
  const [lastFlipped, setLastFlipped] = useState<string | null>(null);
  const [moves, setMoves] = useState(0);
  const [startTime] = useState(Date.now());
  const [isSubmitting, setIsSubmitting] = useState(false);

  const initCards = useCallback(() => {
    const allCards: Card[] = [];
    pairs.forEach((p) => {
      allCards.push({
        pairId: p.id,
        emoji: p.emoji,
        label: p.label,
        id: `${p.id}-a`,
      });
      allCards.push({
        pairId: p.id,
        emoji: p.emoji,
        label: p.label,
        id: `${p.id}-b`,
      });
    });
    setCards(shuffle(allCards));
    setFlipped(new Set());
    setMatched(new Set());
    setLastFlipped(null);
    setMoves(0);
  }, [pairs]);

  useEffect(() => {
    initCards();
  }, [initCards]);

  const score = matched.size;
  const maxScore = pairs.length;
  const isComplete = score === maxScore;

  useEffect(() => {
    if (!isComplete) return;
    const timeSeconds = Math.floor((Date.now() - startTime) / 1000);
    setIsSubmitting(true);
    completeGame(gameId, {
      score: maxScore,
      time_seconds: timeSeconds,
      completed: true,
      metadata: { moves },
    })
      .then((res) => {
        onComplete(res.best_score, res.new_best);
        if (res.new_best) {
          toast.success("Novo recorde! Parabéns!");
        } else {
          toast.success("Parabéns! Você completou o jogo!");
        }
      })
      .catch(() => {
        toast.error("Erro ao salvar o resultado. Tente novamente.");
      })
      .finally(() => setIsSubmitting(false));
  }, [isComplete, gameId, maxScore, moves, onComplete, startTime]);

  function handleCardClick(card: Card) {
    if (flipped.has(card.id) || matched.has(card.pairId)) return;
    if (flipped.size === 2) return;

    const newFlipped = new Set(flipped);
    newFlipped.add(card.id);

    if (flipped.size === 1 && lastFlipped) {
      const firstCard = cards.find((c) => c.id === lastFlipped);
      setMoves((m) => m + 1);
      if (firstCard && firstCard.pairId === card.pairId) {
        setMatched((prev) => new Set([...prev, card.pairId]));
        setFlipped(newFlipped);
        setLastFlipped(null);
      } else {
        setFlipped(newFlipped);
        setLastFlipped(null);
        setTimeout(() => {
          setFlipped((prev) => {
            const next = new Set(prev);
            next.delete(lastFlipped);
            next.delete(card.id);
            return next;
          });
        }, 600);
      }
    } else {
      setFlipped(newFlipped);
      setLastFlipped(card.id);
    }
  }

  return (
    <div className="memory-game">
      <div className="memory-game-header">
        <div className="memory-game-stats">
          <span>Melhor: {bestScore}</span>
          <span>Pares: {score}/{maxScore}</span>
          <span>Movimentos: {moves}</span>
        </div>
        <button
          type="button"
          onClick={onExit}
          className="memory-game-exit"
          disabled={isSubmitting}
        >
          Sair
        </button>
      </div>

      <div
        className="memory-game-grid"
        style={{
          gridTemplateColumns: `repeat(${Math.min(4, Math.ceil(Math.sqrt(cards.length)))}, 1fr)`,
        }}
      >
        {cards.map((card) => (
          <button
            key={card.id}
            type="button"
            className={`memory-card ${flipped.has(card.id) || matched.has(card.pairId) ? "flipped" : ""}`}
            onClick={() => handleCardClick(card)}
            disabled={isSubmitting}
          >
            <div className="memory-card-inner">
              <div className="memory-card-front">?</div>
              <div className="memory-card-back">
                <span className="memory-card-emoji">{card.emoji}</span>
                <span className="memory-card-label">{card.label}</span>
              </div>
            </div>
          </button>
        ))}
      </div>

      {isComplete && isSubmitting && (
        <p className="memory-game-saving text-sm text-muted-foreground mt-4">
          Salvando resultado...
        </p>
      )}
    </div>
  );
}
