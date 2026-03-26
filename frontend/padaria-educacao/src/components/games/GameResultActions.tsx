import { RotateCcw, Gamepad2, ArrowLeft } from "lucide-react";

interface GameResultActionsProps {
  onPlayAgain: () => void;
  onPlayAnother?: () => void;
  onBack: () => void;
  disabled?: boolean;
}

export default function GameResultActions({
  onPlayAgain,
  onPlayAnother,
  onBack,
  disabled = false,
}: GameResultActionsProps) {
  return (
    <div className="game-result-actions">
      <button
        type="button"
        onClick={onPlayAgain}
        className="game-result-btn game-result-btn-primary"
        disabled={disabled}
      >
        <RotateCcw size={16} />
        Jogar novamente
      </button>
      {onPlayAnother && (
        <button
          type="button"
          onClick={onPlayAnother}
          className="game-result-btn game-result-btn-secondary"
          disabled={disabled}
        >
          <Gamepad2 size={16} />
          Jogar outro
        </button>
      )}
      <button
        type="button"
        onClick={onBack}
        className="game-result-btn game-result-btn-outline"
        disabled={disabled}
      >
        <ArrowLeft size={16} />
        Voltar
      </button>
    </div>
  );
}
