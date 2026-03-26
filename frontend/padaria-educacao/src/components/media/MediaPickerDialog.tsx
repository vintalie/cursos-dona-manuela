import { useEffect, useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  listMedia,
  getMediaCategories,
  createMediaCategory,
  uploadFile,
  resolveMediaUrl,
} from "@/services/media.service";
import type { Media, MediaType } from "@/types";
import { Image, Video, Music, FileText, Loader2, FolderPlus, Upload } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { showAlert } from "@/contexts/AlertPopupContext";

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

interface MediaPickerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (media: Media) => void;
  type?: MediaType;
}

export default function MediaPickerDialog({
  open,
  onOpenChange,
  onSelect,
  type = "image",
}: MediaPickerDialogProps) {
  const { isGerente } = useAuth();
  const [media, setMedia] = useState<Media[]>([]);
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [typeFilter, setTypeFilter] = useState<MediaType>(type);
  const [sourceFilter, setSourceFilter] = useState<"gerente" | "aluno" | "">(
    isGerente ? "" : "aluno"
  );
  const [categoryFilter, setCategoryFilter] = useState<number | "">("");
  const [newCategoryName, setNewCategoryName] = useState("");
  const [creatingCategory, setCreatingCategory] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  function loadMedia() {
    setLoading(true);
    listMedia({
      type: typeFilter,
      source: sourceFilter || undefined,
      category_id: categoryFilter || undefined,
      per_page: 24,
    })
      .then((res) => setMedia(res.data))
      .catch(() => setMedia([]))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    if (!open) return;
    setTypeFilter(type);
    loadMedia();
  }, [open, type]);

  useEffect(() => {
    if (!open) return;
    loadMedia();
  }, [typeFilter, sourceFilter, categoryFilter]);

  useEffect(() => {
    if (!open) return;
    getMediaCategories()
      .then(setCategories)
      .catch(() => setCategories([]));
  }, [open]);

  async function handleCreateCategory() {
    if (!newCategoryName.trim()) return;
    setCreatingCategory(true);
    try {
      const cat = await createMediaCategory(newCategoryName.trim());
      setCategories((prev) => [...prev, cat]);
      setNewCategoryName("");
      setCategoryFilter(cat.id);
      showAlert({ type: "success", message: "Categoria criada!" });
    } catch {
      showAlert({ type: "error", message: "Erro ao criar categoria" });
    } finally {
      setCreatingCategory(false);
    }
  }

  function handleSelect(m: Media) {
    onSelect(m);
    onOpenChange(false);
  }

  const acceptedTypes = isGerente
    ? typeFilter === "image"
      ? "image/*"
      : typeFilter === "video"
        ? "video/*"
        : typeFilter === "audio"
          ? "audio/*"
          : ".pdf,.doc,.docx,.txt,.csv"
    : "image/*";

  async function handleFiles(files: FileList | null) {
    if (!files?.length) return;
    const file = files[0];
    if (isGerente && typeFilter !== "image" && typeFilter !== "video" && typeFilter !== "audio" && typeFilter !== "document") return;
    if (!isGerente && !file.type.startsWith("image/")) {
      showAlert({ type: "error", message: "Alunos podem enviar apenas imagens." });
      return;
    }
    setUploading(true);
    try {
      const m = await uploadFile(file, categoryFilter || undefined);
      setMedia((prev) => [m, ...prev]);
      showAlert({ type: "success", message: "Arquivo enviado!" });
    } catch {
      showAlert({ type: "error", message: "Erro ao enviar arquivo." });
    } finally {
      setUploading(false);
    }
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="media-picker-dialog max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Selecionar mídia</DialogTitle>
        </DialogHeader>

        <div className="flex flex-wrap gap-2 mb-4">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as MediaType)}
            className="text-sm border rounded-lg px-3 py-1.5 bg-background"
          >
            {Object.entries(TYPE_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
          {isGerente && (
            <select
              value={sourceFilter}
              onChange={(e) =>
                setSourceFilter((e.target.value || "") as "gerente" | "aluno" | "")
              }
              className="text-sm border rounded-lg px-3 py-1.5 bg-background"
            >
              <option value="">Todos</option>
              <option value="gerente">Gerente</option>
              <option value="aluno">Aluno</option>
            </select>
          )}
          <select
            value={categoryFilter}
            onChange={(e) =>
              setCategoryFilter(e.target.value === "" ? "" : Number(e.target.value))
            }
            className="text-sm border rounded-lg px-3 py-1.5 bg-background"
          >
            <option value="">Todas categorias</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          {isGerente && (
            <div className="flex gap-1">
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="Nova categoria"
                className="text-sm border rounded-lg px-2 py-1.5 w-32 bg-background"
              />
              <button
                type="button"
                onClick={handleCreateCategory}
                disabled={creatingCategory || !newCategoryName.trim()}
                className="p-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 disabled:opacity-50"
                title="Criar categoria"
              >
                <FolderPlus size={16} />
              </button>
            </div>
          )}
        </div>

        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`relative mb-4 rounded-xl border-2 border-dashed transition-colors cursor-pointer ${
            isDragging
              ? "border-primary bg-primary/10"
              : "border-muted-foreground/30 bg-muted/30 hover:border-muted-foreground/50"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={acceptedTypes}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            onChange={(e) => {
              handleFiles(e.target.files);
              e.target.value = "";
            }}
            disabled={uploading}
          />
          <div className="flex flex-col items-center justify-center py-6 px-4 pointer-events-none">
            <Upload size={32} className="text-muted-foreground mb-2" />
            <p className="text-sm font-medium text-foreground">
              {isDragging ? "Solte o arquivo aqui" : "Arraste um arquivo ou clique para selecionar"}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {typeFilter === "image" && "Imagens: JPEG, PNG, GIF, WebP"}
              {typeFilter === "video" && "Vídeos: MP4, WebM, OGG"}
              {typeFilter === "audio" && "Áudios: MP3, WAV, OGG"}
              {typeFilter === "document" && "Documentos: PDF, DOC, TXT, CSV"}
            </p>
            {uploading && (
              <div className="flex items-center gap-2 mt-2 text-primary">
                <Loader2 size={16} className="animate-spin" />
                <span className="text-xs">Enviando...</span>
              </div>
            )}
          </div>
        </div>

        {loading && (
          <div className="flex justify-center py-12">
            <Loader2 size={28} className="animate-spin text-muted-foreground" />
          </div>
        )}

        {!loading && media.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <p className="text-sm">Nenhuma mídia encontrada.</p>
            <p className="text-xs mt-1">Faça upload de arquivos na página de mídias.</p>
          </div>
        )}

        {!loading && media.length > 0 && (
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-3 overflow-y-auto flex-1 min-h-0">
            {media.map((m) => (
              <MediaThumb
                key={m.id}
                media={m}
                onSelect={() => handleSelect(m)}
              />
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function MediaThumb({
  media,
  onSelect,
}: {
  media: Media;
  onSelect: () => void;
}) {
  const url = resolveMediaUrl(media.url);
  const Icon = TYPE_ICONS[media.type];

  return (
    <button
      type="button"
      onClick={onSelect}
      className="media-picker-thumb group flex flex-col items-center p-2 rounded-none border border-border bg-white hover:border-primary/50 hover:bg-white transition-colors"
    >
      <div className="w-full aspect-square rounded-none overflow-hidden border border-border bg-white flex items-center justify-center">
        {media.type === "image" ? (
          <img
            src={url}
            alt={media.original_name}
            className="w-full h-full object-cover"
          />
        ) : (
          <Icon size={28} className="text-muted-foreground" />
        )}
      </div>
      <span className="text-xs truncate w-full mt-1 text-muted-foreground">
        {media.original_name}
      </span>
      <span className="text-xs text-primary opacity-0 group-hover:opacity-100 mt-1">
        Selecionar
      </span>
    </button>
  );
}
