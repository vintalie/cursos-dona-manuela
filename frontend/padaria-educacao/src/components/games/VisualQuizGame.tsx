import { useState, useEffect, useCallback } from "react";
import { completeGame } from "@/services/game.service";
import { showAlert } from "@/contexts/AlertPopupContext";
import GameResultActions from "./GameResultActions";

interface QuizOption {
  text: string;
  correct: boolean;
}

interface QuizQuestion {
  id: number;
  question: string;
  imageUrl: string;
  options: QuizOption[];
}

interface VisualQuizGameProps {
  gameId: number;
  questions: QuizQuestion[];
  bestScore: number;
  onComplete: (score: number, newBest: boolean) => void;
  onExit: () => void;
  onPlayAnother?: () => void;
}

export default function VisualQuizGame({
  gameId,
  questions,
  bestScore,
  onComplete,
  onExit,
  onPlayAnother,
}: VisualQuizGameProps) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [finished, setFinished] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [startTime] = useState(Date.now());

  const initGame = useCallback(() => {
    setCurrentIdx(0);
    setAnswers(new Array(questions.length).fill(null));
    setShowFeedback(false);
    setFinished(false);
  }, [questions]);

  useEffect(() => {
    initGame();
  }, [initGame]);

  const current = questions[currentIdx];
  const selectedOptionIdx = answers[currentIdx];

  function handleSelectOption(optIdx: number) {
    if (showFeedback || finished || isSubmitting) return;

    const newAnswers = [...answers];
    newAnswers[currentIdx] = optIdx;
    setAnswers(newAnswers);
    setShowFeedback(true);

    setTimeout(() => {
      setShowFeedback(false);
      if (currentIdx < questions.length - 1) {
        setCurrentIdx(currentIdx + 1);
      } else {
        const correctCount = newAnswers.reduce((acc, ans, i) => {
          if (ans !== null && questions[i].options[ans]?.correct) return acc + 1;
          return acc;
        }, 0);
        const score = Math.round((correctCount / questions.length) * 100);
        const timeSeconds = Math.floor((Date.now() - startTime) / 1000);

        setFinished(true);
        setIsSubmitting(true);

        completeGame(gameId, {
          score,
          time_seconds: timeSeconds,
          completed: true,
          metadata: { correct: correctCount, total: questions.length },
        })
          .then((res) => {
            onComplete(res.best_score, res.new_best);
          })
          .catch(() => showAlert({ type: "error", message: "Erro ao salvar o resultado." }))
          .finally(() => setIsSubmitting(false));
      }
    }, 1200);
  }

  const correctCount = answers.reduce((acc, ans, i) => {
    if (ans !== null && questions[i].options[ans]?.correct) return acc + 1;
    return acc;
  }, 0);

  if (finished) {
    const score = Math.round((correctCount / questions.length) * 100);
    const won = score >= 70;
    return (
      <div className="vquiz-game game-result-screen">
        <div className="vquiz-result">
          <span className={won ? "game-result-badge won" : "game-result-badge lost"}>
            {won ? "Vitória!" : "Tente novamente"}
          </span>
          <p className="vquiz-result-score text-muted-foreground mt-2">
            Você acertou {correctCount} de {questions.length} questões ({score}%)
          </p>
          <p className="text-sm text-muted-foreground mb-4">Melhor pontuação: {bestScore}%</p>
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

  return (
    <div className="vquiz-game">
      <div className="vquiz-header">
        <div className="vquiz-stats">
          <span>Melhor: {bestScore}%</span>
          <span>Questão {currentIdx + 1}/{questions.length}</span>
        </div>
        <button type="button" onClick={onExit} className="vquiz-exit" disabled={isSubmitting}>
          Sair
        </button>
      </div>

      <div className="vquiz-question">
        <div className="vquiz-image-wrap">
          <img
            src={current.imageUrl}
            alt={current.question}
            className="vquiz-image"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Crect fill='%23ddd' width='200' height='200'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%23999' font-size='14'%3EImagem%3C/text%3E%3C/svg%3E";
            }}
          />
        </div>
        <p className="vquiz-question-text">{current.question}</p>
      </div>

      <div className="vquiz-options">
        {current.options.map((opt, i) => {
          let stateClass = "";
          if (showFeedback && selectedOptionIdx !== null) {
            if (opt.correct) stateClass = "correct";
            else if (i === selectedOptionIdx && !opt.correct) stateClass = "wrong";
          }
          return (
            <button
              key={i}
              type="button"
              className={`vquiz-option ${stateClass}`}
              onClick={() => handleSelectOption(i)}
              disabled={showFeedback || isSubmitting}
            >
              {opt.text}
            </button>
          );
        })}
      </div>
    </div>
  );
}
