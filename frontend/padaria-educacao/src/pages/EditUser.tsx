import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { setDocumentTitle } from "@/config/appConfig";
import { getUser, updateUser } from "@/services/user.service";
import PageLoader from "@/components/ui/PageLoader";
import { showAlert } from "@/contexts/AlertPopupContext";
import { ArrowLeft } from "lucide-react";

export default function EditUser() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    tipo: "aluno" as "aluno" | "gerente",
    password: "",
  });

  useEffect(() => {
    setDocumentTitle("Editar Usuário");
  }, []);

  useEffect(() => {
    if (!id) return;
    const numId = parseInt(id, 10);
    if (Number.isNaN(numId)) {
      setLoading(false);
      return;
    }
    getUser(numId)
      .then((user) => {
        setForm({
          name: user.name ?? "",
          email: user.email ?? "",
          tipo: (user.tipo as "aluno" | "gerente") ?? "aluno",
          password: "",
        });
      })
      .catch(() => {
        showAlert({ type: "error", message: "Usuário não encontrado." });
        navigate("/usuarios");
      })
      .finally(() => setLoading(false));
  }, [id, navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!id) return;
    const numId = parseInt(id, 10);
    if (Number.isNaN(numId)) return;

    setSaving(true);
    try {
      const payload: { name: string; email: string; tipo: string; password?: string } = {
        name: form.name.trim(),
        email: form.email.trim(),
        tipo: form.tipo,
      };
      if (form.password.trim()) {
        payload.password = form.password.trim();
      }
      await updateUser(numId, payload);
      showAlert({ type: "success", message: "Usuário atualizado com sucesso!" });
      navigate("/usuarios");
    } catch {
      showAlert({ type: "error", message: "Erro ao atualizar usuário. Tente novamente." });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <PageLoader loading />;
  }

  return (
    <div className="max-w-xl">
      <button
        type="button"
        onClick={() => navigate("/usuarios")}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft size={18} />
        Voltar para usuários
      </button>

      <h2 className="page-title mb-6 text-xl font-bold text-foreground">Editar Usuário</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Nome</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            className="w-full p-3 border border-input rounded-lg bg-background text-foreground"
            placeholder="Nome"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            className="w-full p-3 border border-input rounded-lg bg-background text-foreground"
            placeholder="email@exemplo.com"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Tipo</label>
          <select
            value={form.tipo}
            onChange={(e) => setForm((f) => ({ ...f, tipo: e.target.value as "aluno" | "gerente" }))}
            className="w-full p-3 border border-input rounded-lg bg-background text-foreground"
          >
            <option value="aluno">Funcionário</option>
            <option value="gerente">Gerente</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Nova senha (opcional)</label>
          <input
            type="password"
            value={form.password}
            onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
            className="w-full p-3 border border-input rounded-lg bg-background text-foreground"
            placeholder="Deixe em branco para manter a atual"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? "Salvando..." : "Salvar alterações"}
          </button>
          <button
            type="button"
            onClick={() => navigate("/usuarios")}
            className="px-4 py-2 rounded-lg border border-input bg-background text-foreground hover:bg-muted"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
