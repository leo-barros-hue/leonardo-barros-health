import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Plus, Trash2, FlaskConical, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import ExamDialog from "@/components/exams/ExamDialog";
import ExamResultDialog from "@/components/exams/ExamResultDialog";

interface ExamResult {
  id: string;
  marker_name: string;
  value: number;
  unit: string;
  reference_min: number | null;
  reference_max: number | null;
  sort_order: number;
}

interface LabExam {
  id: string;
  exam_date: string;
  notes: string | null;
  results: ExamResult[];
}

interface Props {
  patientId: string;
}

const PatientExamsTab = ({ patientId }: Props) => {
  const [loading, setLoading] = useState(true);
  const [exams, setExams] = useState<LabExam[]>([]);
  const [selectedExam, setSelectedExam] = useState<LabExam | null>(null);

  // Dialog states
  const [examDialogOpen, setExamDialogOpen] = useState(false);
  const [editingExam, setEditingExam] = useState<LabExam | null>(null);
  const [resultDialogOpen, setResultDialogOpen] = useState(false);
  const [editingResult, setEditingResult] = useState<ExamResult | null>(null);

  useEffect(() => {
    fetchExams();
  }, [patientId]);

  const fetchExams = async () => {
    const { data: examsData } = await supabase
      .from("lab_exams")
      .select("*")
      .eq("patient_id", patientId)
      .order("exam_date", { ascending: false });

    const examsWithResults: LabExam[] = [];
    for (const exam of examsData || []) {
      const { data: results } = await supabase
        .from("lab_exam_results")
        .select("*")
        .eq("lab_exam_id", exam.id)
        .order("sort_order");
      
      examsWithResults.push({ ...exam, results: results || [] });
    }

    setExams(examsWithResults);
    if (examsWithResults.length > 0) {
      setSelectedExam(examsWithResults[0]);
    } else {
      setSelectedExam(null);
    }
    setLoading(false);
  };

  const handleDeleteExam = async (examId: string) => {
    if (!confirm("Excluir este exame?")) return;
    const { error } = await supabase.from("lab_exams").delete().eq("id", examId);
    if (error) {
      toast.error("Erro ao excluir exame");
    } else {
      toast.success("Exame excluído");
      setSelectedExam(null);
      fetchExams();
    }
  };

  const handleDeleteResult = async (resultId: string) => {
    if (!confirm("Excluir este marcador?")) return;
    const { error } = await supabase.from("lab_exam_results").delete().eq("id", resultId);
    if (error) {
      toast.error("Erro ao excluir marcador");
    } else {
      toast.success("Marcador excluído");
      fetchExams();
    }
  };

  const getValueStatus = (result: ExamResult) => {
    if (result.reference_min !== null && result.value < result.reference_min) return "low";
    if (result.reference_max !== null && result.value > result.reference_max) return "high";
    return "normal";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-foreground">Exames Laboratoriais</h2>
        <Button onClick={() => { setEditingExam(null); setExamDialogOpen(true); }} className="gap-2">
          <Plus className="w-4 h-4" />
          Novo Exame
        </Button>
      </div>

      {exams.length === 0 ? (
        <div className="glass-card p-8 text-center">
          <FlaskConical className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">Nenhum exame cadastrado</h3>
          <p className="text-sm text-muted-foreground">
            Clique em "Novo Exame" para começar.
          </p>
        </div>
      ) : (
        <>
          {/* Exam Selector */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {exams.map((exam) => (
              <button
                key={exam.id}
                onClick={() => setSelectedExam(exam)}
                className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                  selectedExam?.id === exam.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary/50 text-muted-foreground hover:text-foreground"
                }`}
              >
                {new Date(exam.exam_date).toLocaleDateString("pt-BR")}
              </button>
            ))}
          </div>

          {selectedExam && (
            <>
              {/* Exam Header */}
              <div className="glass-card p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-bold text-foreground">
                      Exame de {new Date(selectedExam.exam_date).toLocaleDateString("pt-BR")}
                    </h2>
                    {selectedExam.notes && (
                      <p className="text-sm text-muted-foreground">{selectedExam.notes}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => { setEditingExam(selectedExam); setExamDialogOpen(true); }}>
                      <Pencil className="w-4 h-4 mr-1" /> Editar
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDeleteExam(selectedExam.id)}>
                      <Trash2 className="w-4 h-4 mr-1" /> Excluir
                    </Button>
                  </div>
                </div>
              </div>

              {/* Results */}
              <div className="glass-card p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-foreground">Marcadores</h3>
                  <Button variant="outline" size="sm" onClick={() => { setEditingResult(null); setResultDialogOpen(true); }} className="gap-1">
                    <Plus className="w-3 h-3" /> Adicionar
                  </Button>
                </div>

                {selectedExam.results.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4 text-center">Nenhum marcador adicionado.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-2 text-muted-foreground font-medium">Marcador</th>
                          <th className="text-center py-2 text-muted-foreground font-medium w-24">Valor</th>
                          <th className="text-center py-2 text-muted-foreground font-medium w-20">Unidade</th>
                          <th className="text-center py-2 text-muted-foreground font-medium hidden sm:table-cell">Referência</th>
                          <th className="text-center py-2 text-muted-foreground font-medium w-20">Status</th>
                          <th className="w-20"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedExam.results.map((result) => {
                          const status = getValueStatus(result);
                          return (
                            <tr key={result.id} className="border-b border-border/50 last:border-0">
                              <td className="py-3 font-medium text-foreground">{result.marker_name}</td>
                              <td className={`py-3 text-center font-bold ${
                                status === "low" ? "text-blue-500" : 
                                status === "high" ? "text-destructive" : "text-success"
                              }`}>
                                {result.value}
                              </td>
                              <td className="py-3 text-center text-muted-foreground">{result.unit}</td>
                              <td className="py-3 text-center text-muted-foreground hidden sm:table-cell">
                                {result.reference_min !== null && result.reference_max !== null 
                                  ? `${result.reference_min} - ${result.reference_max}`
                                  : "—"
                                }
                              </td>
                              <td className="py-3 text-center">
                                <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                                  status === "low" ? "bg-blue-500/10 text-blue-500" : 
                                  status === "high" ? "bg-destructive/10 text-destructive" : 
                                  "bg-success/10 text-success"
                                }`}>
                                  {status === "low" ? "Baixo" : status === "high" ? "Alto" : "Normal"}
                                </span>
                              </td>
                              <td className="py-3 text-right">
                                <div className="flex justify-end gap-1">
                                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => { setEditingResult(result); setResultDialogOpen(true); }}>
                                    <Pencil className="w-3 h-3" />
                                  </Button>
                                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => handleDeleteResult(result.id)}>
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}
        </>
      )}

      {/* Dialogs */}
      <ExamDialog
        open={examDialogOpen}
        onOpenChange={setExamDialogOpen}
        patientId={patientId}
        exam={editingExam}
        onSuccess={fetchExams}
      />
      {selectedExam && (
        <ExamResultDialog
          open={resultDialogOpen}
          onOpenChange={setResultDialogOpen}
          examId={selectedExam.id}
          result={editingResult}
          onSuccess={fetchExams}
        />
      )}
    </div>
  );
};

export default PatientExamsTab;
