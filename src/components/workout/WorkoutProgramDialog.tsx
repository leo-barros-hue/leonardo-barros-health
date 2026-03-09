import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface WorkoutProgramDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patientId: string;
  program?: { id: string; name: string; description: string | null } | null;
  onSuccess: () => void;
}

const WorkoutProgramDialog = ({ open, onOpenChange, patientId, program, onSuccess }: WorkoutProgramDialogProps) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const isEditing = !!program;

  useEffect(() => {
    if (program) {
      setName(program.name);
      setDescription(program.description || "");
    } else {
      setName("");
      setDescription("");
    }
  }, [program, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Nome do programa é obrigatório");
      return;
    }

    setLoading(true);
    try {
      if (isEditing) {
        const { error } = await supabase
          .from("workout_programs")
          .update({ name, description: description || null, updated_at: new Date().toISOString() })
          .eq("id", program.id);
        if (error) throw error;
        toast.success("Programa atualizado");
      } else {
        const { error } = await supabase
          .from("workout_programs")
          .insert({ name, description: description || null, patient_id: patientId });
        if (error) throw error;
        toast.success("Programa criado");
      }
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      toast.error("Erro ao salvar programa");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar Programa" : "Novo Programa de Treino"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="program-name">Nome</Label>
            <Input
              id="program-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Treino Hipertrofia"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="program-desc">Descrição (opcional)</Label>
            <Textarea
              id="program-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descrição do programa..."
              rows={3}
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

export default WorkoutProgramDialog;
