import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { setDocumentTitle } from "@/config/appConfig";
import { useAuth } from "@/contexts/AuthContext";
import {
  listMedia,
  getMediaCategories,
  createMediaCategory,
  updateMedia,
  uploadFile,
  deleteMedia,
  resolveMediaUrl,
} from "@/services/media.service";
import type { Media, MediaCategory, MediaType } from "@/types";
import PageLoader from "@/components/ui/PageLoader";
import { showAlert } from "@/contexts/AlertPopupContext";
import { Image, Video, Music, FileText, Upload, Loader2, Trash2 } from "lucide-react";

const TYPE_LABELS: Record<MediaType, string> = {
  image: "Imagem",
  video: "Vídeo",
  audio: "Áudio",
  document: "Documento",
};

const TYPE_ICONS: Record<MediaType, typeof Image> = {
  image: Image,
  video: Video,
  audio: Music,
  document: FileText,
};

export default function MediaManager() {
  const { isGerente } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isGerente) {
      navigate("/dashboard");
    }
  }, [isGerente, navigate]);

  const [media, setMedia] = useState<Media[]>([]);
  const [categories, setCategories] = useState<MediaCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<MediaType | "">("");
  const [sourceFilter, setSourceFilter] = useState<"gerente" | "aluno" | "">("");
  const [categoryFilter, setCategoryFilter] = useState<number | "">("");
  const [newCategoryName, setNewCategoryName] = useState("");
  const [creatingCategory, setCreatingCategory] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editingCategory, setEditingCategory] = useState<number | null>(null);

  function loadMedia() {
    setLoading(true);
    listMedia({
      type: typeFilter || undefined,
      source: sourceFilter || undefined,
      category_id: categoryFilter || undefined,
      per_page: 50,
    })
      .then((res) => setMedia(res.data))
      .catch(() => setMedia([]))
      .finally(() => setLoading(false));
  }

  function loadCategories() {
    getMediaCategories()
      .then(setCategories)
      .catch(() => setCategories([]));
  }

  useEffect(() => {
    setDocumentTitle("Mídias");
  }, []);

  useEffect(() => {
    if (!isGerente) return;
    loadMedia();
    loadCategories();
  }, [isGerente]);

  useEffect(() => {
    if (!isGerente) return;
    loadMedia();
  }, [isGerente, typeFilter, sourceFilter, categoryFilter]);

  async function handleCreateCategory() {
    if (!newCategoryName.trim()) return;
    setCreatingCategory(true);
    try {
      await createMediaCategory(newCategoryName.trim());
      setNewCategoryName("");
      loadCategories();
      showAlert({ type: "success", message: "Categoria criada!" });
    } catch {
      showAlert({ type: "error", message: "Erro ao criar categoria" });
    } finally {
      setCreatingCategory(false);
    }
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const m = await uploadFile(file, categoryFilter || undefined);
      setMedia((prev) => [m, ...prev]);
      showAlert({ type: "success", message: "Arquivo enviado!" });
    } catch {
      showAlert({ type: "error", message: "Erro ao enviar arquivo" });
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function handleUpdateCategory(mediaId: number, categoryId: number | null) {
    setEditingCategory(mediaId);
    try {
      const updated = await updateMedia(mediaId, { media_category_id: categoryId });
      setMedia((prev) =>
        prev.map((m) => (m.id === mediaId ? updated : m))
      );
      showAlert({ type: "success", message: "Categoria atualizada!" });
    } catch {
      showAlert({ type: "error", message: "Erro ao atualizar" });
    } finally {
      setEditingCategory(null);
    }
  }

  async function handleDelete(m: Media) {
    if (!confirm(`Excluir "${m.original_name}"?`)) return;
    try {
      await deleteMedia(m.id);
      setMedia((prev) => prev.filter((x) => x.id !== m.id));
      showAlert({ type: "success", message: "Mídia excluída!" });
    } catch {
      showAlert({ type: "error", message: "Erro ao excluir" });
    }
  }

  if (!isGerente) return null;

  return (
    <PageLoader loading={false}>
      <div>
        <h2 className="page-title mb-5 text-xl font-bold text-foreground">Mídias</h2>

        <div className="flex flex-wrap gap-3 mb-6">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as MediaType | "")}
            className="text-sm border rounded-lg px-3 py-2 bg-background"
          >
            <option value="">Todos os tipos</option>
            {Object.entries(TYPE_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
          <select
            value={sourceFilter}
            onChange={(e) =>
              setSourceFilter((e.target.value || "") as "gerente" | "aluno" | "")
            }
            className="text-sm border rounded-lg px-3 py-2 bg-background"
          >
            <option value="">Todos</option>
            <option value="gerente">Gerente</option>
            <option value="aluno">Aluno</option>
          </select>
          <select
            value={categoryFilter}
            onChange={(e) =>
              setCategoryFilter(e.target.value === "" ? "" : Number(e.target.value))
            }
            className="text-sm border rounded-lg px-3 py-2 bg-background"
          >
            <option value="">Todas categorias</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <div className="flex gap-2">
            <input
              type="text"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="Nova categoria"
              className="text-sm border rounded-lg px-3 py-2 w-40 bg-background"
            />
            <button
              type="button"
              onClick={handleCreateCategory}
              disabled={creatingCategory || !newCategoryName.trim()}
              className="px-3 py-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 disabled:opacity-50 text-sm"
            >
              {creatingCategory ? "..." : "Criar"}
            </button>
          </div>
          <label className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer text-sm font-medium flex items-center gap-2">
            <Upload size={16} />
            {uploading ? "Enviando..." : "Enviar arquivo"}
            <input
              type="file"
              className="hidden"
              onChange={handleUpload}
              disabled={uploading}
            />
          </label>
        </div>

        {loading && (
          <div className="flex justify-center py-12">
            <Loader2 size={32} className="animate-spin text-muted-foreground" />
          </div>
        )}

        {!loading && media.length === 0 && (
          <div className="text-center py-12 text-muted-foreground bg-muted/30 rounded-xl">
            <p className="text-sm">Nenhuma mídia encontrada.</p>
            <p className="text-xs mt-1">Envie arquivos usando o botão acima.</p>
          </div>
        )}

        {!loading && media.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
            {media.map((m) => (
              <MediaCard
                key={m.id}
                media={m}
                categories={categories}
                onUpdateCategory={(catId) => handleUpdateCategory(m.id, catId)}
                onDelete={() => handleDelete(m)}
                isUpdating={editingCategory === m.id}
              />
            ))}
          </div>
        )}
      </div>
    </PageLoader>
  );
}

