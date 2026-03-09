import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface PrescriptionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patientId: string;
  prescription?: { id: string; title: string; content: string; prescribed_at: string } | null;
  onSuccess: () => void;
}

const PrescriptionDialog = ({ open, onOpenChange, patientId, prescription, onSuccess }: PrescriptionDialogProps) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [prescribedAt, setPrescribedAt] = useState("");
  const [loading, setLoading] = useState(false);
  const isEditing = !!prescription;

  useEffect(() => {
    if (prescription) {
      setTitle(prescription.title);
      setContent(prescription.content);
      setPrescribedAt(prescription.prescribed_at);
    } else {
      setTitle("");
      setContent("");
      setPrescribedAt(new Date().toISOString().split("T")[0]);
    }
  }, [prescription, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      toast.error("Título e conteúdo são obrigatórios");
      return;
    }

    setLoading(true);
    try {
      if (isEditing) {
        const { error } = await supabase
          .from("prescriptions")
          .update({ title, content, prescribed_at: prescribedAt })
          .eq("id", prescription.id);
        if (error) throw error;
        toast.success("Prescrição atualizada");
      } else {
        const { error } = await supabase
          .from("prescriptions")
          .insert({ title, content, prescribed_at: prescribedAt, patient_id: patientId });
        if (error) throw error;
        toast.success("Prescrição criada");
      }
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      toast.error("Erro ao salvar prescrição");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar Prescrição" : "Nova Prescrição"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="presc-title">Título</Label>
            <Input
              id="presc-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Suplementação Vitamínica"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="presc-date">Data</Label>
            <Input
              id="presc-date"
              type="date"
              value={prescribedAt}
              onChange={(e) => setPrescribedAt(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="presc-content">Conteúdo</Label>
            <Textarea
              id="presc-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Detalhes da prescrição..."
              rows={6}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {isEditing ? "Salvar" : "Criar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PrescriptionDialog;
