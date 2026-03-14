import { ArrowLeft, Loader2, Dumbbell } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import InlineWorkoutCard from "@/components/workout/InlineWorkoutCard";

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
}

const PatientWorkout = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [program, setProgram] = useState<WorkoutProgram | null>(null);
  const [days, setDays] = useState<WorkoutDay[]>([]);

  useEffect(() => {
    fetchWorkout();
  }, []);

  const fetchWorkout = async () => {
    // Get current user's patient record
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    const { data: patient } = await supabase
      .from("patients")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (!patient) { setLoading(false); return; }

    // Get latest program
    const { data: programs } = await supabase
      .from("workout_programs")
      .select("*")
      .eq("patient_id", patient.id)
      .order("created_at", { ascending: false })
      .limit(1);

    if (!programs || programs.length === 0) {
      setLoading(false);
      return;
    }

    setProgram(programs[0]);

    // Get days with exercises
    const { data: daysData } = await supabase
      .from("workout_days")
      .select("*")
      .eq("program_id", programs[0].id)
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
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!program) {
    return (
      <div className="space-y-6 stagger-fade-in">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm">
          <ArrowLeft className="w-4 h-4" /> Voltar
        </button>
        <div className="glass-card p-8 text-center">
          <Dumbbell className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">Nenhum treino prescrito</h3>
          <p className="text-sm text-muted-foreground">Seu profissional ainda não prescreveu um programa de treinamento.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 stagger-fade-in">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm">
        <ArrowLeft className="w-4 h-4" /> Voltar
      </button>

      <div>
        <h1 className="text-2xl font-bold text-foreground">{program.name}</h1>
        {program.description && (
          <p className="text-muted-foreground text-sm mt-1">{program.description}</p>
        )}
      </div>

      {/* Workout Day Cards in Patient Mode */}
      <div className="space-y-4">
        {days.map((day, idx) => (
          <InlineWorkoutCard
            key={day.id}
            day={day}
            dayIndex={idx}
            onUpdate={fetchWorkout}
            onDelete={() => {}}
            mode="patient"
          />
        ))}
      </div>
    </div>
  );
};

export default PatientWorkout;
