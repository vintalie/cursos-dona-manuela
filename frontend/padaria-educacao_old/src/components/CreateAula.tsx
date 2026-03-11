import { useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

export default function CreateAula() {
  const [content, setContent] = useState("");

  return (
    <div className="card">
      <h3>Criar Aula</h3>

      <input placeholder="Título da Aula" />
      <textarea placeholder="Descrição" />

      <input placeholder="Tópico (posição na matéria)" />

      <select>
        <option>Associar à Matéria</option>
      </select>

      <label>Conteúdo da Aula</label>

      <ReactQuill
        theme="snow"
        value={content}
        onChange={setContent}
        className="editor"
      />

      <button>Criar Aula</button>
    </div>
  );
}