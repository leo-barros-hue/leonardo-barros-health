import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Plus, Dumbbell, BarChart3, GripVertical } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import ExerciseAutocomplete from "./ExerciseAutocomplete";
import TechniqueAutocomplete from "./TechniqueAutocomplete";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

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
  reps_s1: number | null;
  reps_s2: number | null;
  reps_s3: number | null;
  reps_s4: number | null;
  reps_s5: number | null;
  reps_s6: number | null;
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

interface TechniqueCatalogItem {
  id: string;
  name: string;
  description: string;
}

interface InlineWorkoutCardProps {
  day: WorkoutDay;
  dayIndex: number;
  onUpdate: () => void;
  onDelete: () => void;
  mode?: "admin" | "patient";
}

const SERIES_KEYS = ["load_s1", "load_s2", "load_s3", "load_s4", "load_s5", "load_s6"] as const;
const REPS_SERIES_KEYS = ["reps_s1", "reps_s2", "reps_s3", "reps_s4", "reps_s5", "reps_s6"] as const;
const EMOJI_OPTIONS = ["🐔", "💀", "💀💀", "💀💀💀", "😈"];

function calcExerciseVolume(ex: WorkoutExercise): number | null {
  const filledSets = countFilledSets(ex);
  if (filledSets === 0) return null;

  let totalVolume = 0;
  for (let i = 0; i < 6; i++) {
    const repsVal = ex[REPS_SERIES_KEYS[i]];
    const loadVal = ex[SERIES_KEYS[i]];
    if (repsVal == null || !loadVal || loadVal.trim() === "") continue;
    const load = parseFloat(loadVal);
    if (isNaN(load)) continue;
    totalVolume += repsVal * load;
  }
  return totalVolume > 0 ? totalVolume : null;
}

function countFilledSets(ex: WorkoutExercise): number {
  let count = 0;
  for (const key of REPS_SERIES_KEYS) {
    if (ex[key] != null && ex[key]! > 0) count++;
  }
  return count;
}

