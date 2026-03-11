export default function CreateCourse() {
  return (
    <div className="card">
      <h4>Criar Curso</h4>
      <input placeholder="Título do Curso" />
      <textarea placeholder="Descrição" />
      <select>
        <option>Dificuldade</option>
        <option>Iniciante</option>
        <option>Intermediário</option>
        <option>Avançado</option>
      </select>
      <input placeholder="Categoria de Funcionários Alvo" />
      <button>Criar Curso</button>
    </div>
  );
}
