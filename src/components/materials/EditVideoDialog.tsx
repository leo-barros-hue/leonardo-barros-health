import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";
import { Loader2 } from "lucide-react";

interface EditVideoDialogProps {
  video: { id: string; title: string; description: string } | null;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const EditVideoDialog = ({ video, onOpenChange, onSuccess }: EditVideoDialogProps) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (video) {
      setTitle(video.title);
      setDescription(video.description || "");
    }
  }, [video]);

  const handleSubmit = async () => {
    if (!video || !title.trim()) return;
    setLoading(true);
    const { error } = await supabase.from("materials_videos").update({
      title: title.trim(),
      description: description.trim(),
    }).eq("id", video.id);
    setLoading(false);
    if (error) { toast.error("Erro ao salvar."); return; }
    toast.success("Vídeo atualizado!");
    onOpenChange(false);
    onSuccess();
  };

  return (
    <Dialog open={!!video} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader><DialogTitle>Editar Vídeo</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div><Label>Título *</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} /></div>
          <div><Label>Descrição</Label><Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} /></div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading && <Loader2 className="w-4 h-4 animate-spin" />} Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditVideoDialog;
