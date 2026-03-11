import { useEffect, useState } from "react";
import { setDocumentTitle } from "@/config/appConfig";

interface Curso {
  id: number;
  titulo: string;
  destaque: boolean;
}

export default function CoursesManager() {
  const [cursos, setCursos] = useState<Curso[]>([
    { id: 1, titulo: "Atendimento ao Cliente", destaque: true },
    { id: 2, titulo: "Boas Práticas na Empresa", destaque: false },
  ]);

  useEffect(() => {
    setDocumentTitle("Gerenciamento de Cursos");
  }, []);

  function toggleDestaque(id: number) {
    setCursos(cursos.map((c) => c.id === id ? { ...c, destaque: !c.destaque } : c));
  }

  function removerCurso(id: number) {
    setCursos(cursos.filter((c) => c.id !== id));
  }

  return (
    <div>
      <h2 className="mb-5 text-xl font-bold text-foreground">Gerenciamento de Cursos</h2>
      <div className="card">
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Título</th>
                <th>Destaque</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {cursos.map((curso) => (
                <tr key={curso.id}>
                  <td>{curso.titulo}</td>
                  <td>{curso.destaque ? "⭐ Em Destaque" : "—"}</td>
                  <td>
                    <button onClick={() => toggleDestaque(curso.id)}>Destacar</button>
                    <button>Editar</button>
                    <button className="btn-danger" onClick={() => removerCurso(curso.id)}>Remover</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
