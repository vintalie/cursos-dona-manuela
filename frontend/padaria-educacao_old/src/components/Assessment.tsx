import React, { useState } from "react";

export default function Assessment() {
  const [selected, setSelected] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const correctAnswer = 1;

  return (
    <div className="lesson-card">
      <h1>Avaliação Final</h1>

      <p>
        Qual das opções abaixo ajuda a evitar contaminação cruzada?
      </p>

      <div className="options">
        <button onClick={() => setSelected(0)}>
          Usar a mesma tábua para carne e legumes
        </button>

        <button onClick={() => setSelected(1)}>
          Separar alimentos crus e cozidos
        </button>

        <button onClick={() => setSelected(2)}>
          Não lavar as mãos entre preparos
        </button>
      </div>

      <button
        className="submit-btn"
        onClick={() => setSubmitted(true)}
        disabled={selected === null}
      >
        Finalizar Avaliação
      </button>

      {submitted && (
        <div className="result">
          {selected === correctAnswer
            ? "Parabéns! Você acertou."
            : "Resposta incorreta. Revise as aulas e tente novamente."}
        </div>
      )}
    </div>
  );
}