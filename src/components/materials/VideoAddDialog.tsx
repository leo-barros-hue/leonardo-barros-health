import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";
import { Loader2 } from "lucide-react";

interface VideoAddDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
  ];
  for (const p of patterns) {
    const match = url.match(p);
    if (match) return match[1];
  }
  return null;
}

const VideoAddDialog = ({ open, onOpenChange, onSuccess }: VideoAddDialogProps) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const youtubeId = extractYouTubeId(youtubeUrl);

  const handleSubmit = async () => {
    if (!title.trim() || !youtubeId) {
      toast.error("Preencha o título e insira uma URL válida do YouTube.");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from("materials_videos").insert({
        title: title.trim(),
        description: description.trim(),
        youtube_url: youtubeUrl.trim(),
        youtube_id: youtubeId,
      });

      if (error) throw error;

      toast.success("Vídeo adicionado com sucesso!");
      setTitle("");
      setDescription("");
      setYoutubeUrl("");
      onOpenChange(false);
      onSuccess();
    } catch (err: any) {
      toast.error("Erro ao adicionar vídeo: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Adicionar Vídeo</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>URL do YouTube *</Label>
            <Input value={youtubeUrl} onChange={(e) => setYoutubeUrl(e.target.value)} placeholder="https://www.youtube.com/watch?v=..." />
            {youtubeUrl && !youtubeId && (
              <p className="text-xs text-destructive mt-1">URL inválida do YouTube</p>
            )}
            {youtubeId && (
              <div className="mt-2 rounded-lg overflow-hidden border border-border aspect-video">
                <iframe
                  src={`https://www.youtube.com/embed/${youtubeId}`}
                  className="w-full h-full"
                  allowFullScreen
                  title="Preview"
                />
              </div>
            )}
          </div>
          <div>
            <Label>Título *</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex: Como interpretar exames" />
          </div>
          <div>
            <Label>Descrição</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Breve descrição do vídeo" rows={2} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default VideoAddDialog;
