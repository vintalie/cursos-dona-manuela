import { useEffect, useState } from "react";
import { setDocumentTitle } from "@/config/appConfig";
import { useAuth } from "@/contexts/AuthContext";
import { updateProfile } from "@/services/auth.service";
import { useSocketStatus } from "@/hooks/useSocketStatus";
import { debugPushStatus } from "@/services/push.debug";
import PageLoader from "@/components/ui/PageLoader";

const SOCKET_LABELS: Record<string, string> = {
  connected: "Conectado (notificações em tempo real)",
  connecting: "Conectando...",
  disconnected: "Desconectado",
  unavailable: "Indisponível",
  not_configured: "Não configurado (VITE_PUSHER_APP_KEY ausente no .env)",
  unknown: "Desconhecido",
};

export default function Settings() {
  const { user, setUser } = useAuth();
  const socketStatus = useSocketStatus(user?.id);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [form, setForm] = useState({
    name: "",
    full_name: "",
    avatar: "",
    gender: "",
    address: "",
    whatsapp: "",
    phone: "",
  });

  useEffect(() => {
    setDocumentTitle("Configurações");
    if (user) {
      setForm({
        name: user.name ?? "",
        full_name: user.full_name ?? "",
        avatar: user.avatar ?? "",
        gender: user.gender ?? "",
        address: user.address ?? "",
        whatsapp: user.whatsapp ?? "",
        phone: user.phone ?? "",
      });
    }
  }, [user]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const updated = await updateProfile(form);
      setUser(updated);
      setMessage({ type: "success", text: "Perfil atualizado com sucesso!" });
    } catch {
      setMessage({ type: "error", text: "Erro ao atualizar perfil. Tente novamente." });
    } finally {
      setLoading(false);
    }
  }

  if (!user) return null;

  return (
    <PageLoader loading={false}>
      <div className="settings-page">
        <h2 className="page-title mb-6 text-xl font-bold text-foreground">Configurações da Conta</h2>

        <div className="mb-6 p-4 rounded-lg bg-muted/50 border border-border">
          <h3 className="text-sm font-medium mb-2">Status do socket (notificações em tempo real)</h3>
          <p className={`text-sm ${socketStatus === "connected" ? "text-green-600" : socketStatus === "not_configured" ? "text-amber-600" : "text-muted-foreground"}`}>
            {SOCKET_LABELS[socketStatus] ?? socketStatus}
          </p>
          {socketStatus === "not_configured" && (
            <p className="text-xs text-muted-foreground mt-2">
              Crie <code className="bg-muted px-1 rounded">frontend/padaria-educacao/.env</code> com VITE_PUSHER_APP_KEY, VITE_PUSHER_APP_CLUSTER e VITE_API_BASE (base do backend, ex: http://localhost:8000).
            </p>
          )}
        </div>

        <div className="mb-6 p-4 rounded-lg bg-muted/50 border border-border">
          <h3 className="text-sm font-medium mb-2">Web Push (notificações fora da plataforma)</h3>
          <p className="text-sm text-muted-foreground mb-2">
            Diagnóstico completo no console. Abra as ferramentas do desenvolvedor (F12) e clique no botão abaixo.
          </p>
          <button
            type="button"
            onClick={() => debugPushStatus()}
            className="text-sm px-3 py-1.5 rounded bg-primary/10 text-primary hover:bg-primary/20"
          >
            Executar diagnóstico Web Push
          </button>
          <p className="text-xs text-muted-foreground mt-2">
            Ou no console: <code className="bg-muted px-1 rounded">debugPushStatus()</code>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="settings-form max-w-xl space-y-4">
          {message && (
            <div className={`p-3 rounded-lg text-sm ${message.type === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
              {message.text}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1">Nome de exibição</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="w-full p-3 border border-input rounded-lg bg-background text-foreground"
              placeholder="Nome"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Nome completo</label>
            <input
              type="text"
              value={form.full_name}
              onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))}
              className="w-full p-3 border border-input rounded-lg bg-background text-foreground"
              placeholder="Nome completo"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">URL da imagem de perfil</label>
            <input
              type="url"
              value={form.avatar}
              onChange={(e) => setForm((f) => ({ ...f, avatar: e.target.value }))}
              className="w-full p-3 border border-input rounded-lg bg-background text-foreground"
              placeholder="https://..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Gênero</label>
            <select
              value={form.gender}
              onChange={(e) => setForm((f) => ({ ...f, gender: e.target.value }))}
              className="w-full p-3 border border-input rounded-lg bg-background text-foreground"
            >
              <option value="">Selecione</option>
              <option value="masculino">Masculino</option>
              <option value="feminino">Feminino</option>
              <option value="outro">Outro</option>
              <option value="prefiro_nao_informar">Prefiro não informar</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Endereço</label>
            <textarea
              value={form.address}
              onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
              className="w-full p-3 border border-input rounded-lg bg-background text-foreground"
              rows={2}
              placeholder="Endereço completo"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">WhatsApp</label>
            <input
              type="text"
              value={form.whatsapp}
              onChange={(e) => setForm((f) => ({ ...f, whatsapp: e.target.value }))}
              className="w-full p-3 border border-input rounded-lg bg-background text-foreground"
              placeholder="(00) 00000-0000"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Telefone</label>
            <input
              type="text"
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              className="w-full p-3 border border-input rounded-lg bg-background text-foreground"
              placeholder="(00) 0000-0000"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
          >
            {loading ? "Salvando..." : "Salvar alterações"}
          </button>
        </form>
      </div>
    </PageLoader>
  );
}
