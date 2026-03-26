import { useState } from "react";
import { ImagePlus } from "lucide-react";
import MediaPickerDialog from "./MediaPickerDialog";
import { resolveMediaUrl } from "@/services/media.service";
import type { Media, MediaType } from "@/types";

interface UrlFieldWithPickerProps {
  value: string;
  onChange: (url: string) => void;
  type?: MediaType;
  placeholder?: string;
  className?: string;
  label?: string;
}

export default function UrlFieldWithPicker({
  value,
  onChange,
  type = "image",
  placeholder = "https://... ou selecione da biblioteca",
  className = "",
  label,
}: UrlFieldWithPickerProps) {
  const [pickerOpen, setPickerOpen] = useState(false);

  function handleSelect(media: Media) {
    onChange(resolveMediaUrl(media.url));
  }

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium mb-1">{label}</label>
      )}
      <div className="flex gap-2">
        <input
          type="url"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 p-3 border border-input rounded-lg bg-background text-foreground"
          placeholder={placeholder}
        />
        <button
          type="button"
          onClick={() => setPickerOpen(true)}
          className="p-3 rounded-lg border border-input bg-muted/30 hover:bg-muted/50 transition-colors"
          title="Selecionar da biblioteca"
        >
          <ImagePlus size={20} className="text-muted-foreground" />
        </button>
      </div>
      <MediaPickerDialog
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        onSelect={handleSelect}
        type={type}
      />
    </div>
  );
}
