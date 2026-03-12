import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface WorkoutDayDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  programId: string;
  day?: { id: string; name: string; sort_order: number; rep_range?: string | null; rest_interval?: string | null } | null;
  onSuccess: () => void;
}

const WorkoutDayDialog = ({ open, onOpenChange, programId, day, onSuccess }: WorkoutDayDialogProps) => {
  const [name, setName] = useState("");
  const [repRange, setRepRange] = useState("");
  const [restInterval, setRestInterval] = useState("");
  const [loading, setLoading] = useState(false);
  const isEditing = !!day;

  useEffect(() => {
    if (day) {
      setName(day.name);
      setRepRange(day.rep_range || "");
      setRestInterval(day.rest_interval || "");
    } else {
      setName("");
      setRepRange("");
      setRestInterval("");
    }
  }, [day, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Nome do treino é obrigatório");
      return;
    }

    setLoading(true);
    try {
      const payload: any = {
        name,
        rep_range: repRange || null,
        rest_interval: restInterval || null,
      };

      if (isEditing) {
        const { error } = await supabase
          .from("workout_days")
          .update(payload)
          .eq("id", day.id);
        if (error) throw error;
        toast.success("Treino atualizado");
      } else {
        const { data: maxOrder } = await supabase
          .from("workout_days")
          .select("sort_order")
          .eq("program_id", programId)
          .order("sort_order", { ascending: false })
          .limit(1);

        const newOrder = maxOrder && maxOrder.length > 0 ? maxOrder[0].sort_order + 1 : 0;

        const { error } = await supabase
          .from("workout_days")
          .insert({ ...payload, program_id: programId, sort_order: newOrder });
        if (error) throw error;
        toast.success("Treino adicionado");
      }
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      toast.error("Erro ao salvar treino");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar Treino" : "Novo Treino"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="day-name">Nome do Treino</Label>
            <Input
              id="day-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Treino A - Peito e Tríceps"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="rep-range">Faixa de Repetições</Label>
              <Input
                id="rep-range"
                value={repRange}
                onChange={(e) => setRepRange(e.target.value)}
                placeholder="Ex: 10-12"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rest-interval">Intervalo entre Séries</Label>
              <Input
                id="rest-interval"
                value={restInterval}
                onChange={(e) => setRestInterval(e.target.value)}
                placeholder="Ex: 60s"
              />
            </div>
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

export default WorkoutDayDialog;
