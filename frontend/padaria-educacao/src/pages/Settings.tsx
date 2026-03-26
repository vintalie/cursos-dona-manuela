import { useEffect, useState, useRef } from "react";
import { setDocumentTitle } from "@/config/appConfig";
import { useAuth } from "@/contexts/AuthContext";
import { updateProfile, uploadAvatar } from "@/services/auth.service";
import PageLoader from "@/components/ui/PageLoader";
import { showAlert } from "@/contexts/AlertPopupContext";
import { resolveMediaUrl } from "@/services/media.service";

const ACCEPTED_IMAGE_TYPES = "image/jpeg,image/png,image/gif,image/webp";

export default function Settings() {
  const { user, setUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
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
    try {
      const updated = await updateProfile(form);
      setUser(updated);
      showAlert({ type: "success", message: "Perfil atualizado com sucesso!" });
    } catch {
      showAlert({ type: "error", message: "Erro ao atualizar perfil. Tente novamente." });
    } finally {
      setLoading(false);
    }
  }

  async function handleAvatarSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      showAlert({ type: "error", message: "Apenas imagens são permitidas (JPEG, PNG, GIF, WebP)." });
      return;
    }
    setAvatarUploading(true);
    try {
      const updated = await uploadAvatar(file);
      setUser(updated);
      setForm((f) => ({ ...f, avatar: updated.avatar ?? "" }));
      showAlert({ type: "success", message: "Foto de perfil atualizada!" });
    } catch {
      showAlert({ type: "error", message: "Erro ao enviar foto. Tente novamente." });
    } finally {
      setAvatarUploading(false);
      e.target.value = "";
    }
  }

  if (!user) return null;

  return (
    <PageLoader loading={false}>
      <div className="settings-page">
        <h2 className="page-title mb-6 text-xl font-bold text-foreground">Configurações da Conta</h2>

        <form onSubmit={handleSubmit} className="settings-form max-w-xl space-y-4">
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
            <label className="block text-sm font-medium mb-1">Foto de perfil</label>
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full overflow-hidden bg-muted flex items-center justify-center border-2 border-border">
                {form.avatar ? (
                  <img
                    src={resolveMediaUrl(form.avatar)}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-2xl text-muted-foreground">?</span>
                )}
              </div>
              <div className="flex-1">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={ACCEPTED_IMAGE_TYPES}
                  onChange={handleAvatarSelect}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={avatarUploading}
                  className="px-4 py-2 rounded-lg border border-input bg-muted/30 hover:bg-muted/50 transition-colors text-sm disabled:opacity-60"
                >
                  {avatarUploading ? "Enviando..." : "Enviar imagem"}
                </button>
                <p className="text-xs text-muted-foreground mt-1">
                  JPEG, PNG, GIF ou WebP. Máx. 5MB.
                </p>
              </div>
            </div>
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
