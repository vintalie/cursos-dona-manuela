import { useState, useEffect, useCallback } from "react";
import { completeGame } from "@/services/game.service";
import { showAlert } from "@/contexts/AlertPopupContext";
import { ChefHat } from "lucide-react";
import GameResultActions from "./GameResultActions";

interface Ingredient {
  id: number;
  name: string;
  emoji: string;
}

interface NextIngredientGameProps {
  gameId: number;
  recipeName: string;
  ingredients: Ingredient[];
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

export default function NextIngredientGame({
  gameId,
  recipeName,
  ingredients,
  bestScore,
  onComplete,
  onExit,
}: NextIngredientGameProps) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<(boolean | null)[]>([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [finished, setFinished] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [startTime] = useState(Date.now());
  const [shuffledOptions, setShuffledOptions] = useState<Ingredient[]>([]);

  const totalSteps = Math.max(0, ingredients.length - 1);
  const hasEnoughIngredients = ingredients.length >= 2;

  const initGame = useCallback(() => {
    setStep(0);
    setAnswers([]);
    setShowFeedback(false);
    setSelectedId(null);
    setFinished(false);
  }, []);

  useEffect(() => {
    initGame();
  }, [initGame]);

  useEffect(() => {
    if (step < totalSteps) {
      const remaining = ingredients.slice(step + 1);
      setShuffledOptions(shuffle(remaining));
    }
  }, [step, ingredients, totalSteps]);

  const added = ingredients.slice(0, step + 1);
  const correctNext = ingredients[step + 1];

  function handlePick(ingredient: Ingredient) {
    if (showFeedback || finished || isSubmitting || !correctNext) return;

    const isCorrect = ingredient.id === correctNext.id;
    setSelectedId(ingredient.id);
    setShowFeedback(true);
    setAnswers((prev) => [...prev, isCorrect]);

    setTimeout(() => {
      setShowFeedback(false);
      setSelectedId(null);

      if (step + 1 < totalSteps) {
        setStep(step + 1);
      } else {
        const newAnswers = [...answers, isCorrect];
        const correctCount = newAnswers.filter(Boolean).length;
        const score = Math.round((correctCount / totalSteps) * 100);
        const timeSeconds = Math.floor((Date.now() - startTime) / 1000);

        setFinished(true);
        setIsSubmitting(true);

        completeGame(gameId, {
          score,
          time_seconds: timeSeconds,
          completed: true,
          metadata: { correct: correctCount, total: totalSteps },
        })
          .then((res) => {
            onComplete(res.best_score, res.new_best);
          })
          .catch(() => showAlert({ type: "error", message: "Erro ao salvar o resultado." }))
          .finally(() => setIsSubmitting(false));
      }
    }, 1200);
  }

  const correctCount = answers.filter(Boolean).length;

  if (!hasEnoughIngredients) {
    return (
      <div className="ni-game">
        <p className="text-foreground text-center py-8">Esta receita precisa de pelo menos 2 ingredientes para jogar.</p>
        <div className="flex justify-center mt-4">
          <button type="button" onClick={onExit} className="ni-exit">
            Voltar
          </button>
        </div>
      </div>
    );
  }

  if (finished) {
    const score = totalSteps > 0 ? Math.round((correctCount / totalSteps) * 100) : 0;
    const won = score >= 70;
    return (
      <div className="ni-game game-result-screen">
        <div className="ni-result">
          <ChefHat size={40} className="ni-result-icon" />
          <span className={won ? "game-result-badge won" : "game-result-badge lost"}>
            {won ? "Vitória!" : "Tente novamente"}
          </span>
          <p className="ni-result-recipe text-muted-foreground mt-2">{recipeName}</p>
          <p className="ni-result-score text-muted-foreground">
            Você acertou {correctCount} de {totalSteps} ingredientes ({score}%)
          </p>
          <p className="text-sm text-muted-foreground mb-2">Melhor: {bestScore}%</p>

          <div className="ni-result-sequence">
            {ingredients.map((ing, i) => (
              <div key={ing.id} className="ni-result-ingredient">
                <span className="ni-result-emoji">{ing.emoji}</span>
                <span className="ni-result-name">{ing.name}</span>
                {i < ingredients.length - 1 && i < answers.length && (
                  <span className={`ni-result-check ${answers[i] ? "correct" : "wrong"}`}>
                    {answers[i] ? "✓" : "✗"}
                  </span>
                )}
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

  return (
    <div className="ni-game">
      <div className="ni-header">
        <div className="ni-stats">
          <span>Melhor: {bestScore}%</span>
          <span>Passo {step + 1}/{totalSteps}</span>
        </div>
        <button type="button" onClick={onExit} className="ni-exit" disabled={isSubmitting}>
          Sair
        </button>
      </div>

      <div className="ni-recipe-name">
        <ChefHat size={18} />
        <span>{recipeName}</span>
      </div>

      <div className="ni-progress-bar">
        <div className="ni-progress-fill" style={{ width: `${(step / totalSteps) * 100}%` }} />
      </div>

      <div className="ni-bowl">
        <p className="ni-bowl-label">Ingredientes já adicionados:</p>
        <div className="ni-bowl-items">
          {added.map((ing) => (
            <div key={ing.id} className="ni-bowl-item">
              <span className="ni-bowl-emoji">{ing.emoji}</span>
              <span className="ni-bowl-name">{ing.name}</span>
            </div>
          ))}
        </div>
      </div>

      <p className="ni-question">Qual é o próximo ingrediente?</p>

      <div className="ni-options">
        {shuffledOptions.map((ing) => {
          let stateClass = "";
          if (showFeedback) {
            if (ing.id === correctNext.id) stateClass = "correct";
            else if (ing.id === selectedId) stateClass = "wrong";
          }
          return (
            <button
              key={ing.id}
              type="button"
              className={`ni-option ${stateClass}`}
              onClick={() => handlePick(ing)}
              disabled={showFeedback || isSubmitting}
            >
              <span className="ni-option-emoji">{ing.emoji}</span>
              <span className="ni-option-name">{ing.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
