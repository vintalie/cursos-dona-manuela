import { useEffect, useState } from "react";
import { setDocumentTitle } from "@/config/appConfig";
import { broadcastNotification } from "@/services/notification.service";
import { getUsers } from "@/services/user.service";
import type { User } from "@/types";
import { showAlert } from "@/contexts/AlertPopupContext";

export default function NotificationsManager() {
  const [users, setUsers] = useState<User[]>([]);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);
  const [sendToAll, setSendToAll] = useState(false);
  const [loading, setLoading] = useState(false);
  const [messageFeedback, setMessageFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    setDocumentTitle("Enviar Notificação");
    getUsers().then(setUsers).catch(() => setUsers([]));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;
    setLoading(true);
    try {
      const { count } = await broadcastNotification({
        title: title.trim(),
        message: message.trim(),
        user_ids: sendToAll ? undefined : selectedUserIds,
        send_to_all: sendToAll,
      });
      showAlert({ type: "success", message: `Notificação enviada para ${count} usuário(s)!` });
      setTitle("");
      setMessage("");
      setSelectedUserIds([]);
    } catch {
      showAlert({ type: "error", message: "Erro ao enviar notificação." });
    } finally {
      setLoading(false);
    }
  }

  function toggleUser(id: number) {
    setSelectedUserIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  const alunoUsers = users.filter((u) => u.tipo === "aluno");

  return (
    <div>
      <h2 className="page-title mb-5 text-xl font-bold text-foreground">Enviar Notificação</h2>

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Título *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-3 border border-input rounded-lg bg-background text-foreground"
            placeholder="Ex: Novo conteúdo disponível"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Mensagem *</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full p-3 border border-input rounded-lg bg-background text-foreground"
            rows={4}
            placeholder="Digite a mensagem da notificação..."
            required
          />
        </div>

        <div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={sendToAll}
              onChange={(e) => {
                setSendToAll(e.target.checked);
                if (e.target.checked) setSelectedUserIds([]);
              }}
            />
            <span>Enviar para todos os alunos</span>
          </label>
        </div>

        {!sendToAll && (
          <div>
            <label className="block text-sm font-medium mb-2">Selecionar destinatários</label>
            <div className="border border-input rounded-lg p-3 max-h-48 overflow-y-auto space-y-2">
              {alunoUsers.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhum aluno cadastrado.</p>
              ) : (
                alunoUsers.map((u) => (
                  <label key={u.id} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedUserIds.includes(u.id)}
                      onChange={() => toggleUser(u.id)}
                    />
                    <span className="text-sm">{u.name}</span>
                    <span className="text-xs text-muted-foreground">({u.email})</span>
                  </label>
                ))
              )}
            </div>
          </div>
        )}

        <button type="submit" disabled={loading || (!sendToAll && selectedUserIds.length === 0)} className="btn-primary">
          {loading ? "Enviando..." : "Enviar Notificação"}
        </button>
      </form>
    </div>
  );
}
