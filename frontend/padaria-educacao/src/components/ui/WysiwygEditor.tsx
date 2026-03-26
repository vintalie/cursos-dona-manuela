import { useRef, useMemo, useState } from "react";
import ReactQuill, { Quill } from "react-quill";
import "react-quill/dist/quill.snow.css";
import MediaPickerDialog from "@/components/media/MediaPickerDialog";
import { resolveMediaUrl } from "@/services/media.service";
import type { Media, MediaType } from "@/types";
import HtmlInsertDialog from "./HtmlInsertDialog";

const BlockEmbed = Quill.import("blots/block/embed") as typeof Quill;

function encodeHtml(str: string): string {
  return btoa(unescape(encodeURIComponent(str)));
}

function decodeHtml(str: string): string {
  try {
    return decodeURIComponent(escape(atob(str)));
  } catch {
    return str;
  }
}

/** Blot para HTML customizado (permite <script> e <style>) — renderizado em iframe para isolamento */
class HtmlBlockBlot extends (BlockEmbed as any) {
  static blotName = "htmlBlock";
  static tagName = "DIV";
  static className = "ql-html-block";

  static create(value: string) {
    const node = super.create() as HTMLDivElement;
    node.setAttribute("data-html", encodeHtml(value));
    node.contentEditable = "false";
    const iframe = document.createElement("iframe");
    iframe.setAttribute("srcdoc", value);
    iframe.style.width = "100%";
    iframe.style.minHeight = "200px";
    iframe.style.border = "1px solid hsl(var(--border))";
    iframe.style.borderRadius = "8px";
    iframe.style.background = "white";
    node.appendChild(iframe);
    return node;
  }

  static value(node: HTMLDivElement) {
    const data = node.getAttribute("data-html");
    if (data) return decodeHtml(data);
    const iframe = node.querySelector("iframe");
    return iframe?.getAttribute("srcdoc") ?? "";
  }
}

class IframeBlot extends (BlockEmbed as any) {
  static blotName = "iframe";
  static tagName = "IFRAME";

  static create(value: { src: string; width?: string; height?: string }) {
    const node = super.create() as HTMLIFrameElement;
    node.setAttribute("src", value.src);
    node.setAttribute("width", value.width ?? "100%");
    node.setAttribute("height", value.height ?? "420");
    node.setAttribute("frameborder", "0");
    node.setAttribute("allowfullscreen", "true");
    node.style.border = "none";
    node.style.borderRadius = "8px";
    return node;
  }

  static value(node: HTMLIFrameElement) {
    return {
      src: node.getAttribute("src"),
      width: node.getAttribute("width"),
      height: node.getAttribute("height"),
    };
  }
}

class VideoBlot extends (BlockEmbed as any) {
  static blotName = "video";
  static tagName = "VIDEO";

  static create(value: { src: string }) {
    const node = super.create() as HTMLVideoElement;
    node.setAttribute("src", value.src);
    node.setAttribute("controls", "true");
    node.style.maxWidth = "100%";
    node.style.borderRadius = "8px";
    return node;
  }

  static value(node: HTMLVideoElement) {
    return { src: node.getAttribute("src") };
  }
}

class AudioBlot extends (BlockEmbed as any) {
  static blotName = "audio";
  static tagName = "AUDIO";

  static create(value: { src: string }) {
    const node = super.create() as HTMLAudioElement;
    node.setAttribute("src", value.src);
    node.setAttribute("controls", "true");
    node.style.maxWidth = "100%";
    return node;
  }

  static value(node: HTMLAudioElement) {
    return { src: node.getAttribute("src") };
  }
}

Quill.register(HtmlBlockBlot);
Quill.register(IframeBlot);
Quill.register(VideoBlot);
Quill.register(AudioBlot);

const formats = [
  "header",
  "bold", "italic", "underline", "strike",
  "list", "bullet",
  "align",
  "link",
  "image",
  "iframe",
  "video",
  "audio",
  "htmlBlock",
];

interface WysiwygEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  minHeight?: string;
  onInsertMinigame?: () => void;
  /** Default media type for the media picker (image, video, audio, document) */
  defaultMediaType?: MediaType;
}

export default function WysiwygEditor({
  value,
  onChange,
  placeholder,
  className = "",
  minHeight = "120px",
  onInsertMinigame,
  defaultMediaType = "image",
}: WysiwygEditorProps) {
  const quillRef = useRef<ReactQuill>(null);
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
  const [htmlDialogOpen, setHtmlDialogOpen] = useState(false);

  const insertHtml = (html: string) => {
    if (!html.trim()) return;
    const editor = quillRef.current?.getEditor();
    if (!editor) return;
    const range = editor.getSelection(true) ?? { index: editor.getLength(), length: 0 };
    editor.insertEmbed(range.index, "htmlBlock", html.trim());
    editor.setSelection(range.index + 1, 0);
  };

  const insertMedia = (media: Media) => {
    const editor = quillRef.current?.getEditor();
    if (!editor) return;
    const range = editor.getSelection(true) ?? { index: editor.getLength(), length: 0 };
    const url = resolveMediaUrl(media.url);

    if (media.type === "image") {
      editor.insertEmbed(range.index, "image", url);
      editor.setSelection(range.index + 1, 0);
    } else if (media.type === "video") {
      editor.insertEmbed(range.index, "video", { src: url });
      editor.setSelection(range.index + 1, 0);
    } else if (media.type === "audio") {
      editor.insertEmbed(range.index, "audio", { src: url });
      editor.setSelection(range.index + 1, 0);
    } else {
      editor.insertText(range.index, media.original_name, "link", url);
      editor.setSelection(range.index + media.original_name.length, 0);
    }
  };

  const modules = useMemo(() => {
    const toolbar: (string | { [key: string]: unknown } | string[])[][] = [
      [{ header: [1, 2, 3, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ list: "ordered" }, { list: "bullet" }],
      [{ align: [] }],
      ["link", "media", "html"],
      ["clean"],
    ];

    if (onInsertMinigame) {
      toolbar.push(["minigame"]);
    }

    return {
      toolbar: {
        container: toolbar,
        handlers: {
          media: () => setMediaPickerOpen(true),
          html: () => setHtmlDialogOpen(true),
          ...(onInsertMinigame ? { minigame: () => onInsertMinigame() } : {}),
        },
      },
    };
  }, [onInsertMinigame]);

  return (
    <div className={`wysiwyg-editor ${className} ${onInsertMinigame ? "has-minigame-btn" : ""}`}>
      <ReactQuill
        ref={quillRef}
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
        style={{ minHeight }}
      />
      <MediaPickerDialog
        open={mediaPickerOpen}
        onOpenChange={setMediaPickerOpen}
        onSelect={insertMedia}
        type={defaultMediaType}
      />
      <HtmlInsertDialog
        open={htmlDialogOpen}
        onOpenChange={setHtmlDialogOpen}
        onInsert={insertHtml}
      />
    </div>
  );
}

export function insertIframeIntoEditor(
  quillRef: React.RefObject<ReactQuill>,
  src: string
) {
  const editor = quillRef.current?.getEditor();
  if (!editor) return;
  const range = editor.getSelection(true);
  editor.insertEmbed(range.index, "iframe", { src, width: "100%", height: "420" });
  editor.setSelection(range.index + 1, 0);
}
