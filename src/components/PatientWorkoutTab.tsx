import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Plus, Trash2, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface WorkoutExercise {
  id: string;
  name: string;
  sets: number;
  reps: string;
  rest_seconds: number | null;
  notes: string | null;
  sort_order: number;
}

interface WorkoutDay {
  id: string;
  name: string;
  sort_order: number;
  exercises: WorkoutExercise[];
}

interface WorkoutProgram {
  id: string;
  name: string;
  description: string | null;
}

interface Props {
  patientId: string;
}

const PatientWorkoutTab = ({ patientId }: Props) => {
  const [loading, setLoading] = useState(true);
  const [programs, setPrograms] = useState<WorkoutProgram[]>([]);
  const [selectedProgram, setSelectedProgram] = useState<string | null>(null);
  const [days, setDays] = useState<WorkoutDay[]>([]);
  const [activeDay, setActiveDay] = useState<string | null>(null);

  useEffect(() => {
    fetchPrograms();
  }, [patientId]);

  useEffect(() => {
    if (selectedProgram) fetchDays();
  }, [selectedProgram]);

  const fetchPrograms = async () => {
    const { data } = await supabase
      .from("workout_programs")
      .select("*")
      .eq("patient_id", patientId)
      .order("created_at", { ascending: false });
    
    setPrograms(data || []);
    if (data && data.length > 0) {
      setSelectedProgram(data[0].id);
    }
    setLoading(false);
  };

  const fetchDays = async () => {
    if (!selectedProgram) return;
    
    const { data: daysData } = await supabase
      .from("workout_days")
      .select("*")
      .eq("program_id", selectedProgram)
      .order("sort_order");

    const daysWithExercises: WorkoutDay[] = [];
    for (const day of daysData || []) {
      const { data: exercises } = await supabase
        .from("workout_exercises")
        .select("*")
        .eq("workout_day_id", day.id)
        .order("sort_order");
      
      daysWithExercises.push({ ...day, exercises: exercises || [] });
    }
    
    setDays(daysWithExercises);
    if (daysWithExercises.length > 0 && !activeDay) {
      setActiveDay(daysWithExercises[0].id);
    }
  };

  const createProgram = async () => {
    const { data, error } = await supabase
      .from("workout_programs")
      .insert({ patient_id: patientId, name: "Novo Treino" })
      .select("id")
      .single();

    if (error) {
      toast.error("Erro ao criar programa");
      return;
    }

    toast.success("Programa criado!");
    fetchPrograms();
    setSelectedProgram(data.id);
  };

  const addDay = async () => {
    if (!selectedProgram) return;
    
    const dayNames = ["Treino A", "Treino B", "Treino C", "Treino D", "Treino E", "Treino F"];
    const nextName = dayNames[days.length] || `Treino ${days.length + 1}`;
    
    const { data, error } = await supabase
      .from("workout_days")
      .insert({ program_id: selectedProgram, name: nextName, sort_order: days.length })
      .select("id")
      .single();

    if (error) {
      toast.error("Erro ao adicionar dia");
      return;
    }

    toast.success("Dia adicionado!");
    fetchDays();
    setActiveDay(data.id);
  };

  const addExercise = async (dayId: string) => {
    const day = days.find(d => d.id === dayId);
    if (!day) return;

    const { error } = await supabase
      .from("workout_exercises")
      .insert({
        workout_day_id: dayId,
        name: "Novo Exercício",
        sets: 3,
        reps: "10-12",
        sort_order: day.exercises.length
      });

    if (error) {
      toast.error("Erro ao adicionar exercício");
      return;
    }

    fetchDays();
  };

  const updateExercise = async (exerciseId: string, field: string, value: string | number) => {
    await supabase
      .from("workout_exercises")
      .update({ [field]: value })
      .eq("id", exerciseId);
    
    fetchDays();
  };

  const deleteExercise = async (exerciseId: string) => {
    await supabase.from("workout_exercises").delete().eq("id", exerciseId);
    fetchDays();
  };

  const deleteDay = async (dayId: string) => {
    await supabase.from("workout_days").delete().eq("id", dayId);
    setActiveDay(null);
    fetchDays();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (programs.length === 0) {
    return (
      <div className="glass-card p-6 text-center">
        <h2 className="text-lg font-bold text-foreground mb-2">Nenhum programa de treino</h2>
        <p className="text-sm text-muted-foreground mb-4">Crie o primeiro programa de treino para este paciente.</p>
        <Button onClick={createProgram}>
          <Plus className="w-4 h-4 mr-2" /> Criar Programa
        </Button>
      </div>
    );
  }

  const currentDay = days.find(d => d.id === activeDay);

  return (
    <div className="space-y-4">
      {/* Program Selector */}
      {programs.length > 1 && (
        <div className="glass-card p-4">
          <select
            value={selectedProgram || ""}
            onChange={(e) => setSelectedProgram(e.target.value)}
            className="w-full bg-secondary/50 rounded-lg px-3 py-2 text-sm"
          >
            {programs.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
      )}

      {/* Day Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {days.map((day) => (
          <button
            key={day.id}
            onClick={() => setActiveDay(day.id)}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
              activeDay === day.id
                ? "bg-primary text-primary-foreground"
                : "bg-secondary/50 text-muted-foreground hover:text-foreground"
            }`}
          >
            {day.name}
          </button>
        ))}
        <Button variant="outline" size="sm" onClick={addDay} className="whitespace-nowrap">
          <Plus className="w-4 h-4 mr-1" /> Dia
        </Button>
      </div>

      {/* Exercises */}
      {currentDay && (
        <div className="glass-card p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-foreground">{currentDay.name}</h3>
            <Button variant="ghost" size="sm" onClick={() => deleteDay(currentDay.id)} className="text-destructive">
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>

          {currentDay.exercises.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">Nenhum exercício adicionado.</p>
          ) : (
            <div className="space-y-2">
              {currentDay.exercises.map((ex) => (
                <div key={ex.id} className="flex items-center gap-2 bg-secondary/30 rounded-xl p-3">
                  <GripVertical className="w-4 h-4 text-muted-foreground" />
                  <Input
                    value={ex.name}
                    onChange={(e) => updateExercise(ex.id, "name", e.target.value)}
                    className="flex-1 bg-transparent border-0 p-0 h-auto text-sm font-medium"
                    placeholder="Nome do exercício"
                  />
                  <Input
                    value={ex.sets}
                    onChange={(e) => updateExercise(ex.id, "sets", parseInt(e.target.value) || 0)}
                    className="w-12 bg-secondary/50 text-center text-sm"
                    placeholder="Séries"
                  />
                  <span className="text-muted-foreground text-sm">x</span>
                  <Input
                    value={ex.reps}
                    onChange={(e) => updateExercise(ex.id, "reps", e.target.value)}
                    className="w-16 bg-secondary/50 text-center text-sm"
                    placeholder="Reps"
                  />
                  <Button variant="ghost" size="sm" onClick={() => deleteExercise(ex.id)}>
                    <Trash2 className="w-4 h-4 text-muted-foreground" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          <Button variant="outline" size="sm" onClick={() => addExercise(currentDay.id)} className="w-full">
            <Plus className="w-4 h-4 mr-2" /> Adicionar Exercício
          </Button>
        </div>
      )}
    </div>
  );
};

export default PatientWorkoutTab;
