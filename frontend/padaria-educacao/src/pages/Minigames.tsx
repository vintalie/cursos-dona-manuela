import { useEffect, useState } from "react";
import { setDocumentTitle } from "@/config/appConfig";
import { getGames, type Game } from "@/services/game.service";
import PageLoader from "@/components/ui/PageLoader";
import EmptyState from "@/components/ui/EmptyState";
import MemoryGame from "@/components/games/MemoryGame";
import { Gamepad2 } from "lucide-react";

const GAME_TYPE_LABELS: Record<string, string> = {
  memory: "Memória",
  quiz: "Quiz",
  ordering: "Ordenação",
};

export default function Minigames() {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [playingGame, setPlayingGame] = useState<Game | null>(null);
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

  if (playingGame?.type === "memory") {
    const pairs = (playingGame.config?.pairs as { id: number; label: string; emoji: string }[]) ?? [];
    return (
      <div className="minigames-page">
        <MemoryGame
          gameId={playingGame.id}
          pairs={pairs}
          bestScore={bestScores[playingGame.id] ?? playingGame.best_score}
          onComplete={(score, newBest) => {
            handleComplete(playingGame.id, score, newBest);
            setPlayingGame(null);
          }}
          onExit={() => setPlayingGame(null)}
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
                  onClick={() => setPlayingGame(game)}
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
