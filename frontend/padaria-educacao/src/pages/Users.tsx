import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { User } from "@/types";
import { getUsers, createUser, deleteUser } from "@/services/user.service";
import { setDocumentTitle } from "@/config/appConfig";
import { useAuth } from "@/contexts/AuthContext";
import ConfirmDeleteDialog from "@/components/ui/ConfirmDeleteDialog";

export default function Users() {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [usuarios, setUsuarios] = useState<User[]>([]);
  const [deleteUserTarget, setDeleteUserTarget] = useState<User | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [novoNome, setNovoNome] = useState("");
  const [novoEmail, setNovoEmail] = useState("");
  const [novoTipo, setNovoTipo] = useState<"aluno" | "gerente">("aluno");
  const [novoPassword, setNovoPassword] = useState("");

  async function carregarUsuarios() {
    const data = await getUsers();
    setUsuarios(data);
  }

  useEffect(() => {
    setDocumentTitle("Gerenciamento de Usuários");
  }, []);

  useEffect(() => {
    carregarUsuarios();
  }, []);

  async function criarUsuario() {
    const novoUsuario = await createUser({
      name: novoNome,
      email: novoEmail,
      tipo: novoTipo,
      password: novoPassword || "123456",
    });

    setUsuarios((prev) => [novoUsuario, ...prev]);

    setNovoNome("");
    setNovoEmail("");
    setNovoPassword("");
  }

  async function handleConfirmDelete() {
    if (!deleteUserTarget) return;
    setDeleteLoading(true);
    try {
      await deleteUser(deleteUserTarget.id);
      await carregarUsuarios();
    } finally {
      setDeleteLoading(false);
      setDeleteUserTarget(null);
    }
  }

  return (
    <div>
      <h2 className="page-title mb-5 text-xl font-bold text-foreground">Gerenciamento de Usuários</h2>

      <div className="card">
        <h4>Criar Novo Usuário</h4>
        <input placeholder="Nome" value={novoNome} onChange={(e) => setNovoNome(e.target.value)} />
        <input placeholder="Email" value={novoEmail} onChange={(e) => setNovoEmail(e.target.value)} />
        <input
          placeholder="Senha"
          type="password"
          value={novoPassword}
          onChange={(e) => setNovoPassword(e.target.value)}
        />
        <select value={novoTipo} onChange={(e) => setNovoTipo(e.target.value as "aluno" | "gerente")}>
          <option value="aluno">Funcionário</option>
          <option value="gerente">Gerente</option>
        </select>
        <button onClick={criarUsuario}>Criar</button>
      </div>

      <div className="card">
        <h4>Lista de Usuários</h4>
        <table>
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
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>{u.tipo}</td>
                <td>
                  <div className="flex flex-wrap gap-2">
                    <button type="button" onClick={() => navigate(`/usuarios/${u.id}/editar`)}>
                      Editar
                    </button>
                    <button
                      className="btn-danger"
                      onClick={() => setDeleteUserTarget(u)}
                      disabled={currentUser?.id === u.id}
                      title={currentUser?.id === u.id ? "Você não pode excluir sua própria conta" : "Remover usuário"}
                    >
                      Remover
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ConfirmDeleteDialog
        open={!!deleteUserTarget}
        onOpenChange={(open) => !open && setDeleteUserTarget(null)}
        title="Excluir usuário"
        description={
          deleteUserTarget
            ? `Excluir o usuário "${deleteUserTarget.name}" (${deleteUserTarget.email})? Esta ação não pode ser desfeita.`
            : ""
        }
        onConfirm={handleConfirmDelete}
        loading={deleteLoading}
      />
    </div>
  );
}