function MediaCard({
  media,
  categories,
  onUpdateCategory,
  onDelete,
  isUpdating,
}: {
  media: Media;
  categories: MediaCategory[];
  onUpdateCategory: (categoryId: number | null) => void;
  onDelete: () => void;
  isUpdating: boolean;
}) {
  const url = resolveMediaUrl(media.url);
  const Icon = TYPE_ICONS[media.type];

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden hover:border-primary/30 transition-colors">
      <div className="aspect-square bg-muted flex items-center justify-center relative group">
        {media.type === "image" ? (
          <img
            src={url}
            alt={media.original_name}
            className="w-full h-full object-cover"
          />
        ) : (
          <Icon size={40} className="text-muted-foreground" />
        )}
        <button
          type="button"
          onClick={onDelete}
          className="absolute top-2 right-2 p-1.5 rounded-full bg-destructive/80 text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity"
          title="Excluir"
        >
          <Trash2 size={14} />
        </button>
      </div>
      <div className="p-3">
        <p className="text-xs truncate text-muted-foreground" title={media.original_name}>
          {media.original_name}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {media.user?.name ?? "—"} · {TYPE_LABELS[media.type]}
        </p>
        <select
          value={media.media_category_id ?? ""}
          onChange={(e) =>
            onUpdateCategory(e.target.value === "" ? null : Number(e.target.value))
          }
          disabled={isUpdating}
          className="mt-2 w-full text-xs border rounded px-2 py-1.5 bg-background"
        >
          <option value="">Sem categoria</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
