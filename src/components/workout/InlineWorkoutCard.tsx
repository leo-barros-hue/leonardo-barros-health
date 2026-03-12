import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Plus, Dumbbell } from "lucide-react";
import { toast } from "sonner";
import ExerciseAutocomplete from "./ExerciseAutocomplete";

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

interface ExerciseCatalogItem {
  id: string;
  name: string;
  muscle_group: string;
}

interface InlineWorkoutCardProps {
  day: WorkoutDay;
  dayIndex: number;
  onUpdate: () => void;
  onDelete: () => void;
}

const SERIES_KEYS = ["load_s1", "load_s2", "load_s3", "load_s4", "load_s5", "load_s6"] as const;

export default function InlineWorkoutCard({ day, dayIndex, onUpdate, onDelete }: InlineWorkoutCardProps) {
  const [name, setName] = useState(day.name);
  const [repRange, setRepRange] = useState(day.rep_range || "");
  const [restInterval, setRestInterval] = useState(day.rest_interval || "");
  const [exercises, setExercises] = useState<WorkoutExercise[]>(day.exercises);
  const [exerciseCatalog, setExerciseCatalog] = useState<ExerciseCatalogItem[]>([]);
  const [newExerciseName, setNewExerciseName] = useState("");

  const nameTimeout = useRef<NodeJS.Timeout>();
  const repTimeout = useRef<NodeJS.Timeout>();
  const restTimeout = useRef<NodeJS.Timeout>();

  useEffect(() => {
    setExercises(day.exercises);
    setName(day.name);
    setRepRange(day.rep_range || "");
    setRestInterval(day.rest_interval || "");
  }, [day]);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from("exercise_catalog")
        .select("id, name, muscle_group")
        .order("name");
      setExerciseCatalog((data as ExerciseCatalogItem[]) || []);
    };
    fetch();
  }, []);

  const debounceUpdate = (ref: React.MutableRefObject<NodeJS.Timeout | undefined>, field: Record<string, any>) => {
    if (ref.current) clearTimeout(ref.current);
    ref.current = setTimeout(async () => {
      await supabase.from("workout_days").update(field as any).eq("id", day.id);
    }, 500);
  };

  const handleNameChange = (v: string) => { setName(v); debounceUpdate(nameTimeout, { name: v }); };
  const handleRepRangeChange = (v: string) => { setRepRange(v); debounceUpdate(repTimeout, { rep_range: v || null }); };
  const handleRestIntervalChange = (v: string) => { setRestInterval(v); debounceUpdate(restTimeout, { rest_interval: v || null }); };

  const handleLoadChange = (exerciseId: string, key: string, value: string) => {
    setExercises((prev) => prev.map((ex) => (ex.id === exerciseId ? { ...ex, [key]: value || null } : ex)));
  };

  const handleLoadBlur = async (exerciseId: string, key: string, value: string) => {
    await supabase.from("workout_exercises").update({ [key]: value || null } as any).eq("id", exerciseId);
  };

  const handleTechniqueChange = (exerciseId: string, value: string) => {
    setExercises((prev) => prev.map((ex) => (ex.id === exerciseId ? { ...ex, technique: value || null } : ex)));
  };

  const handleTechniqueBlur = async (exerciseId: string, value: string) => {
    await supabase.from("workout_exercises").update({ technique: value || null } as any).eq("id", exerciseId);
  };

  const handleDeleteExercise = async (exerciseId: string) => {
    const { error } = await supabase.from("workout_exercises").delete().eq("id", exerciseId);
    if (error) { toast.error("Erro ao excluir exercício"); return; }
    setExercises((prev) => prev.filter((ex) => ex.id !== exerciseId));
  };

  const handleAddExercise = async (exerciseName: string) => {
    if (!exerciseName.trim()) return;

    const { data: maxOrder } = await supabase
      .from("workout_exercises")
      .select("sort_order")
      .eq("workout_day_id", day.id)
      .order("sort_order", { ascending: false })
      .limit(1);

    const newOrder = maxOrder && maxOrder.length > 0 ? maxOrder[0].sort_order + 1 : 0;

    const { data, error } = await supabase
      .from("workout_exercises")
      .insert({
        workout_day_id: day.id,
        name: exerciseName.trim(),
        sets: 3,
        reps: "10-12",
        rest_seconds: 60,
        sort_order: newOrder,
      } as any)
      .select("*")
      .single();

    if (error) { toast.error("Erro ao adicionar exercício"); return; }

    const newEx: WorkoutExercise = {
      ...(data as any),
      technique: null,
      load_s1: null, load_s2: null, load_s3: null,
      load_s4: null, load_s5: null, load_s6: null,
    };
    setExercises((prev) => [...prev, newEx]);
    setNewExerciseName("");
  };

  const gridCols = "1fr 65px 65px 65px 65px 65px 65px 110px 40px";

  return (
    <div className="glass-card overflow-hidden">
      {/* Header */}
      <div className="bg-muted/50 px-4 py-3 flex items-center gap-3">
        <Dumbbell className="w-4 h-4 text-primary" />
        <span className="text-xs font-semibold text-muted-foreground">TREINO {dayIndex + 1}:</span>
        <Input
          value={name}
          onChange={(e) => handleNameChange(e.target.value)}
          placeholder="Nome do treino"
          className="flex-1 h-7 text-xs font-semibold uppercase bg-secondary/80 border-0"
        />
        <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive" onClick={onDelete}>
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>

      {/* Sub-header */}
      <div className="bg-muted/30 px-4 py-2 flex items-center gap-4 text-xs">
        <div className="flex items-center gap-1.5">
          <span className="font-medium text-muted-foreground">Faixa de repetições:</span>
          <Input value={repRange} onChange={(e) => handleRepRangeChange(e.target.value)} placeholder="10-12" className="w-20 h-6 text-xs bg-secondary/80 border-0 px-2" />
        </div>
        <div className="flex items-center gap-1.5">
          <span className="font-medium text-muted-foreground">Intervalo entre as séries:</span>
          <Input value={restInterval} onChange={(e) => handleRestIntervalChange(e.target.value)} placeholder="60s" className="w-20 h-6 text-xs bg-secondary/80 border-0 px-2" />
        </div>
      </div>

      {/* Table Header */}
      <div className="bg-muted/20 px-4 py-2 grid gap-1 text-[10px] font-medium uppercase" style={{ gridTemplateColumns: gridCols }}>
        <div className="text-muted-foreground">Exercício</div>
        <div className="text-muted-foreground text-center">Série 1</div>
        <div className="text-muted-foreground text-center">Série 2</div>
        <div className="text-muted-foreground text-center">Série 3</div>
        <div className="text-muted-foreground text-center">Série 4</div>
        <div className="text-muted-foreground text-center">Série 5</div>
        <div className="text-muted-foreground text-center">Série 6</div>
        <div className="text-muted-foreground text-center">Técnica</div>
        <div></div>
      </div>

      {/* Exercise Rows */}
      <div className="divide-y divide-border/50">
        {exercises.map((ex) => (
          <div key={ex.id} className="px-4 py-2 grid gap-1 items-center" style={{ gridTemplateColumns: gridCols }}>
            <div>
              <p className="text-sm font-medium text-foreground truncate">{ex.name}</p>
              {ex.notes && <p className="text-[10px] text-muted-foreground truncate">{ex.notes}</p>}
            </div>
            {SERIES_KEYS.map((key) => (
              <div key={key}>
                <Input
                  type="text"
                  inputMode="decimal"
                  className="h-8 text-xs text-center border-0 bg-transparent px-0 focus-visible:ring-1 focus-visible:ring-primary/30"
                  placeholder="—"
                  value={(ex[key] as string) || ""}
                  onChange={(e) => handleLoadChange(ex.id, key, e.target.value)}
                  onBlur={(e) => handleLoadBlur(ex.id, key, e.target.value)}
                />
              </div>
            ))}
            <div>
              <Input
                type="text"
                className="h-8 text-xs text-center border-0 bg-transparent px-0 focus-visible:ring-1 focus-visible:ring-primary/30"
                placeholder="—"
                value={ex.technique || ""}
                onChange={(e) => handleTechniqueChange(ex.id, e.target.value)}
                onBlur={(e) => handleTechniqueBlur(ex.id, e.target.value)}
              />
            </div>
            <div className="flex justify-center">
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive" onClick={() => handleDeleteExercise(ex.id)}>
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          </div>
        ))}

        {/* Add Exercise Row (inline) */}
        <div className="px-4 py-2 grid gap-1 items-center bg-secondary/20" style={{ gridTemplateColumns: gridCols }}>
          <div>
            <ExerciseAutocomplete
              value={newExerciseName}
              onChange={setNewExerciseName}
              onSelect={(catalogEx) => {
                handleAddExercise(catalogEx.name);
              }}
              exerciseCatalog={exerciseCatalog}
              placeholder="Digite o exercício..."
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddExercise(newExerciseName);
                }
              }}
            />
          </div>
          <div className="col-span-7"></div>
          <div></div>
        </div>
      </div>

      {/* Add Exercise Button */}
      <div className="px-4 py-2 border-t border-border/50">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleAddExercise(newExerciseName)}
          disabled={!newExerciseName.trim()}
          className="text-primary gap-1 h-7 px-2"
        >
          <Plus className="w-3 h-3" />
          Adicionar exercício
        </Button>
      </div>
    </div>
  );
}
