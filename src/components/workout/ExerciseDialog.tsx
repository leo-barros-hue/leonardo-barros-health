import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface ExerciseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workoutDayId: string;
  exercise?: {
    id: string;
    name: string;
    sets: number;
    reps: string;
    rest_seconds: number | null;
    notes: string | null;
    technique: string | null;
  } | null;
  onSuccess: () => void;
}

const ExerciseDialog = ({ open, onOpenChange, workoutDayId, exercise, onSuccess }: ExerciseDialogProps) => {
  const [name, setName] = useState("");
  const [sets, setSets] = useState("3");
  const [reps, setReps] = useState("10-12");
  const [rest, setRest] = useState("60");
  const [technique, setTechnique] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const isEditing = !!exercise;

  useEffect(() => {
    if (exercise) {
      setName(exercise.name);
      setSets(String(exercise.sets));
      setReps(exercise.reps);
      setRest(exercise.rest_seconds ? String(exercise.rest_seconds) : "60");
      setTechnique(exercise.technique || "");
      setNotes(exercise.notes || "");
    } else {
      setName("");
      setSets("3");
      setReps("10-12");
      setRest("60");
      setTechnique("");
      setNotes("");
    }
  }, [exercise, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Nome do exercício é obrigatório");
      return;
    }

    setLoading(true);
    try {
      const data: any = {
        name,
        sets: parseInt(sets) || 3,
        reps,
        rest_seconds: parseInt(rest) || 60,
        technique: technique || null,
        notes: notes || null,
      };

      if (isEditing) {
        const { error } = await supabase
          .from("workout_exercises")
          .update(data)
          .eq("id", exercise.id);
        if (error) throw error;
        toast.success("Exercício atualizado");
      } else {
        const { data: maxOrder } = await supabase
          .from("workout_exercises")
          .select("sort_order")
          .eq("workout_day_id", workoutDayId)
          .order("sort_order", { ascending: false })
          .limit(1);

        const newOrder = maxOrder && maxOrder.length > 0 ? maxOrder[0].sort_order + 1 : 0;

        const { error } = await supabase
          .from("workout_exercises")
          .insert({ ...data, workout_day_id: workoutDayId, sort_order: newOrder });
        if (error) throw error;
        toast.success("Exercício adicionado");
      }
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      toast.error("Erro ao salvar exercício");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar Exercício" : "Adicionar Exercício"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="exercise-name">Exercício</Label>
            <Input
              id="exercise-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Supino Reto"
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label htmlFor="sets">Séries</Label>
              <Input
                id="sets"
                type="number"
                value={sets}
                onChange={(e) => setSets(e.target.value)}
                placeholder="3"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reps">Repetições</Label>
              <Input
                id="reps"
                value={reps}
                onChange={(e) => setReps(e.target.value)}
                placeholder="10-12"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rest">Descanso (s)</Label>
              <Input
                id="rest"
                type="number"
                value={rest}
                onChange={(e) => setRest(e.target.value)}
                placeholder="60"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="technique">Técnica de Treino</Label>
            <Input
              id="technique"
              value={technique}
              onChange={(e) => setTechnique(e.target.value)}
              placeholder="Ex: Drop-set, Rest-pause, Bi-set..."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Observações (opcional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Detalhes adicionais..."
              rows={2}
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

export default ExerciseDialog;
