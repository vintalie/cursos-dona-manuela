import { useNavigate } from "react-router-dom";

const usuarios = [
  { id: 1, nome: "João Silva", media: 95 },
  { id: 2, nome: "Maria Souza", media: 88 },
  { id: 3, nome: "Carlos Mendes", media: 45 },
];

export default function Performance() {
  const navigate = useNavigate();
  const userType = localStorage.getItem("userType");

  return (
    <div>
      <h2>Painel de Desempenho</h2>

      <div className="card">
        <h4>Usuários</h4>

        <table width="100%">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Média Geral</th>
              {userType === "gerente" && <th>Ações</th>}
            </tr>
          </thead>
          <tbody>
            {usuarios.map((u) => (
              <tr
                key={u.id}
                style={{ cursor: "pointer" }}
                onClick={() => navigate(`/desempenhos/${u.id}`)}
              >
                <td>{u.nome}</td>
                <td>{u.media}%</td>
                {userType === "gerente" && <td>Ver detalhes</td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}