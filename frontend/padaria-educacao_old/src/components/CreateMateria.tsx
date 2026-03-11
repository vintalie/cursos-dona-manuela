import { useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

export default function CreateMateria() {
  const [content, setContent] = useState("");

  return (
    <div className="card">
      <h3>Criar Matéria</h3>

      <input placeholder="Título da Matéria" />
      <textarea placeholder="Descrição" />

      <input placeholder="Tópico (posição no curso)" />

      <select>
        <option>Associar ao Curso</option>
      </select>

      <label>Conteúdo da Matéria</label>

      <ReactQuill
        theme="snow"
        value={content}
        onChange={setContent}
        className="editor"
      />

      <button>Criar Matéria</button>
    </div>
  );
}