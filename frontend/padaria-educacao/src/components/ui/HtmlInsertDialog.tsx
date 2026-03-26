import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface HtmlInsertDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onInsert: (html: string) => void;
}

export default function HtmlInsertDialog({
  open,
  onOpenChange,
  onInsert,
}: HtmlInsertDialogProps) {
  const [html, setHtml] = useState("");

  function handleInsert() {
    onInsert(html);
    setHtml("");
    onOpenChange(false);
  }

  function handleOpenChange(next: boolean) {
    if (!next) setHtml("");
    onOpenChange(next);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Inserir HTML</DialogTitle>
          <DialogDescription>
            Cole HTML customizado (incluindo &lt;script&gt; e &lt;style&gt;). O conteúdo será renderizado em um bloco isolado.
          </DialogDescription>
        </DialogHeader>
        <textarea
          value={html}
          onChange={(e) => setHtml(e.target.value)}
          placeholder='<div>Conteúdo HTML</div>&#10;<style>body { font-size: 18px; }</style>&#10;<script>console.log("Exemplo");</script>'
          className="w-full min-h-[200px] p-3 rounded-lg border border-input bg-background text-foreground font-mono text-sm resize-y"
          spellCheck={false}
        />
        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleInsert} disabled={!html.trim()}>
            Inserir
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
