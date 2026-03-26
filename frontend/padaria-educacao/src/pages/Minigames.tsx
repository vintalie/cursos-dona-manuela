import { useEffect, useState } from "react";
import { setDocumentTitle } from "@/config/appConfig";
import { getGames, type Game } from "@/services/game.service";
import PageLoader from "@/components/ui/PageLoader";
import EmptyState from "@/components/ui/EmptyState";
import MemoryGame from "@/components/games/MemoryGame";
import OrderingGame from "@/components/games/OrderingGame";
import VisualQuizGame from "@/components/games/VisualQuizGame";
import TrueFalseGame from "@/components/games/TrueFalseGame";
import MatchingGame from "@/components/games/MatchingGame";
import WordScrambleGame from "@/components/games/WordScrambleGame";
import NextIngredientGame from "@/components/games/NextIngredientGame";
import GameIntroScreen from "@/components/games/GameIntroScreen";
import { Gamepad2 } from "lucide-react";

const GAME_TYPE_LABELS: Record<string, string> = {
  memory: "Memória",
  ordering: "Monte a Receita",
  visual_quiz: "Identifique o Produto",
  true_false: "V ou F",
  matching: "Conecte os Pares",
  word_scramble: "Descubra a Palavra",
  next_ingredient: "Qual o Próximo?",
};

