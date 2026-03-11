import { useState } from "react";

export default function CreateAula() {
  const [content, setContent] = useState("");

  return (
    <div className="card">
      <h4>Criar Aula</h4>
      <input placeholder="Título da Aula" />
      <textarea placeholder="Descrição" />
      <input placeholder="Tópico (posição na matéria)" />
      <select>
        <option>Associar à Matéria</option>
      </select>
      <label className="block text-sm font-medium mb-2 mt-2">Conteúdo da Aula</label>
      <textarea
        placeholder="Digite o conteúdo aqui..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="min-h-[150px]"
      />
      <button>Criar Aula</button>
    </div>
  );
}
