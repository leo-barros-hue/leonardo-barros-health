import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Plus, Trash2, Pencil, Dumbbell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import WorkoutProgramDialog from "@/components/workout/WorkoutProgramDialog";
import WorkoutDayDialog from "@/components/workout/WorkoutDayDialog";
import ExerciseDialog from "@/components/workout/ExerciseDialog";

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

const SERIES_COLUMNS = [1, 2, 3, 4, 5, 6] as const;

const PatientWorkoutTab = ({ patientId }: Props) => {
  const [loading, setLoading] = useState(true);
  const [programs, setPrograms] = useState<WorkoutProgram[]>([]);
  const [selectedProgram, setSelectedProgram] = useState<WorkoutProgram | null>(null);
  const [days, setDays] = useState<WorkoutDay[]>([]);
  const [activeDay, setActiveDay] = useState<WorkoutDay | null>(null);

  const [programDialogOpen, setProgramDialogOpen] = useState(false);
  const [editingProgram, setEditingProgram] = useState<WorkoutProgram | null>(null);
  const [dayDialogOpen, setDayDialogOpen] = useState(false);
  const [editingDay, setEditingDay] = useState<WorkoutDay | null>(null);
  const [exerciseDialogOpen, setExerciseDialogOpen] = useState(false);
  const [editingExercise, setEditingExercise] = useState<WorkoutExercise | null>(null);

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
      setActiveDay(null);
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
    if (daysWithExercises.length > 0) {
      setActiveDay(daysWithExercises[0]);
    } else {
      setActiveDay(null);
    }
  };

  const handleSelectProgram = (program: WorkoutProgram) => {
    setSelectedProgram(program);
    setActiveDay(null);
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
      setActiveDay(null);
      if (selectedProgram) fetchDays(selectedProgram.id);
    }
  };

  const handleDeleteExercise = async (exerciseId: string) => {
    if (!confirm("Excluir este exercício?")) return;
    const { error } = await supabase.from("workout_exercises").delete().eq("id", exerciseId);
    if (error) {
      toast.error("Erro ao excluir exercício");
    } else {
      toast.success("Exercício excluído");
      if (selectedProgram) fetchDays(selectedProgram.id);
    }
  };

  const handleLoadChange = async (exerciseId: string, seriesKey: string, value: string) => {
    // Update local state immediately
    setActiveDay((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        exercises: prev.exercises.map((ex) =>
          ex.id === exerciseId ? { ...ex, [seriesKey]: value || null } : ex
        ),
      };
    });
  };

  const handleLoadBlur = async (exerciseId: string, seriesKey: string, value: string) => {
    const { error } = await supabase
      .from("workout_exercises")
      .update({ [seriesKey]: value || null } as any)
      .eq("id", exerciseId);
    if (error) {
      toast.error("Erro ao salvar carga");
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
              <div className="glass-card p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
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

              {/* Day Tabs */}
              <div className="flex gap-2 overflow-x-auto pb-2">
                {days.map((day) => (
                  <button
                    key={day.id}
                    onClick={() => setActiveDay(day)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                      activeDay?.id === day.id
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary/50 text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {day.name}
                  </button>
                ))}
                <Button variant="outline" size="sm" onClick={() => { setEditingDay(null); setDayDialogOpen(true); }} className="whitespace-nowrap">
                  <Plus className="w-4 h-4 mr-1" /> Treino
                </Button>
              </div>

              {/* Workout Day Block */}
              {activeDay && (
                <div className="glass-card p-6">
                  {/* Day Header */}
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-bold text-foreground">{activeDay.name}</h3>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" onClick={() => { setEditingDay(activeDay); setDayDialogOpen(true); }}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteDay(activeDay.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Sub-header info */}
                  <div className="flex gap-6 mb-6">
                    <p className="text-sm text-muted-foreground">
                      <span className="font-medium text-foreground">Faixa de repetições:</span>{" "}
                      {activeDay.rep_range || "—"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      <span className="font-medium text-foreground">Intervalo entre as séries:</span>{" "}
                      {activeDay.rest_interval || "—"}
                    </p>
                  </div>

                  {/* Exercises Table */}
                  {activeDay.exercises.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-4 text-center">Nenhum exercício adicionado.</p>
                  ) : (
                    <div className="overflow-x-auto mb-4">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-border">
                            <th className="text-left py-2 text-muted-foreground font-medium min-w-[160px]">Exercício</th>
                            {SERIES_COLUMNS.map((s) => (
                              <th key={s} className="text-center py-2 text-muted-foreground font-medium min-w-[80px]">
                                Série {s}
                              </th>
                            ))}
                            <th className="text-center py-2 text-muted-foreground font-medium min-w-[120px]">Técnica</th>
                            <th className="w-20"></th>
                          </tr>
                        </thead>
                        <tbody>
                          {activeDay.exercises.map((ex) => (
                            <tr key={ex.id} className="border-b border-border/50 last:border-0 align-top">
                              <td className="py-3">
                                <p className="font-medium text-foreground">{ex.name}</p>
                                {ex.notes && <p className="text-xs text-muted-foreground mt-0.5">{ex.notes}</p>}
                              </td>
                              {SERIES_COLUMNS.map((s) => {
                                const key = `load_s${s}` as keyof WorkoutExercise;
                                return (
                                  <td key={s} className="py-3 px-1 text-center">
                                    <Input
                                      type="text"
                                      inputMode="decimal"
                                      className="h-8 text-center text-xs w-full"
                                      placeholder="Carga"
                                      value={(ex[key] as string) || ""}
                                      onChange={(e) => handleLoadChange(ex.id, key, e.target.value)}
                                      onBlur={(e) => handleLoadBlur(ex.id, key, e.target.value)}
                                    />
                                  </td>
                                );
                              })}
                              <td className="py-3 px-1 text-center">
                                <span className="text-xs text-foreground">{ex.technique || "—"}</span>
                              </td>
                              <td className="py-3 text-right">
                                <div className="flex justify-end gap-1">
                                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => { setEditingExercise(ex); setExerciseDialogOpen(true); }}>
                                    <Pencil className="w-3 h-3" />
                                  </Button>
                                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => handleDeleteExercise(ex.id)}>
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  <Button variant="outline" size="sm" onClick={() => { setEditingExercise(null); setExerciseDialogOpen(true); }} className="gap-1">
                    <Plus className="w-3 h-3" /> Exercício
                  </Button>
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* Dialogs */}
      <WorkoutProgramDialog
        open={programDialogOpen}
        onOpenChange={setProgramDialogOpen}
        patientId={patientId}
        program={editingProgram}
        onSuccess={fetchPrograms}
      />
      {selectedProgram && (
        <WorkoutDayDialog
          open={dayDialogOpen}
          onOpenChange={setDayDialogOpen}
          programId={selectedProgram.id}
          day={editingDay}
          onSuccess={() => fetchDays(selectedProgram.id)}
        />
      )}
      {activeDay && (
        <ExerciseDialog
          open={exerciseDialogOpen}
          onOpenChange={setExerciseDialogOpen}
          workoutDayId={activeDay.id}
          exercise={editingExercise}
          onSuccess={() => selectedProgram && fetchDays(selectedProgram.id)}
        />
      )}
    </div>
  );
};

export default PatientWorkoutTab;
