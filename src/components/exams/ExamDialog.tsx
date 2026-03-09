import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface ExamDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patientId: string;
  exam?: { id: string; exam_date: string; notes: string | null } | null;
  onSuccess: () => void;
}

const ExamDialog = ({ open, onOpenChange, patientId, exam, onSuccess }: ExamDialogProps) => {
  const [examDate, setExamDate] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const isEditing = !!exam;

  useEffect(() => {
    if (exam) {
      setExamDate(exam.exam_date);
      setNotes(exam.notes || "");
    } else {
      setExamDate(new Date().toISOString().split("T")[0]);
      setNotes("");
    }
  }, [exam, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!examDate) {
      toast.error("Data do exame é obrigatória");
      return;
    }

    setLoading(true);
    try {
      if (isEditing) {
        const { error } = await supabase
          .from("lab_exams")
          .update({ exam_date: examDate, notes: notes || null })
          .eq("id", exam.id);
        if (error) throw error;
        toast.success("Exame atualizado");
      } else {
        const { error } = await supabase
          .from("lab_exams")
          .insert({ exam_date: examDate, notes: notes || null, patient_id: patientId });
        if (error) throw error;
        toast.success("Exame criado");
      }
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      toast.error("Erro ao salvar exame");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar Exame" : "Novo Exame"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="exam-date">Data do Exame</Label>
            <Input
              id="exam-date"
              type="date"
              value={examDate}
              onChange={(e) => setExamDate(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="exam-notes">Observações (opcional)</Label>
            <Textarea
              id="exam-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Laboratório, jejum, etc..."
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

export default ExamDialog;
