import { useState, useEffect, useCallback } from "react";
import { completeGame } from "@/services/game.service";
import { showAlert } from "@/contexts/AlertPopupContext";
import { Check, X } from "lucide-react";
import GameResultActions from "./GameResultActions";

interface Statement {
  id: number;
  text: string;
  correct: boolean;
}

interface TrueFalseGameProps {
  gameId: number;
  statements: Statement[];
  bestScore: number;
  onComplete: (score: number, newBest: boolean) => void;
  onExit: () => void;
  onPlayAnother?: () => void;
}

export default function TrueFalseGame({
  gameId,
  statements,
  bestScore,
  onComplete,
  onExit,
  onPlayAnother,
}: TrueFalseGameProps) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<(boolean | null)[]>([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [finished, setFinished] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [startTime] = useState(Date.now());

  const initGame = useCallback(() => {
    setCurrentIdx(0);
    setAnswers(new Array(statements.length).fill(null));
    setShowFeedback(false);
    setFinished(false);
  }, [statements]);

  useEffect(() => {
    initGame();
  }, [initGame]);

  const current = statements[currentIdx];
  const userAnswer = answers[currentIdx];

  function handleAnswer(answer: boolean) {
    if (showFeedback || finished || isSubmitting) return;

    const newAnswers = [...answers];
    newAnswers[currentIdx] = answer;
    setAnswers(newAnswers);
    setShowFeedback(true);

    setTimeout(() => {
      setShowFeedback(false);
      if (currentIdx < statements.length - 1) {
        setCurrentIdx(currentIdx + 1);
      } else {
        const correctCount = newAnswers.reduce((acc, ans, i) => {
          if (ans === statements[i].correct) return acc + 1;
          return acc;
        }, 0);
        const score = Math.round((correctCount / statements.length) * 100);
        const timeSeconds = Math.floor((Date.now() - startTime) / 1000);

        setFinished(true);
        setIsSubmitting(true);

        completeGame(gameId, {
          score,
          time_seconds: timeSeconds,
          completed: true,
          metadata: { correct: correctCount, total: statements.length },
        })
          .then((res) => {
            onComplete(res.best_score, res.new_best);
          })
          .catch(() => showAlert({ type: "error", message: "Erro ao salvar o resultado." }))
          .finally(() => setIsSubmitting(false));
      }
    }, 1000);
  }

  const correctCount = answers.reduce((acc, ans, i) => {
    if (ans === statements[i]?.correct) return acc + 1;
    return acc;
  }, 0);

  if (finished) {
    const score = Math.round((correctCount / statements.length) * 100);
    const won = score >= 70;
    return (
      <div className="tf-game game-result-screen">
        <div className="tf-result">
          <span className={won ? "game-result-badge won" : "game-result-badge lost"}>
            {won ? "Vitória!" : "Tente novamente"}
          </span>
          <p className="tf-result-score text-muted-foreground mt-2">
            Você acertou {correctCount} de {statements.length} ({score}%)
          </p>
          <p className="text-sm text-muted-foreground mb-4">Melhor: {bestScore}%</p>
          <div className="tf-result-review">
            {statements.map((s, i) => (
              <div key={s.id} className={`tf-review-item ${answers[i] === s.correct ? "correct" : "wrong"}`}>
                <span className="tf-review-icon">
                  {answers[i] === s.correct ? <Check size={14} /> : <X size={14} />}
                </span>
                <span className="tf-review-text">{s.text}</span>
                <span className="tf-review-answer">
                  {s.correct ? "Verdadeiro" : "Falso"}
                </span>
              </div>
            ))}
          </div>
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

  if (!current) return null;

  const isCorrect = showFeedback && userAnswer === current.correct;
  const isWrong = showFeedback && userAnswer !== current.correct;

  return (
    <div className="tf-game">
      <div className="tf-header">
        <div className="tf-stats">
          <span>Melhor: {bestScore}%</span>
          <span>{currentIdx + 1}/{statements.length}</span>
        </div>
        <button type="button" onClick={onExit} className="tf-exit" disabled={isSubmitting}>
          Sair
        </button>
      </div>

      <div className="tf-progress-bar">
        <div className="tf-progress-fill" style={{ width: `${((currentIdx) / statements.length) * 100}%` }} />
      </div>

      <div className={`tf-statement ${isCorrect ? "correct" : ""} ${isWrong ? "wrong" : ""}`}>
        <p className="tf-statement-text">{current.text}</p>
        {showFeedback && (
          <p className="tf-statement-feedback">
            {isCorrect ? "Correto!" : `Incorreto — a resposta é: ${current.correct ? "Verdadeiro" : "Falso"}`}
          </p>
        )}
      </div>

      <div className="tf-buttons">
        <button
          type="button"
          className={`tf-answer-btn tf-answer-true ${showFeedback && userAnswer === true ? (isCorrect ? "correct" : "wrong") : ""}`}
          onClick={() => handleAnswer(true)}
          disabled={showFeedback || isSubmitting}
        >
          <Check size={20} /> Verdadeiro
        </button>
        <button
          type="button"
          className={`tf-answer-btn tf-answer-false ${showFeedback && userAnswer === false ? (isCorrect ? "correct" : "wrong") : ""}`}
          onClick={() => handleAnswer(false)}
          disabled={showFeedback || isSubmitting}
        >
          <X size={20} /> Falso
        </button>
      </div>
    </div>
  );
}
