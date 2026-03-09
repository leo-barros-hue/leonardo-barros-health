import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface DietDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patientId: string;
  diet?: { id: string; name: string } | null;
  onSuccess: () => void;
}

const DietDialog = ({ open, onOpenChange, patientId, diet, onSuccess }: DietDialogProps) => {
  const [name, setName] = useState(diet?.name || "");
  const [loading, setLoading] = useState(false);
  const isEditing = !!diet;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Nome da dieta é obrigatório");
      return;
    }

    setLoading(true);
    try {
      if (isEditing) {
        const { error } = await supabase
          .from("diets")
          .update({ name, updated_at: new Date().toISOString() })
          .eq("id", diet.id);
        if (error) throw error;
        toast.success("Dieta atualizada com sucesso");
      } else {
        const { error } = await supabase
          .from("diets")
          .insert({ name, patient_id: patientId });
        if (error) throw error;
        toast.success("Dieta criada com sucesso");
      }
      onSuccess();
      onOpenChange(false);
      setName("");
    } catch (error) {
      toast.error("Erro ao salvar dieta");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar Dieta" : "Nova Dieta"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="diet-name">Nome da Dieta</Label>
            <Input
              id="diet-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Dieta de Definição"
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

export default DietDialog;
