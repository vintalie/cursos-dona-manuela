import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import type { Question, Option } from "@/types";

interface AssessmentProps {
  assessmentId: number;
  title: string;
  questions: Question[];
  maxScore?: number;
  minScore?: number;
  isCompleted?: boolean;
  onSubmit: (score: number) => Promise<void>;
}

export default function AssessmentComponent({ assessmentId, title, questions, maxScore, minScore, isCompleted = false, onSubmit }: AssessmentProps) {
  const [answers, setAnswers] = useState<Record<number, number[]>>({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ correct: number; score: number; total: number; maxScore: number; minScore: number | null } | null>(null);
  const [showResultDialog, setShowResultDialog] = useState(false);

  useEffect(() => {
    if (assessmentId) {
      setSubmitted(false);
      setResult(null);
      setAnswers({});
      setShowResultDialog(false);
    }
  }, [assessmentId]);

  const toggleOption = (questionId: number, optionId: number, isMultiple: boolean) => {
    setAnswers((prev) => {
      const current = prev[questionId] ?? [];
      if (isMultiple) {
        const has = current.includes(optionId);
        if (has) return { ...prev, [questionId]: current.filter((id) => id !== optionId) };
        return { ...prev, [questionId]: [...current, optionId] };
      }
      return { ...prev, [questionId]: [optionId] };
    });
  };

  const allAnswered = questions.every((q) => {
    const a = answers[q.id];
    return a && a.length > 0;
  });

  const calculateScore = () => {
    let correct = 0;
    questions.forEach((q) => {
      const selected = answers[q.id] ?? [];
      const correctIds = (q.options ?? []).filter((o) => o.is_correct).map((o) => o.id);
      const allCorrect = correctIds.length > 0 && selected.length === correctIds.length && selected.every((id) => correctIds.includes(id));
      if (allCorrect) correct++;
    });
    return { correct, total: questions.length };
  };

  async function handleSubmit() {
    if (!allAnswered || loading) return;
    setLoading(true);
    try {
      const { correct, total } = calculateScore();
      const max = maxScore ?? 100;
      const score = total > 0 ? Math.round((correct / total) * max) : 0;
      await onSubmit(score);
      const res = { correct, score, total, maxScore: max, minScore: minScore ?? null };
      setResult(res);
      setSubmitted(true);
      setShowResultDialog(true);
    } finally {
      setLoading(false);
    }
  }

  if (questions.length === 0) {
    return (
      <div className="lesson-card">
        <h1>{title}</h1>
        <p className="text-muted-foreground">Nenhuma pergunta nesta avaliação.</p>
      </div>
    );
  }

  return (
    <div className="lesson-card">
      <h1>{title}</h1>
      {(maxScore != null || minScore != null) && (
        <p className="text-sm text-muted-foreground mb-4">
          {maxScore != null && `Nota máxima: ${maxScore}`}
          {maxScore != null && minScore != null && " • "}
          {minScore != null && `Nota mínima para aprovação: ${minScore}`}
        </p>
      )}
      <div className="space-y-6">
        {questions.map((q) => (
          <div key={q.id} className="mb-4">
            <p className="font-medium mb-2">{q.text}</p>
            <div className="options">
              {(q.options ?? []).map((opt: Option) => (
                <button
                  key={opt.id}
                  type="button"
                  className={`option-btn ${(answers[q.id] ?? []).includes(opt.id) ? "selected" : ""}`}
                  onClick={() => toggleOption(q.id, opt.id, q.is_multiple_choice ?? false)}
                >
                  {opt.label}. {opt.text}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      {!submitted && !isCompleted ? (
        <button
          className="submit-btn"
          onClick={handleSubmit}
          disabled={!allAnswered || loading}
        >
          {loading ? "Enviando..." : "Finalizar Avaliação"}
        </button>
      ) : (
        <div className="result space-y-2 p-4 rounded-xl bg-muted/30">
          <p className="font-medium text-muted-foreground">
            ✅ Avaliação concluída
          </p>
          {result && (
            <p className="text-sm">
              Você acertou {result.correct} de {result.total} questões.
              {result.maxScore != null && (
                <span className="block mt-1">
                  Nota: {result.score} de {result.maxScore} {result.maxScore !== 100 ? "pontos" : ""}
                </span>
              )}
            </p>
          )}
        </div>
      )}

      <Dialog open={showResultDialog} onOpenChange={setShowResultDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl">Avaliação concluída!</DialogTitle>
            <DialogDescription asChild>
              <div className="space-y-3 pt-2">
                {result && (
                  <>
                    <p className="text-base font-medium text-foreground">
                      Você acertou <span className="text-primary">{result.correct}</span> de{" "}
                      <span className="text-primary">{result.total}</span> questões.
                    </p>
                    <p className="text-base">
                      Nota obtida: <span className="font-semibold">{result.score}</span>
                      {result.maxScore != null && (
                        <span className="text-muted-foreground"> de {result.maxScore} pontos</span>
                      )}
                    </p>
                    {result.minScore != null && (
                      <p className={result.score >= result.minScore ? "text-green-600 font-medium" : "text-destructive font-medium"}>
                        {result.score >= result.minScore ? "✓ Aprovado!" : `✗ Reprovado (nota mínima: ${result.minScore})`}
                      </p>
                    )}
                  </>
                )}
              </div>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <button
              type="button"
              className="btn-primary"
              onClick={() => setShowResultDialog(false)}
            >
              OK
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
