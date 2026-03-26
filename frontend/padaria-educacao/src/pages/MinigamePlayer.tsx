import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getGame, type Game } from "@/services/game.service";
import MemoryGame from "@/components/games/MemoryGame";
import OrderingGame from "@/components/games/OrderingGame";
import VisualQuizGame from "@/components/games/VisualQuizGame";
import TrueFalseGame from "@/components/games/TrueFalseGame";
import MatchingGame from "@/components/games/MatchingGame";
import WordScrambleGame from "@/components/games/WordScrambleGame";
import NextIngredientGame from "@/components/games/NextIngredientGame";
import GameIntroScreen from "@/components/games/GameIntroScreen";
import PageLoader from "@/components/ui/PageLoader";

const isInIframe = () => typeof window !== "undefined" && window.parent !== window;

export default function MinigamePlayer() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [game, setGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [bestScore, setBestScore] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(false);
    getGame(parseInt(id, 10))
      .then((g) => {
        setGame(g as Game);
        setBestScore(g.best_score);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [id]);

  function handleExit() {
    if (window.parent !== window) {
      window.parent.postMessage("minigame-exit", "*");
    } else {
      navigate(-1);
    }
  }

  function handleComplete(score: number, newBest: boolean) {
    if (newBest) setBestScore(score);
  }

  if (loading) {
    return (
      <div className="minigame-player-wrapper">
        <PageLoader loading><span /></PageLoader>
      </div>
    );
  }

  if (error || !game) {
    return (
      <div className="minigame-player-wrapper">
        <div className="minigame-player-error">
          <p>Minigame não encontrado.</p>
          <button type="button" onClick={handleExit}>Voltar</button>
        </div>
      </div>
    );
  }

  const cfg = game.config as Record<string, unknown>;
  const inIframe = isInIframe();
  const showIntro = !inIframe && !gameStarted;

  if (showIntro) {
    return (
      <div className="minigame-player-wrapper">
        <GameIntroScreen
          title={game.title}
          gameType={game.type}
          onStart={() => setGameStarted(true)}
          onExit={handleExit}
        />
      </div>
    );
  }

  const handlePlayAnother = () => navigate("/minigames");

  return (
    <div className="minigame-player-wrapper">
      {game.type === "memory" && (
        <MemoryGame
          gameId={game.id}
          pairs={(cfg.pairs as { id: number; label: string; emoji: string }[]) ?? []}
          bestScore={bestScore}
          onComplete={handleComplete}
          onExit={handleExit}
          onPlayAnother={inIframe ? undefined : handlePlayAnother}
        />
      )}
      {game.type === "ordering" && (
        <OrderingGame
          gameId={game.id}
          items={(cfg.items as { id: number; text: string }[]) ?? []}
          bestScore={bestScore}
          onComplete={handleComplete}
          onExit={handleExit}
          onPlayAnother={inIframe ? undefined : handlePlayAnother}
        />
      )}
      {game.type === "visual_quiz" && (
        <VisualQuizGame
          gameId={game.id}
          questions={(cfg.questions as { id: number; question: string; imageUrl: string; options: { text: string; correct: boolean }[] }[]) ?? []}
          bestScore={bestScore}
          onComplete={handleComplete}
          onExit={handleExit}
          onPlayAnother={inIframe ? undefined : handlePlayAnother}
        />
      )}
      {game.type === "true_false" && (
        <TrueFalseGame
          gameId={game.id}
          statements={(cfg.statements as { id: number; text: string; correct: boolean }[]) ?? []}
          bestScore={bestScore}
          onComplete={handleComplete}
          onExit={handleExit}
          onPlayAnother={inIframe ? undefined : handlePlayAnother}
        />
      )}
      {game.type === "matching" && (
        <MatchingGame
          gameId={game.id}
          pairs={(cfg.pairs as { id: number; left: string; right: string }[]) ?? []}
          bestScore={bestScore}
          onComplete={handleComplete}
          onExit={handleExit}
          onPlayAnother={inIframe ? undefined : handlePlayAnother}
        />
      )}
      {game.type === "word_scramble" && (
        <WordScrambleGame
          gameId={game.id}
          words={(cfg.words as { id: number; word: string; hint: string }[]) ?? []}
          bestScore={bestScore}
          onComplete={handleComplete}
          onExit={handleExit}
          onPlayAnother={inIframe ? undefined : handlePlayAnother}
        />
      )}
      {game.type === "next_ingredient" && (
        <NextIngredientGame
          gameId={game.id}
          recipeName={(cfg.recipeName as string) ?? "Receita"}
          ingredients={(cfg.ingredients as { id: number; name: string; emoji: string }[]) ?? []}
          bestScore={bestScore}
          onComplete={handleComplete}
          onExit={handleExit}
          onPlayAnother={inIframe ? undefined : handlePlayAnother}
        />
      )}
    </div>
  );
}
