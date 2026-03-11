import { useState } from "react";

export default function CreatePergunta() {
  const [pergunta, setPergunta] = useState("");
  const [multiplaEscolha, setMultiplaEscolha] = useState(false);

  const [alternativas, setAlternativas] = useState([
    { letra: "A", texto: "", correta: false },
    { letra: "B", texto: "", correta: false },
    { letra: "C", texto: "", correta: false },
    { letra: "D", texto: "", correta: false }
  ]);

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
      const novas = alternativas.map((alt, i) => ({
        ...alt,
        correta: i === index
      }));
      setAlternativas(novas);
    }
  };

  const salvarPergunta = () => {
    const perguntaCompleta = {
      pergunta,
      multiplaEscolha,
      alternativas
    };

    console.log(perguntaCompleta);
    alert("Pergunta criada com sucesso!");

    setPergunta("");
    setMultiplaEscolha(false);
    setAlternativas([
      { letra: "A", texto: "", correta: false },
      { letra: "B", texto: "", correta: false },
      { letra: "C", texto: "", correta: false },
      { letra: "D", texto: "", correta: false }
    ]);
  };

  return (
    <div className="avaliacao-card">
      <h3>Criar Pergunta</h3>

      <textarea
        placeholder="Digite a pergunta..."
        value={pergunta}
        onChange={(e) => setPergunta(e.target.value)}
        className="pergunta-input"
      />

      <div className="multipla-container">
        <label>
          <input
            type="checkbox"
            checked={multiplaEscolha}
            onChange={() => setMultiplaEscolha(!multiplaEscolha)}
          />
          Permitir múltiplas escolhas
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
              onChange={(e) =>
                handleAlternativaChange(index, e.target.value)
              }
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

      <button className="salvar-btn" onClick={salvarPergunta}>
        Salvar Pergunta
      </button>
    </div>
  );
}