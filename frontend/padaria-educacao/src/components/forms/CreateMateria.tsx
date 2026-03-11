import { useState } from "react";

export default function CreateMateria() {
  const [content, setContent] = useState("");

  return (
    <div className="card">
      <h4>Criar Matéria</h4>
      <input placeholder="Título da Matéria" />
      <textarea placeholder="Descrição" />
      <input placeholder="Tópico (posição no curso)" />
      <select>
        <option>Associar ao Curso</option>
      </select>
      <label className="block text-sm font-medium mb-2 mt-2">Conteúdo da Matéria</label>
      <textarea
        placeholder="Digite o conteúdo aqui..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="min-h-[150px]"
      />
      <button>Criar Matéria</button>
    </div>
  );
}
