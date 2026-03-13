import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Plus, Trash2, Pencil, Dumbbell, Copy, Save, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import WorkoutProgramDialog from "@/components/workout/WorkoutProgramDialog";
import InlineWorkoutCard from "@/components/workout/InlineWorkoutCard";
import WorkoutHistoryPanel from "@/components/workout/WorkoutHistoryPanel";

interface WorkoutExercise {
  id: string;
  name: string;
  sets: number;
  reps: string;
  rest_seconds: number | null;
  notes: string | null;
  sort_order: number;
  technique: string | null;
  load_s1: string | null;
  load_s2: string | null;
  load_s3: string | null;
  load_s4: string | null;
  load_s5: string | null;
  load_s6: string | null;
}

interface WorkoutDay {
  id: string;
  name: string;
  sort_order: number;
  rep_range: string | null;
  rest_interval: string | null;
  exercises: WorkoutExercise[];
}

interface WorkoutProgram {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
}

interface Props {
  patientId: string;
}

const PatientWorkoutTab = ({ patientId }: Props) => {
  const [loading, setLoading] = useState(true);
  const [programs, setPrograms] = useState<WorkoutProgram[]>([]);
  const [selectedProgram, setSelectedProgram] = useState<WorkoutProgram | null>(null);
  const [days, setDays] = useState<WorkoutDay[]>([]);

  const [programDialogOpen, setProgramDialogOpen] = useState(false);
  const [editingProgram, setEditingProgram] = useState<WorkoutProgram | null>(null);

  useEffect(() => {
    fetchPrograms();
  }, [patientId]);

  useEffect(() => {
    if (selectedProgram) fetchDays(selectedProgram.id);
  }, [selectedProgram?.id]);

  const fetchPrograms = async () => {
    const { data } = await supabase
      .from("workout_programs")
      .select("*")
      .eq("patient_id", patientId)
      .order("created_at", { ascending: false });

    setPrograms(data || []);
    if (data && data.length > 0) {
      setSelectedProgram(data[0]);
    } else {
      setSelectedProgram(null);
      setDays([]);
    }
    setLoading(false);
  };

  const fetchDays = async (programId: string) => {
    const { data: daysData } = await supabase
      .from("workout_days")
      .select("*")
      .eq("program_id", programId)
      .order("sort_order");

    const daysWithExercises: WorkoutDay[] = [];
    for (const day of daysData || []) {
      const { data: exercises } = await supabase
        .from("workout_exercises")
        .select("*")
        .eq("workout_day_id", day.id)
        .order("sort_order");

      daysWithExercises.push({
        ...day,
        rep_range: (day as any).rep_range ?? null,
        rest_interval: (day as any).rest_interval ?? null,
        exercises: (exercises || []).map((ex: any) => ({
          ...ex,
          technique: ex.technique ?? null,
          load_s1: ex.load_s1 ?? null,
          load_s2: ex.load_s2 ?? null,
          load_s3: ex.load_s3 ?? null,
          load_s4: ex.load_s4 ?? null,
          load_s5: ex.load_s5 ?? null,
          load_s6: ex.load_s6 ?? null,
        })),
      });
    }

    setDays(daysWithExercises);
  };

  const handleSelectProgram = (program: WorkoutProgram) => {
    setSelectedProgram(program);
  };

  const handleDeleteProgram = async (programId: string) => {
    if (!confirm("Excluir este programa de treino?")) return;
    const { error } = await supabase.from("workout_programs").delete().eq("id", programId);
    if (error) {
      toast.error("Erro ao excluir programa");
    } else {
      toast.success("Programa excluído");
      fetchPrograms();
    }
  };

  const handleDeleteDay = async (dayId: string) => {
    if (!confirm("Excluir este treino?")) return;
    const { error } = await supabase.from("workout_days").delete().eq("id", dayId);
    if (error) {
      toast.error("Erro ao excluir treino");
    } else {
      toast.success("Treino excluído");
      if (selectedProgram) fetchDays(selectedProgram.id);
    }
  };

  const handleAddDay = async () => {
    if (!selectedProgram) return;

    const { data: maxOrder } = await supabase
      .from("workout_days")
      .select("sort_order")
      .eq("program_id", selectedProgram.id)
      .order("sort_order", { ascending: false })
      .limit(1);

    const newOrder = maxOrder && maxOrder.length > 0 ? maxOrder[0].sort_order + 1 : 0;
    const dayLetter = String.fromCharCode(65 + newOrder); // A, B, C...

    const { error } = await supabase
      .from("workout_days")
      .insert({
        name: `Treino ${dayLetter}`,
        program_id: selectedProgram.id,
        sort_order: newOrder,
      } as any);

    if (error) {
      toast.error("Erro ao adicionar treino");
    } else {
      toast.success("Treino adicionado");
      fetchDays(selectedProgram.id);
    }
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
        <h2 className="text-lg font-bold text-foreground">Treinos</h2>
        <Button onClick={() => { setEditingProgram(null); setProgramDialogOpen(true); }} className="gap-2">
          <Plus className="w-4 h-4" />
          Novo Programa
        </Button>
      </div>

      {programs.length === 0 ? (
        <div className="glass-card p-8 text-center">
          <Dumbbell className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">Nenhum programa de treino</h3>
          <p className="text-sm text-muted-foreground">Clique em "Novo Programa" para começar.</p>
        </div>
      ) : (
        <>
          {/* Program Selector */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {programs.map((program) => (
              <button
                key={program.id}
                onClick={() => handleSelectProgram(program)}
                className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                  selectedProgram?.id === program.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary/50 text-muted-foreground hover:text-foreground"
                }`}
              >
                {program.name}
              </button>
            ))}
          </div>

          {selectedProgram && (
            <>
              {/* Program Header */}
              <div className="glass-card p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-foreground">{selectedProgram.name}</h2>
                    {selectedProgram.description && (
                      <p className="text-sm text-muted-foreground">{selectedProgram.description}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => { setEditingProgram(selectedProgram); setProgramDialogOpen(true); }}>
                      <Pencil className="w-4 h-4 mr-1" /> Editar
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDeleteProgram(selectedProgram.id)}>
                      <Trash2 className="w-4 h-4 mr-1" /> Excluir
                    </Button>
                  </div>
                </div>
              </div>

              {/* Inline Workout Day Cards */}
              <div className="space-y-4">
                {days.map((day, idx) => (
                  <InlineWorkoutCard
                    key={day.id}
                    day={day}
                    dayIndex={idx}
                    onUpdate={() => fetchDays(selectedProgram.id)}
                    onDelete={() => handleDeleteDay(day.id)}
                  />
                ))}
              </div>

              {/* Add Day Button */}
              <Button variant="outline" onClick={handleAddDay} className="gap-2 w-full">
                <Plus className="w-4 h-4" />
                Adicionar Treino
              </Button>
            </>
          )}
        </>
      )}

      {/* Program Dialog */}
      <WorkoutProgramDialog
        open={programDialogOpen}
        onOpenChange={setProgramDialogOpen}
        patientId={patientId}
        program={editingProgram}
        onSuccess={fetchPrograms}
      />
    </div>
  );
};

export default PatientWorkoutTab;
