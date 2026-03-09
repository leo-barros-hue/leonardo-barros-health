import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface ExamResultDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  examId: string;
  result?: {
    id: string;
    marker_name: string;
    value: number;
    unit: string;
    reference_min: number | null;
    reference_max: number | null;
  } | null;
  onSuccess: () => void;
}

const ExamResultDialog = ({ open, onOpenChange, examId, result, onSuccess }: ExamResultDialogProps) => {
  const [markerName, setMarkerName] = useState("");
  const [value, setValue] = useState("");
  const [unit, setUnit] = useState("");
  const [refMin, setRefMin] = useState("");
  const [refMax, setRefMax] = useState("");
  const [loading, setLoading] = useState(false);
  const isEditing = !!result;

  useEffect(() => {
    if (result) {
      setMarkerName(result.marker_name);
      setValue(String(result.value));
      setUnit(result.unit);
      setRefMin(result.reference_min !== null ? String(result.reference_min) : "");
      setRefMax(result.reference_max !== null ? String(result.reference_max) : "");
    } else {
      setMarkerName("");
      setValue("");
      setUnit("");
      setRefMin("");
      setRefMax("");
    }
  }, [result, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!markerName.trim() || !value) {
      toast.error("Nome do marcador e valor são obrigatórios");
      return;
    }

    setLoading(true);
    try {
      const data = {
        marker_name: markerName,
        value: parseFloat(value),
        unit,
        reference_min: refMin ? parseFloat(refMin) : null,
        reference_max: refMax ? parseFloat(refMax) : null,
      };

      if (isEditing) {
        const { error } = await supabase
          .from("lab_exam_results")
          .update(data)
          .eq("id", result.id);
        if (error) throw error;
        toast.success("Resultado atualizado");
      } else {
        const { data: maxOrder } = await supabase
          .from("lab_exam_results")
          .select("sort_order")
          .eq("lab_exam_id", examId)
          .order("sort_order", { ascending: false })
          .limit(1);
        
        const newOrder = maxOrder && maxOrder.length > 0 ? maxOrder[0].sort_order + 1 : 0;

        const { error } = await supabase
          .from("lab_exam_results")
          .insert({ ...data, lab_exam_id: examId, sort_order: newOrder });
        if (error) throw error;
        toast.success("Resultado adicionado");
      }
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      toast.error("Erro ao salvar resultado");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar Resultado" : "Adicionar Marcador"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="marker-name">Marcador</Label>
            <Input
              id="marker-name"
              value={markerName}
              onChange={(e) => setMarkerName(e.target.value)}
              placeholder="Ex: Glicemia"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="value">Valor</Label>
              <Input
                id="value"
                type="number"
                step="0.01"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="unit">Unidade</Label>
              <Input
                id="unit"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="mg/dL"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="ref-min">Ref. Mínimo</Label>
              <Input
                id="ref-min"
                type="number"
                step="0.01"
                value={refMin}
                onChange={(e) => setRefMin(e.target.value)}
                placeholder="Opcional"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ref-max">Ref. Máximo</Label>
              <Input
                id="ref-max"
                type="number"
                step="0.01"
                value={refMax}
                onChange={(e) => setRefMax(e.target.value)}
                placeholder="Opcional"
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

export default ExamResultDialog;
