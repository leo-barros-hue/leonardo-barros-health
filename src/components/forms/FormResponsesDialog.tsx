import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { FileText, User, ChevronRight } from "lucide-react";

interface FormResponsesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  templateId: string | null;
  templateName: string;
}

interface Assignment {
  id: string;
  patient_id: string;
  patient_name: string;
  assigned_at: string;
  completed_at: string | null;
}

interface ResponseDetail {
  question_text: string;
  question_type: string;
  answer_text: string | null;
  answer_number: number | null;
  sort_order: number;
}

const FormResponsesDialog = ({ open, onOpenChange, templateId, templateName }: FormResponsesDialogProps) => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [selectedAssignment, setSelectedAssignment] = useState<string | null>(null);
  const [responses, setResponses] = useState<ResponseDetail[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !templateId) return;
    setSelectedAssignment(null);
    setLoading(true);

    const load = async () => {
      const { data } = await supabase
        .from("form_assignments")
        .select("id, patient_id, assigned_at, completed_at, patients(name)")
        .eq("form_template_id", templateId)
        .order("assigned_at", { ascending: false });

      if (data) {
        setAssignments(
          data.map((a: any) => ({
            id: a.id,
            patient_id: a.patient_id,
            patient_name: a.patients?.name || "Paciente",
            assigned_at: a.assigned_at,
            completed_at: a.completed_at,
          }))
        );
      }
      setLoading(false);
    };
    load();
  }, [open, templateId]);

  const loadResponses = async (assignmentId: string) => {
    setSelectedAssignment(assignmentId);
    const { data } = await supabase
      .from("form_responses")
      .select("answer_text, answer_number, form_questions(question_text, question_type, sort_order)")
      .eq("form_assignment_id", assignmentId);

    if (data) {
      setResponses(
        data
          .map((r: any) => ({
            question_text: r.form_questions?.question_text || "",
            question_type: r.form_questions?.question_type || "text",
            answer_text: r.answer_text,
            answer_number: r.answer_number,
            sort_order: r.form_questions?.sort_order ?? 0,
          }))
          .sort((a: ResponseDetail, b: ResponseDetail) => a.sort_order - b.sort_order)
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Respostas — {templateName}</DialogTitle>
        </DialogHeader>

        {!selectedAssignment ? (
          <ScrollArea className="flex-1 max-h-[500px]">
            {loading ? (
              <p className="text-center text-muted-foreground py-8">Carregando...</p>
            ) : assignments.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
                <p className="text-muted-foreground text-sm">Nenhuma resposta recebida</p>
              </div>
            ) : (
              <div className="space-y-2 py-2">
                {assignments.map((a) => (
                  <button
                    key={a.id}
                    onClick={() => a.completed_at && loadResponses(a.id)}
                    className="w-full flex items-center gap-3 p-3 rounded-xl border border-border hover:bg-secondary/50 transition-colors text-left"
                  >
                    <User className="w-4 h-4 text-muted-foreground shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{a.patient_name}</p>
                      <p className="text-xs text-muted-foreground">
                        Enviado em {format(new Date(a.assigned_at), "dd/MM/yyyy", { locale: ptBR })}
                      </p>
                    </div>
                    {a.completed_at ? (
                      <Badge variant="secondary" className="text-xs bg-green-500/10 text-green-600 border-green-500/20">
                        Respondido
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="text-xs">Pendente</Badge>
                    )}
                    {a.completed_at && <ChevronRight className="w-4 h-4 text-muted-foreground" />}
                  </button>
                ))}
              </div>
            )}
          </ScrollArea>
        ) : (
          <>
            <button onClick={() => setSelectedAssignment(null)} className="text-xs text-primary hover:underline self-start mb-2">
              ← Voltar à lista
            </button>
            <ScrollArea className="flex-1 max-h-[500px]">
              <div className="space-y-4 py-2">
                {responses.map((r, idx) => (
                  <div key={idx} className="space-y-1">
                    <p className="text-sm font-medium text-foreground">{idx + 1}. {r.question_text}</p>
                    <p className="text-sm text-muted-foreground bg-secondary/50 rounded-lg px-3 py-2">
                      {r.answer_text || (r.answer_number !== null ? String(r.answer_number) : "—")}
                    </p>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default FormResponsesDialog;
