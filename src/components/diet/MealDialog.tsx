import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface MealDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dietId: string;
  meal?: { id: string; name: string; time: string | null; sort_order: number } | null;
  onSuccess: () => void;
}

const MealDialog = ({ open, onOpenChange, dietId, meal, onSuccess }: MealDialogProps) => {
  const [name, setName] = useState("");
  const [time, setTime] = useState("");
  const [loading, setLoading] = useState(false);
  const isEditing = !!meal;

  useEffect(() => {
    if (meal) {
      setName(meal.name);
      setTime(meal.time || "");
    } else {
      setName("");
      setTime("");
    }
  }, [meal, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Nome da refeição é obrigatório");
      return;
    }

    setLoading(true);
    try {
      if (isEditing) {
        const { error } = await supabase
          .from("diet_meals")
          .update({ name, time: time || null })
          .eq("id", meal.id);
        if (error) throw error;
        toast.success("Refeição atualizada");
      } else {
        // Get max sort_order
        const { data: maxOrder } = await supabase
          .from("diet_meals")
          .select("sort_order")
          .eq("diet_id", dietId)
          .order("sort_order", { ascending: false })
          .limit(1);
        
        const newOrder = maxOrder && maxOrder.length > 0 ? maxOrder[0].sort_order + 1 : 0;

        const { error } = await supabase
          .from("diet_meals")
          .insert({ name, time: time || null, diet_id: dietId, sort_order: newOrder });
        if (error) throw error;
        toast.success("Refeição adicionada");
      }
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      toast.error("Erro ao salvar refeição");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar Refeição" : "Nova Refeição"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="meal-name">Nome</Label>
            <Input
              id="meal-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Café da Manhã"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="meal-time">Horário (opcional)</Label>
            <Input
              id="meal-time"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {isEditing ? "Salvar" : "Adicionar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default MealDialog;
