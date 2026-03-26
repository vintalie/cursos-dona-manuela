import { useState } from "react";
import { createQuestion } from "@/services/question.service";
import { showAlert } from "@/contexts/AlertPopupContext";
import { createOption } from "@/services/option.service";

interface CreatePerguntaProps {
  assessmentId: number;
  onQuestionAdded?: () => void;
}

export default function CreatePergunta({ assessmentId, onQuestionAdded }: CreatePerguntaProps) {
  const [pergunta, setPergunta] = useState("");
  const [multiplaEscolha, setMultiplaEscolha] = useState(false);
  const [alternativas, setAlternativas] = useState([
    { letra: "A", texto: "", correta: false },
    { letra: "B", texto: "", correta: false },
    { letra: "C", texto: "", correta: false },
    { letra: "D", texto: "", correta: false },
  ]);
  const [loading, setLoading] = useState(false);

  const handleAlternativaChange = (index: number, value: string) => {
    const novas = [...alternativas];
    novas[index].texto = value;
    setAlternativas(novas);
  };

  const marcarCorreta = (index: number) => {
    if (multiplaEscolha) {
      const novas = [...alternativas];
      novas[index].correta = !novas[index].correta;
      setAlternativas(novas);
    } else {
      setAlternativas(alternativas.map((alt, i) => ({ ...alt, correta: i === index })));
    }
  };

  const salvarPergunta = async () => {
    if (!pergunta.trim()) {
      alert("Digite a pergunta");
      return;
    }
    const comTexto = alternativas.filter((a) => a.texto.trim());
    if (comTexto.length < 2) {
      alert("Adicione pelo menos 2 alternativas");
      return;
    }
    const temCorreta = alternativas.some((a) => a.correta);
    if (!temCorreta) {
      alert("Marque a alternativa correta");
      return;
    }
    setLoading(true);
    try {
      const q = await createQuestion({
        assessment_id: assessmentId,
        text: pergunta.trim(),
        is_multiple_choice: multiplaEscolha,
      });
      for (const alt of alternativas) {
        if (alt.texto.trim()) {
          await createOption({
            question_id: q.id,
            label: alt.letra,
            text: alt.texto.trim(),
            is_correct: alt.correta,
          });
        }
      }
      setPergunta("");
      setMultiplaEscolha(false);
      setAlternativas([
        { letra: "A", texto: "", correta: false },
        { letra: "B", texto: "", correta: false },
        { letra: "C", texto: "", correta: false },
        { letra: "D", texto: "", correta: false },
      ]);
      showAlert({ type: "success", message: "Pergunta salva!" });
      onQuestionAdded?.();
    } catch {
      showAlert({ type: "error", message: "Erro ao salvar pergunta" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="avaliacao-card">
      <h4 className="mb-3 font-semibold">Criar Pergunta</h4>
      <textarea
        placeholder="Digite a pergunta..."
        value={pergunta}
        onChange={(e) => setPergunta(e.target.value)}
        className="pergunta-input"
      />
      <div className="multipla-container">
        <label>
          <input type="checkbox" checked={multiplaEscolha} onChange={() => setMultiplaEscolha(!multiplaEscolha)} />
          {" "}Permitir múltiplas escolhas
        </label>
      </div>
      <div className="alternativas-grid">
        {alternativas.map((alt, index) => (
          <div key={alt.letra} className="alternativa-item">
            <span className="letra">{alt.letra}</span>
            <input
              type="text"
              placeholder={`Alternativa ${alt.letra}`}
              value={alt.texto}
              onChange={(e) => handleAlternativaChange(index, e.target.value)}
              className="alternativa-input"
            />
            <input
              type={multiplaEscolha ? "checkbox" : "radio"}
              name="correta"
              checked={alt.correta}
              onChange={() => marcarCorreta(index)}
              className="correta-check"
            />
          </div>
        ))}
      </div>
      <button className="salvar-btn" onClick={salvarPergunta} disabled={loading}>
        {loading ? "Salvando..." : "Salvar Pergunta"}
      </button>
    </div>
  );
}
