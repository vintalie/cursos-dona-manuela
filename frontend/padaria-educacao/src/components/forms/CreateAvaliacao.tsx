import CreatePergunta from "./CreatePergunta";

export default function CreateAvaliacao() {
  return (
    <div className="card">
      <h4>Criar Avaliação</h4>
      <select>
        <option>Associar à Matéria</option>
      </select>
      <label className="flex items-center gap-2 mb-3 text-sm">
        <input type="checkbox" /> Valer Pontos?
      </label>
      <input placeholder="Nota máxima da avaliação" />
      <hr className="my-4 border-border" />
      <CreatePergunta />
    </div>
  );
}
