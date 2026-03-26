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

// Uma questão é de resposta escrita quando não possui opções de alternativa
function isTextQuestion(q: Question): boolean {
  return !q.options || q.options.length === 0;
}

export default function AssessmentComponent({ assessmentId, title, questions, maxScore, minScore, isCompleted = false, onSubmit }: AssessmentProps) {
  const [answers, setAnswers] = useState<Record<number, number[]>>({});
  const [textAnswers, setTextAnswers] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ correct: number; score: number; total: number; maxScore: number; minScore: number | null } | null>(null);
  const [showResultDialog, setShowResultDialog] = useState(false);

  useEffect(() => {
    if (assessmentId) {
      setSubmitted(false);
      setResult(null);
      setAnswers({});
      setTextAnswers({});
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
    if (isTextQuestion(q)) {
      return (textAnswers[q.id] ?? "").trim().length > 0;
    }
    const a = answers[q.id];
    return a && a.length > 0;
  });

  const calculateScore = () => {
    let correct = 0;
    // Somente questões de alternativas são corrigidas automaticamente
    const scorableQuestions = questions.filter((q) => !isTextQuestion(q));
    scorableQuestions.forEach((q) => {
      const selected = answers[q.id] ?? [];
      const correctIds = (q.options ?? []).filter((o) => o.is_correct).map((o) => o.id);
      const allCorrect = correctIds.length > 0 && selected.length === correctIds.length && selected.every((id) => correctIds.includes(id));
      if (allCorrect) correct++;
    });
    return { correct, total: scorableQuestions.length };
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

            {isTextQuestion(q) ? (
              /* Questão de resposta escrita */
              <div className="answer-text-block">
                <textarea
                  className="answer-text-input"
                  placeholder="Digite sua resposta aqui..."
                  value={textAnswers[q.id] ?? ""}
                  onChange={(e) =>
                    setTextAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))
                  }
                  disabled={submitted || isCompleted}
                />
                {(submitted || isCompleted) && q.answer_text && (
                  <div className="mt-3 p-2 rounded-lg bg-primary/5 border border-primary/20 text-sm">
                    <span className="font-medium text-primary">Resposta esperada: </span>
                    <span className="text-foreground">{q.answer_text}</span>
                  </div>
                )}
              </div>
            ) : (
              /* Questão de alternativas (múltipla escolha ou única) */
              <div className="options">
                {(q.options ?? []).map((opt: Option) => (
                  <button
                    key={opt.id}
                    type="button"
                    className={`option-btn ${(answers[q.id] ?? []).includes(opt.id) ? "selected" : ""}`}
                    onClick={() => toggleOption(q.id, opt.id, q.is_multiple_choice ?? false)}
                    disabled={submitted || isCompleted}
                  >
                    {opt.label}. {opt.text}
                  </button>
                ))}
              </div>
            )}
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
          {result && result.total > 0 && (
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
                    {result.total > 0 ? (
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
                    ) : (
                      <p className="text-base text-muted-foreground">
                        Suas respostas foram registradas. A correção será feita pelo instrutor.
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
