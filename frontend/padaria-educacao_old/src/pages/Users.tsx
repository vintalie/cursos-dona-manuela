import { useState } from "react";

interface Usuario {
  id: number;
  nome: string;
  email: string;
  tipo: string;
}

export default function Users() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([
    { id: 1, nome: "João Silva", email: "joao@email.com", tipo: "funcionario" },
    { id: 2, nome: "Maria Souza", email: "maria@email.com", tipo: "gerente" },
  ]);

  const [novoNome, setNovoNome] = useState("");
  const [novoEmail, setNovoEmail] = useState("");
  const [novoTipo, setNovoTipo] = useState("funcionario");

  function criarUsuario() {
    const novo: Usuario = {
      id: Date.now(),
      nome: novoNome,
      email: novoEmail,
      tipo: novoTipo,
    };

    setUsuarios([...usuarios, novo]);
    setNovoNome("");
    setNovoEmail("");
  }

  function removerUsuario(id: number) {
    setUsuarios(usuarios.filter((u) => u.id !== id));
  }

  return (
    <div>
      <h2>Gerenciamento de Usuários</h2>

      <div className="card">
        <h4>Criar Novo Usuário</h4>
        <input
          placeholder="Nome"
          value={novoNome}
          onChange={(e) => setNovoNome(e.target.value)}
        />
        <input
          placeholder="Email"
          value={novoEmail}
          onChange={(e) => setNovoEmail(e.target.value)}
        />
        <select
          value={novoTipo}
          onChange={(e) => setNovoTipo(e.target.value)}
        >
          <option value="funcionario">Funcionário</option>
          <option value="gerente">Gerente</option>
        </select>
        <button onClick={criarUsuario}>Criar</button>
      </div>

      <div className="card">
        <h4>Lista de Usuários</h4>
        <table width="100%">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Email</th>
              <th>Tipo</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((u) => (
              <tr key={u.id}>
                <td>{u.nome}</td>
                <td>{u.email}</td>
                <td>{u.tipo}</td>
                <td>
                  <button>Editar</button>
                  <button onClick={() => removerUsuario(u.id)}>
                    Remover
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}