export default function Minigames() {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [playingGame, setPlayingGame] = useState<Game | null>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [bestScores, setBestScores] = useState<Record<number, number>>({});

  useEffect(() => {
    setDocumentTitle("Minigames");
  }, []);

  function fetchGames() {
    setLoading(true);
    setError(false);
    getGames()
      .then((res) => {
        setGames(res.games);
        setBestScores((prev) => {
          const next = { ...prev };
          res.games.forEach((g) => {
            next[g.id] = g.best_score;
          });
          return next;
        });
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    fetchGames();
  }, []);

  function handleComplete(gameId: number, score: number, newBest: boolean) {
    setBestScores((prev) => ({ ...prev, [gameId]: score }));
    if (newBest) {
      fetchGames();
    }
  }

  if (playingGame && !gameStarted) {
    return (
      <div className="minigames-page">
        <GameIntroScreen
          title={playingGame.title}
          gameType={playingGame.type}
          onStart={() => setGameStarted(true)}
          onExit={() => { setPlayingGame(null); setGameStarted(false); }}
        />
      </div>
    );
  }

  const handleExitGame = () => {
    setPlayingGame(null);
    setGameStarted(false);
  };

  if (playingGame?.type === "memory") {
    const pairs = (playingGame.config?.pairs as { id: number; label: string; emoji: string }[]) ?? [];
    return (
      <div className="minigames-page">
        <MemoryGame
          gameId={playingGame.id}
          pairs={pairs}
          bestScore={bestScores[playingGame.id] ?? playingGame.best_score}
          onComplete={(score, newBest) => handleComplete(playingGame.id, score, newBest)}
          onExit={handleExitGame}
          onPlayAnother={handleExitGame}
        />
      </div>
    );
  }

  if (playingGame?.type === "ordering") {
    const items = (playingGame.config?.items as { id: number; text: string }[]) ?? [];
    return (
      <div className="minigames-page">
        <OrderingGame
          gameId={playingGame.id}
          items={items}
          bestScore={bestScores[playingGame.id] ?? playingGame.best_score}
          onComplete={(score, newBest) => handleComplete(playingGame.id, score, newBest)}
          onExit={handleExitGame}
          onPlayAnother={handleExitGame}
        />
      </div>
    );
  }

  if (playingGame?.type === "visual_quiz") {
    const questions = (playingGame.config?.questions as { id: number; question: string; imageUrl: string; options: { text: string; correct: boolean }[] }[]) ?? [];
    return (
      <div className="minigames-page">
        <VisualQuizGame
          gameId={playingGame.id}
          questions={questions}
          bestScore={bestScores[playingGame.id] ?? playingGame.best_score}
          onComplete={(score, newBest) => handleComplete(playingGame.id, score, newBest)}
          onExit={handleExitGame}
          onPlayAnother={handleExitGame}
        />
      </div>
    );
  }

  if (playingGame?.type === "true_false") {
    const statements = (playingGame.config?.statements as { id: number; text: string; correct: boolean }[]) ?? [];
    return (
      <div className="minigames-page">
        <TrueFalseGame
          gameId={playingGame.id}
          statements={statements}
          bestScore={bestScores[playingGame.id] ?? playingGame.best_score}
          onComplete={(score, newBest) => handleComplete(playingGame.id, score, newBest)}
          onExit={handleExitGame}
          onPlayAnother={handleExitGame}
        />
      </div>
    );
  }

  if (playingGame?.type === "matching") {
    const pairs = (playingGame.config?.pairs as { id: number; left: string; right: string }[]) ?? [];
    return (
      <div className="minigames-page">
        <MatchingGame
          gameId={playingGame.id}
          pairs={pairs}
          bestScore={bestScores[playingGame.id] ?? playingGame.best_score}
          onComplete={(score, newBest) => handleComplete(playingGame.id, score, newBest)}
          onExit={handleExitGame}
          onPlayAnother={handleExitGame}
        />
      </div>
    );
  }

  if (playingGame?.type === "word_scramble") {
    const words = (playingGame.config?.words as { id: number; word: string; hint: string }[]) ?? [];
    return (
      <div className="minigames-page">
        <WordScrambleGame
          gameId={playingGame.id}
          words={words}
          bestScore={bestScores[playingGame.id] ?? playingGame.best_score}
          onComplete={(score, newBest) => handleComplete(playingGame.id, score, newBest)}
          onExit={handleExitGame}
          onPlayAnother={handleExitGame}
        />
      </div>
    );
  }

  if (playingGame?.type === "next_ingredient") {
    const cfg = playingGame.config as Record<string, unknown>;
    const recipeName = (cfg.recipeName as string) ?? "Receita";
    const ingredients = (cfg.ingredients as { id: number; name: string; emoji: string }[]) ?? [];
    return (
      <div className="minigames-page">
        <NextIngredientGame
          gameId={playingGame.id}
          recipeName={recipeName}
          ingredients={ingredients}
          bestScore={bestScores[playingGame.id] ?? playingGame.best_score}
          onComplete={(score, newBest) => handleComplete(playingGame.id, score, newBest)}
          onExit={handleExitGame}
          onPlayAnother={handleExitGame}
        />
      </div>
    );
  }

  return (
    <PageLoader loading={loading}>
      <div className="minigames-page">
        <h2 className="page-title">Minigames</h2>
        <p className="text-muted-foreground mb-6">
          Pratique e divirta-se com jogos educativos sobre padaria.
        </p>

        {error && (
          <EmptyState
            icon={<Gamepad2 size={48} />}
            title="Erro ao carregar"
            description="Não foi possível carregar os minigames. Tente novamente."
            onRetry={fetchGames}
          />
        )}

        {!error && games.length === 0 && (
          <EmptyState
            icon={<Gamepad2 size={48} />}
            title="Nenhum minigame disponível"
            description="Em breve teremos novos jogos para você."
          />
        )}

        {!error && games.length > 0 && (
          <div className="minigames-grid">
            {games.map((game) => (
              <div key={game.id} className="minigame-card">
                <h4>{game.title}</h4>
                {game.description && <p>{game.description}</p>}
                <div className="minigame-card-stats">
                  <span>Melhor: {game.best_score}</span>
                  <span>Tentativas: {game.attempts}</span>
                  <span>{GAME_TYPE_LABELS[game.type] ?? game.type}</span>
                </div>
                <button
                  type="button"
                  className="minigame-card-play"
                  onClick={() => { setPlayingGame(game); setGameStarted(false); }}
                  disabled={!game.unlocked}
                >
                  {game.unlocked ? "Jogar" : "Bloqueado"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </PageLoader>
  );
}
