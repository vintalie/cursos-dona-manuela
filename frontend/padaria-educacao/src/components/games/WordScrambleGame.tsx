import { useState, useEffect, useCallback } from "react";
import { completeGame } from "@/services/game.service";
import { showAlert } from "@/contexts/AlertPopupContext";
import { Lightbulb } from "lucide-react";
import GameResultActions from "./GameResultActions";

interface ScrambleWord {
  id: number;
  word: string;
  hint: string;
}

interface WordScrambleGameProps {
  gameId: number;
  words: ScrambleWord[];
  bestScore: number;
  onComplete: (score: number, newBest: boolean) => void;
  onExit: () => void;
  onPlayAnother?: () => void;
}

function scramble(word: string): string[] {
  const letters = word.toUpperCase().split("");
  for (let i = letters.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [letters[i], letters[j]] = [letters[j], letters[i]];
  }
  if (letters.join("") === word.toUpperCase() && word.length > 1) {
    [letters[0], letters[letters.length - 1]] = [letters[letters.length - 1], letters[0]];
  }
  return letters;
}

export default function WordScrambleGame({
  gameId,
  words,
  bestScore,
  onComplete,
  onExit,
}: WordScrambleGameProps) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [scrambled, setScrambled] = useState<string[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [results, setResults] = useState<boolean[]>([]);
  const [showHint, setShowHint] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [finished, setFinished] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [startTime] = useState(Date.now());

  const current = words[currentIdx];

  const initWord = useCallback(() => {
    if (!current) return;
    setScrambled(scramble(current.word));
    setSelected([]);
    setShowHint(false);
    setShowResult(false);
  }, [current]);

  useEffect(() => {
    initWord();
  }, [initWord]);

  const initGame = useCallback(() => {
    setCurrentIdx(0);
    setResults([]);
    setFinished(false);
  }, []);

  function handlePickLetter(idx: number) {
    if (selected.includes(idx) || showResult || isSubmitting) return;
    setSelected((prev) => [...prev, idx]);
  }

  function handleUndoLetter() {
    if (showResult || isSubmitting || selected.length === 0) return;
    setSelected((prev) => prev.slice(0, -1));
  }

  const formedWord = selected.map((i) => scrambled[i]).join("");
  const targetWord = current?.word.toUpperCase() ?? "";

  useEffect(() => {
    if (!current || showResult) return;
    if (formedWord.length === targetWord.length) {
      const isCorrect = formedWord === targetWord;
      setShowResult(true);
      setResults((prev) => [...prev, isCorrect]);

      setTimeout(() => {
        if (currentIdx < words.length - 1) {
          setCurrentIdx(currentIdx + 1);
        } else {
          const newResults = [...results, isCorrect];
          const correctCount = newResults.filter(Boolean).length;
          const score = Math.round((correctCount / words.length) * 100);
          const timeSeconds = Math.floor((Date.now() - startTime) / 1000);

          setFinished(true);
          setIsSubmitting(true);

          completeGame(gameId, {
            score,
            time_seconds: timeSeconds,
            completed: true,
            metadata: { correct: correctCount, total: words.length },
          })
            .then((res) => {
              onComplete(res.best_score, res.new_best);
            })
            .catch(() => showAlert({ type: "error", message: "Erro ao salvar o resultado." }))
            .finally(() => setIsSubmitting(false));
        }
      }, 1200);
    }
  }, [formedWord, targetWord, current, showResult, currentIdx, words.length, results, gameId, startTime, onComplete]);

  const correctCount = results.filter(Boolean).length;

  if (finished) {
    const score = Math.round((correctCount / words.length) * 100);
    const won = score >= 70;
    return (
      <div className="ws-game game-result-screen">
        <div className="ws-result">
          <span className={won ? "game-result-badge won" : "game-result-badge lost"}>
            {won ? "Vitória!" : "Tente novamente"}
          </span>
          <p className="ws-result-score text-muted-foreground mt-2">
            Você acertou {correctCount} de {words.length} palavras ({score}%)
          </p>
          <p className="text-sm text-muted-foreground mb-4">Melhor: {bestScore}%</p>
          <div className="ws-result-review">
            {words.map((w, i) => (
              <div key={w.id} className={`ws-review-item ${results[i] ? "correct" : "wrong"}`}>
                <span className="ws-review-word">{w.word}</span>
                <span className="ws-review-hint">{w.hint}</span>
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

  return (
    <div className="ws-game">
      <div className="ws-header">
        <div className="ws-stats">
          <span>Melhor: {bestScore}%</span>
          <span>Palavra {currentIdx + 1}/{words.length}</span>
        </div>
        <button type="button" onClick={onExit} className="ws-exit" disabled={isSubmitting}>
          Sair
        </button>
      </div>

      <div className="ws-hint-area">
        <button
          type="button"
          className="ws-hint-btn"
          onClick={() => setShowHint(true)}
          disabled={showHint}
        >
          <Lightbulb size={16} /> {showHint ? current.hint : "Ver dica"}
        </button>
      </div>

      <div className="ws-formed">
        {targetWord.split("").map((_, i) => (
          <div
            key={i}
            className={`ws-formed-slot ${
              showResult
                ? formedWord[i] === targetWord[i]
                  ? "correct"
                  : "wrong"
                : selected[i] !== undefined
                  ? "filled"
                  : ""
            }`}
          >
            {formedWord[i] ?? ""}
          </div>
        ))}
      </div>

      {!showResult && (
        <button type="button" onClick={handleUndoLetter} className="ws-undo" disabled={selected.length === 0}>
          Desfazer
        </button>
      )}

      <div className="ws-scrambled">
        {scrambled.map((letter, i) => (
          <button
            key={i}
            type="button"
            className={`ws-letter ${selected.includes(i) ? "used" : ""}`}
            onClick={() => handlePickLetter(i)}
            disabled={selected.includes(i) || showResult || isSubmitting}
          >
            {letter}
          </button>
        ))}
      </div>

      {showResult && (
        <p className={`ws-feedback ${formedWord === targetWord ? "correct" : "wrong"}`}>
          {formedWord === targetWord
            ? "Correto!"
            : `A resposta correta é: ${current.word}`}
        </p>
      )}
    </div>
  );
}
