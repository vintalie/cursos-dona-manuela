import { Play, ArrowLeft } from "lucide-react";

const GAME_TYPE_LAYOUTS: Record<string, { icon: string; className: string }> = {
  memory: { icon: "🧠", className: "game-intro--memory" },
  ordering: { icon: "📋", className: "game-intro--ordering" },
  visual_quiz: { icon: "🖼️", className: "game-intro--vquiz" },
  true_false: { icon: "✓✗", className: "game-intro--tf" },
  matching: { icon: "🔗", className: "game-intro--matching" },
  word_scramble: { icon: "🔤", className: "game-intro--scramble" },
  next_ingredient: { icon: "👨‍🍳", className: "game-intro--ni" },
};

interface GameIntroScreenProps {
  title: string;
  gameType: string;
  onStart: () => void;
  onExit: () => void;
}

export default function GameIntroScreen({ title, gameType, onStart, onExit }: GameIntroScreenProps) {
  const layout = GAME_TYPE_LAYOUTS[gameType] ?? { icon: "🎮", className: "game-intro--default" };

  return (
    <div className={`game-intro ${layout.className}`}>
      <div className="game-intro-content">
        <div className="game-intro-icon">{layout.icon}</div>
        <h2 className="game-intro-title">{title}</h2>
        <p className="game-intro-subtitle">Pronto para começar?</p>
        <div className="game-intro-actions">
          <button type="button" onClick={onStart} className="game-intro-btn game-intro-btn-primary">
            <Play size={20} />
            Iniciar
          </button>
          <button type="button" onClick={onExit} className="game-intro-btn game-intro-btn-secondary">
            <ArrowLeft size={18} />
            Voltar
          </button>
        </div>
      </div>
    </div>
  );
}
