import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Plus, Trash2, FlaskConical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface ExamResult {
  id: string;
  marker_name: string;
  value: number;
  unit: string;
  reference_min: number | null;
  reference_max: number | null;
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

const commonMarkers = [
  { name: "Glicemia", unit: "mg/dL", min: 70, max: 99 },
  { name: "Hemoglobina Glicada", unit: "%", min: 4, max: 5.6 },
  { name: "Insulina", unit: "µU/mL", min: 2.6, max: 24.9 },
  { name: "Colesterol Total", unit: "mg/dL", min: 0, max: 200 },
  { name: "HDL", unit: "mg/dL", min: 40, max: 999 },
  { name: "LDL", unit: "mg/dL", min: 0, max: 100 },
  { name: "Triglicerídeos", unit: "mg/dL", min: 0, max: 150 },
  { name: "TSH", unit: "µUI/mL", min: 0.4, max: 4.0 },
  { name: "T4 Livre", unit: "ng/dL", min: 0.8, max: 1.8 },
  { name: "Testosterona Total", unit: "ng/dL", min: 300, max: 1000 },
  { name: "Vitamina D", unit: "ng/mL", min: 30, max: 100 },
  { name: "Vitamina B12", unit: "pg/mL", min: 200, max: 900 },
];

const PatientExamsTab = ({ patientId }: Props) => {
  const [loading, setLoading] = useState(true);
  const [exams, setExams] = useState<LabExam[]>([]);
  const [selectedExam, setSelectedExam] = useState<string | null>(null);

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
      setSelectedExam(examsWithResults[0].id);
    }
    setLoading(false);
  };

  const createExam = async () => {
    const { data, error } = await supabase
      .from("lab_exams")
      .insert({ patient_id: patientId })
      .select("id")
      .single();

    if (error) {
      toast.error("Erro ao criar exame");
      return;
    }

    toast.success("Exame criado!");
    fetchExams();
    setSelectedExam(data.id);
  };

  const addResult = async (examId: string, marker: typeof commonMarkers[0]) => {
    const exam = exams.find(e => e.id === examId);
    if (!exam) return;

    const { error } = await supabase
      .from("lab_exam_results")
      .insert({
        lab_exam_id: examId,
        marker_name: marker.name,
        value: 0,
        unit: marker.unit,
        reference_min: marker.min,
        reference_max: marker.max,
        sort_order: exam.results.length
      });

    if (error) {
      toast.error("Erro ao adicionar marcador");
      return;
    }

    fetchExams();
  };

  const updateResult = async (resultId: string, value: number) => {
    await supabase
      .from("lab_exam_results")
      .update({ value })
      .eq("id", resultId);
    
    fetchExams();
  };

  const deleteResult = async (resultId: string) => {
    await supabase.from("lab_exam_results").delete().eq("id", resultId);
    fetchExams();
  };

  const deleteExam = async (examId: string) => {
    await supabase.from("lab_exams").delete().eq("id", examId);
    setSelectedExam(null);
    fetchExams();
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

  if (exams.length === 0) {
    return (
      <div className="glass-card p-6 text-center">
        <FlaskConical className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
        <h2 className="text-lg font-bold text-foreground mb-2">Nenhum exame cadastrado</h2>
        <p className="text-sm text-muted-foreground mb-4">Adicione os resultados de exames laboratoriais do paciente.</p>
        <Button onClick={createExam}>
          <Plus className="w-4 h-4 mr-2" /> Novo Exame
        </Button>
      </div>
    );
  }

  const currentExam = exams.find(e => e.id === selectedExam);

  return (
    <div className="space-y-4">
      {/* Exam Selector */}
      <div className="glass-card p-4 flex items-center gap-4">
        <select
          value={selectedExam || ""}
          onChange={(e) => setSelectedExam(e.target.value)}
          className="flex-1 bg-secondary/50 rounded-lg px-3 py-2 text-sm"
        >
          {exams.map((exam) => (
            <option key={exam.id} value={exam.id}>
              {new Date(exam.exam_date).toLocaleDateString("pt-BR")}
            </option>
          ))}
        </select>
        <Button variant="outline" size="sm" onClick={createExam}>
          <Plus className="w-4 h-4 mr-1" /> Novo
        </Button>
      </div>

      {/* Results */}
      {currentExam && (
        <div className="glass-card p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-foreground">
              Exame de {new Date(currentExam.exam_date).toLocaleDateString("pt-BR")}
            </h3>
            <Button variant="ghost" size="sm" onClick={() => deleteExam(currentExam.id)} className="text-destructive">
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>

          {currentExam.results.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">Nenhum marcador adicionado.</p>
          ) : (
            <div className="space-y-2">
              {currentExam.results.map((result) => {
                const status = getValueStatus(result);
                return (
                  <div key={result.id} className="flex items-center gap-3 bg-secondary/30 rounded-xl p-3">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">{result.marker_name}</p>
                      <p className="text-xs text-muted-foreground">
                        Ref: {result.reference_min} - {result.reference_max} {result.unit}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        value={result.value}
                        onChange={(e) => updateResult(result.id, parseFloat(e.target.value) || 0)}
                        className={`w-20 text-center text-sm ${
                          status === "low" ? "text-blue-500" : 
                          status === "high" ? "text-red-500" : "text-green-500"
                        }`}
                      />
                      <span className="text-xs text-muted-foreground w-12">{result.unit}</span>
                      <Button variant="ghost" size="sm" onClick={() => deleteResult(result.id)}>
                        <Trash2 className="w-4 h-4 text-muted-foreground" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Add Marker */}
          <div className="pt-2 border-t border-border">
            <p className="text-xs text-muted-foreground mb-2">Adicionar marcador:</p>
            <div className="flex flex-wrap gap-2">
              {commonMarkers
                .filter(m => !currentExam.results.some(r => r.marker_name === m.name))
                .slice(0, 6)
                .map((marker) => (
                  <Button
                    key={marker.name}
                    variant="outline"
                    size="sm"
                    onClick={() => addResult(currentExam.id, marker)}
                    className="text-xs"
                  >
                    + {marker.name}
                  </Button>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientExamsTab;