export default function InlineWorkoutCard({ day, dayIndex, onUpdate, onDelete, mode = "admin" }: InlineWorkoutCardProps) {
  const isAdmin = mode === "admin";
  const isPatient = mode === "patient";

  const [name, setName] = useState(day.name);
  const [restInterval, setRestInterval] = useState(day.rest_interval || "");
  const [exercises, setExercises] = useState<WorkoutExercise[]>(day.exercises);
  const [exerciseCatalog, setExerciseCatalog] = useState<ExerciseCatalogItem[]>([]);
  const [techniqueCatalog, setTechniqueCatalog] = useState<TechniqueCatalogItem[]>([]);
  const [newExerciseName, setNewExerciseName] = useState("");
  const [seriesEmojis, setSeriesEmojis] = useState<string[]>(["💀", "💀", "💀", "💀", "💀", "💀"]);
  const [openEmojiIdx, setOpenEmojiIdx] = useState<number | null>(null);
  const [techniqueDetail, setTechniqueDetail] = useState<TechniqueCatalogItem | null>(null);

  const nameTimeout = useRef<NodeJS.Timeout>();
  const restTimeout = useRef<NodeJS.Timeout>();

  useEffect(() => {
    setExercises(day.exercises);
    setName(day.name);
    setRestInterval(day.rest_interval || "");
  }, [day]);

  useEffect(() => {
    const fetchCatalogs = async () => {
      const [exRes, techRes] = await Promise.all([
        supabase.from("exercise_catalog").select("id, name, muscle_group").order("name"),
        supabase.from("technique_catalog").select("id, name, description").order("name"),
      ]);
      setExerciseCatalog((exRes.data as ExerciseCatalogItem[]) || []);
      setTechniqueCatalog((techRes.data as TechniqueCatalogItem[]) || []);
    };
    fetchCatalogs();
  }, []);

  const debounceUpdate = (ref: React.MutableRefObject<NodeJS.Timeout | undefined>, field: Record<string, any>) => {
    if (ref.current) clearTimeout(ref.current);
    ref.current = setTimeout(async () => {
      await supabase.from("workout_days").update(field as any).eq("id", day.id);
    }, 500);
  };

  const handleNameChange = (v: string) => { setName(v); debounceUpdate(nameTimeout, { name: v }); };
  const handleRestIntervalChange = (v: string) => { setRestInterval(v); debounceUpdate(restTimeout, { rest_interval: v || null }); };

  const handleFieldChange = (exerciseId: string, field: string, value: any) => {
    setExercises((prev) => prev.map((ex) => (ex.id === exerciseId ? { ...ex, [field]: value } : ex)));
  };

  const handleFieldBlur = async (exerciseId: string, field: string, value: any) => {
    await supabase.from("workout_exercises").update({ [field]: value } as any).eq("id", exerciseId);
  };

  const handleRepsSeriesChange = (exerciseId: string, key: string, rawValue: string) => {
    const cleaned = rawValue.replace(/[^0-9]/g, "");
    const numValue = cleaned === "" ? null : Math.min(parseInt(cleaned), 100);
    handleFieldChange(exerciseId, key, numValue);

    // Auto-update sets count
    setExercises((prev) => {
      const ex = prev.find((e) => e.id === exerciseId);
      if (!ex) return prev;
      const updated = { ...ex, [key]: numValue };
      const filledCount = countFilledSets(updated);
      return prev.map((e) => e.id === exerciseId ? { ...updated, sets: filledCount } : e);
    });
  };

  const handleRepsSeriesBlur = async (exerciseId: string, key: string, rawValue: string) => {
    const cleaned = rawValue.replace(/[^0-9]/g, "");
    const numValue = cleaned === "" ? null : Math.min(parseInt(cleaned), 100);
    
    // Calculate sets count from current state
    const ex = exercises.find((e) => e.id === exerciseId);
    if (!ex) return;
    const updated = { ...ex, [key]: numValue };
    const filledCount = countFilledSets(updated);

    await supabase.from("workout_exercises").update({ 
      [key]: numValue, 
      sets: filledCount 
    } as any).eq("id", exerciseId);
  };

  const handleEmojiSelect = (colIdx: number, emoji: string) => {
    setSeriesEmojis((prev) => prev.map((e, i) => (i === colIdx ? emoji : e)));
    setOpenEmojiIdx(null);
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
        sets: 0,
        reps: "",
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
      reps_s1: null, reps_s2: null, reps_s3: null,
      reps_s4: null, reps_s5: null, reps_s6: null,
    };
    setExercises((prev) => [...prev, newEx]);
    setNewExerciseName("");
  };

  // Volume calculation
  const exerciseVolumes = exercises.map((ex) => calcExerciseVolume(ex));
  const allVolumesFilled = exerciseVolumes.every((v) => v !== null) && exercises.length > 0;
  const totalVolume = allVolumesFilled ? exerciseVolumes.reduce((sum, v) => sum! + v!, 0) : null;

  // Grid: DragHandle(admin) | Exercício | Séries | S1-S6 | Obs | Técnica | Action
  const gridCols = isPatient
    ? "1fr 50px 65px 65px 65px 65px 65px 65px 1fr 110px 70px"
    : "28px 1fr 50px 65px 65px 65px 65px 65px 65px 1fr 110px 40px";

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = exercises.findIndex((e) => e.id === active.id);
    const newIndex = exercises.findIndex((e) => e.id === over.id);
    const reordered = arrayMove(exercises, oldIndex, newIndex);
    setExercises(reordered);

    // Persist new sort_order
    const updates = reordered.map((ex, idx) =>
      supabase.from("workout_exercises").update({ sort_order: idx } as any).eq("id", ex.id)
    );
    await Promise.all(updates);
  };

  return (
    <div className="glass-card overflow-visible">
      {/* Header */}
      <div className="bg-muted/50 px-4 py-3 flex items-center gap-3">
        <Dumbbell className="w-4 h-4 text-primary" />
        <span className="text-sm font-bold text-foreground whitespace-nowrap">TREINO {dayIndex + 1}</span>
        <span className="text-sm text-muted-foreground">(</span>
        {isAdmin ? (
          <Input
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            placeholder="Nome do treino"
            className="flex-1 h-7 text-sm font-semibold bg-secondary/80 border-0 px-2"
          />
        ) : (
          <span className="flex-1 text-sm font-semibold text-foreground">{name}</span>
        )}
        <span className="text-sm text-muted-foreground">)</span>
        {isAdmin && (
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive ml-auto" onClick={onDelete}>
            <Trash2 className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Sub-header */}
      <div className="bg-muted/30 px-4 py-2 flex items-center gap-1.5 text-xs">
        <span className="font-medium text-muted-foreground">Intervalo entre as séries:</span>
        {isAdmin ? (
          <Input
            value={restInterval}
            onChange={(e) => handleRestIntervalChange(e.target.value)}
            placeholder="60s"
            className="w-24 h-6 text-xs bg-secondary/80 border-0 px-2"
          />
        ) : (
          <span className="text-foreground font-semibold">{restInterval || "60s"}</span>
        )}
      </div>

      {/* Table Header */}
      <div className="bg-muted/20 px-4 py-2 grid gap-1 items-end" style={{ gridTemplateColumns: gridCols }}>
        {isAdmin && <div />}
        <div className="text-[10px] font-bold uppercase text-muted-foreground">Exercícios</div>
        <div className="text-[10px] font-bold uppercase text-muted-foreground text-center">Séries</div>
        {[1, 2, 3, 4, 5, 6].map((n, colIdx) => (
          <div key={n} className="flex flex-col items-center gap-0.5 relative">
            {isAdmin && (
              <button
                type="button"
                className="text-lg cursor-pointer hover:scale-110 transition-transform"
                onClick={() => setOpenEmojiIdx(openEmojiIdx === colIdx ? null : colIdx)}
              >
                {seriesEmojis[colIdx]}
              </button>
            )}
            {isAdmin && openEmojiIdx === colIdx && (
              <div className="absolute top-full mt-1 z-50 bg-popover border border-border rounded-lg shadow-lg p-1.5 flex gap-1">
                {EMOJI_OPTIONS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    className={`text-lg p-1 rounded hover:bg-accent transition-colors ${seriesEmojis[colIdx] === emoji ? 'bg-accent' : ''}`}
                    onClick={() => handleEmojiSelect(colIdx, emoji)}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}
            <span className="text-[9px] text-muted-foreground font-medium">{n}° SÉRIE</span>
          </div>
        ))}
        <div className="text-[10px] font-bold uppercase text-muted-foreground text-center">Observações</div>
        <div className="text-[10px] font-bold uppercase text-muted-foreground text-center">Técnica</div>
        <div className="text-[10px] font-bold uppercase text-muted-foreground text-center">
          {isPatient ? "Vol." : ""}
        </div>
      </div>

      {/* Exercise Rows */}
      <div className="divide-y divide-border/50">
        {isAdmin ? (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={exercises.map((e) => e.id)} strategy={verticalListSortingStrategy}>
              {exercises.map((ex) => (
                <SortableExerciseRow
                  key={ex.id}
                  ex={ex}
                  gridCols={gridCols}
                  isAdmin={isAdmin}
                  isPatient={isPatient}
                  handleRepsSeriesChange={handleRepsSeriesChange}
                  handleRepsSeriesBlur={handleRepsSeriesBlur}
                  handleFieldChange={handleFieldChange}
                  handleFieldBlur={handleFieldBlur}
                  handleDeleteExercise={handleDeleteExercise}
                  techniqueCatalog={techniqueCatalog}
                  setTechniqueDetail={setTechniqueDetail}
                />
              ))}
            </SortableContext>
          </DndContext>
        ) : (
          exercises.map((ex) => {
            const exVolume = calcExerciseVolume(ex);
            const filledSets = countFilledSets(ex);
            return (
              <div key={ex.id} className="px-4 py-1.5 grid gap-1 items-start min-w-0" style={{ gridTemplateColumns: gridCols }}>
                <div className="min-w-0 px-1 py-1">
                  <span className="text-sm font-medium break-words whitespace-normal leading-snug">{ex.name}</span>
                </div>
                <div className="flex items-center justify-center py-1">
                  <span className="text-xs font-semibold text-foreground">{filledSets}</span>
                </div>
                {REPS_SERIES_KEYS.map((repsKey, idx) => {
                  const loadKey = SERIES_KEYS[idx];
                  const repsVal = ex[repsKey];
                  const isFilled = repsVal != null && repsVal > 0;
                  return (
                    <div key={repsKey} className="py-1">
                      <div className="flex flex-col gap-0.5">
                        {isFilled && (
                          <span className="text-[9px] text-muted-foreground text-center block">{repsVal} reps</span>
                        )}
                        {isFilled ? (
                          <Input
                            type="text"
                            inputMode="decimal"
                            className="h-7 text-xs text-center border-0 bg-secondary/30 px-0 focus-visible:ring-1 focus-visible:ring-primary/30 rounded"
                            placeholder="kg"
                            value={(ex[loadKey] as string) || ""}
                            onChange={(e) => handleFieldChange(ex.id, loadKey, e.target.value || null)}
                            onBlur={(e) => handleFieldBlur(ex.id, loadKey, e.target.value || null)}
                          />
                        ) : (
                          <div className="h-7" />
                        )}
                      </div>
                    </div>
                  );
                })}
                <div className="py-1">
                  <span className="text-xs text-muted-foreground break-words whitespace-normal leading-snug block px-1 py-1">
                    {ex.notes || "—"}
                  </span>
                </div>
                <div className="py-1">
                  {ex.technique ? (
                    <button
                      type="button"
                      className="text-xs text-primary font-medium hover:underline cursor-pointer truncate block w-full text-center"
                      onClick={() => {
                        const tech = techniqueCatalog.find((t) => t.name === ex.technique);
                        if (tech) setTechniqueDetail(tech);
                      }}
                    >
                      {ex.technique}
                    </button>
                  ) : (
                    <span className="text-xs text-muted-foreground text-center block">—</span>
                  )}
                </div>
                <div className="flex items-center justify-center py-1">
                  <span className={`text-xs font-semibold ${exVolume !== null ? "text-primary" : "text-muted-foreground/40"}`}>
                    {exVolume !== null ? `${exVolume.toLocaleString("pt-BR")}` : "—"}
                  </span>
                </div>
              </div>
            );
          })
        )}

        {/* Add Exercise Row (admin only) */}
        {isAdmin && (
          <div className="px-4 py-2 grid gap-1 items-center bg-secondary/20" style={{ gridTemplateColumns: gridCols }}>
            <div />
            <div>
              <ExerciseAutocomplete
                value={newExerciseName}
                onChange={setNewExerciseName}
                onSelect={(catalogEx) => handleAddExercise(catalogEx.name)}
                exerciseCatalog={exerciseCatalog}
                placeholder="Adicionar exercício..."
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddExercise(newExerciseName);
                  }
                }}
              />
            </div>
            <div className="col-span-9"></div>
            <div></div>
          </div>
        )}
      </div>

      {/* Footer */}
      {isAdmin && (
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
      )}

      {/* Volume Summary (patient mode) */}
      {isPatient && (
        <div className="px-4 py-3 border-t border-border/50">
          {totalVolume !== null ? (
            <div className="flex items-center gap-3">
              <BarChart3 className="w-4 h-4 text-primary" />
              <div>
                <span className="text-sm font-bold text-foreground">Volume total da sessão: </span>
                <span className="text-sm font-bold text-primary">{totalVolume.toLocaleString("pt-BR")} kg</span>
              </div>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground italic">
              Preencha os pesos das séries para calcular o volume do treino.
            </p>
          )}
        </div>
      )}

      {/* Technique Detail Dialog */}
      <Dialog open={!!techniqueDetail} onOpenChange={(o) => !o && setTechniqueDetail(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{techniqueDetail?.name}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">
            {techniqueDetail?.description || "Sem descrição disponível."}
          </p>
        </DialogContent>
      </Dialog>
    </div>
  );
}
