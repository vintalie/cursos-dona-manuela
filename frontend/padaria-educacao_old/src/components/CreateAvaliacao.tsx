import CreatePergunta from "./CreatePergunta";
export default function CreateAvaliacao() {
  return (
    <div className="card">
      <h3>Criar Avaliação</h3>

      <select>
        <option>Associar à Matéria</option>
      </select>

      <label>
        <input type="checkbox" /> Valer Pontos?
      </label>

      <input placeholder="Nota máxima da avaliação" />

      <hr />

      <h4>Pergunta</h4>
      <textarea placeholder="Texto da pergunta" />

      <input placeholder="Nota da pergunta" />
      <CreatePergunta/>
      <button>Adicionar Pergunta</button>

      <button style={{ marginTop: "10px" }}>
        Criar Avaliação
      </button>
    </div>
  );
}