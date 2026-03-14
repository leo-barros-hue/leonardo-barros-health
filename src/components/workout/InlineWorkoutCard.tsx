import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Plus, Dumbbell, BarChart3 } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import ExerciseAutocomplete from "./ExerciseAutocomplete";
import TechniqueAutocomplete from "./TechniqueAutocomplete";

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
const EMOJI_OPTIONS = ["🐔", "💀", "💀💀", "💀💀💀", "😈"];

function parseRepsNumber(reps: string): number {
  // "8-12" → 10, "10" → 10, "10 cada" → 10
  const match = reps.match(/(\d+)\s*[-–]\s*(\d+)/);
  if (match) return Math.round((parseInt(match[1]) + parseInt(match[2])) / 2);
  const single = reps.match(/(\d+)/);
  return single ? parseInt(single[1]) : 0;
}

function calcExerciseVolume(ex: WorkoutExercise): number | null {
  const loads: number[] = [];
  for (let i = 0; i < ex.sets; i++) {
    const key = SERIES_KEYS[i];
    const val = ex[key];
    if (!val || val.trim() === "") return null;
    const num = parseFloat(val);
    if (isNaN(num)) return null;
    loads.push(num);
  }
  const reps = parseRepsNumber(ex.reps);
  if (reps === 0) return null;
  return loads.reduce((sum, load) => sum + reps * load, 0);
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

  const handleFieldChange = (exerciseId: string, field: string, value: string | null) => {
    setExercises((prev) => prev.map((ex) => (ex.id === exerciseId ? { ...ex, [field]: value } : ex)));
  };

  const handleFieldBlur = async (exerciseId: string, field: string, value: string | null) => {
    await supabase.from("workout_exercises").update({ [field]: value } as any).eq("id", exerciseId);
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

  // Volume calculation
  const exerciseVolumes = exercises.map((ex) => calcExerciseVolume(ex));
  const allVolumesFilled = exerciseVolumes.every((v) => v !== null) && exercises.length > 0;
  const totalVolume = allVolumesFilled ? exerciseVolumes.reduce((sum, v) => sum! + v!, 0) : null;

  // Grid columns: adapt based on mode
  // Admin: Exercício | Séries | Reps | S1-S6 (placeholders) | Obs | Técnica | Delete
  // Patient: Exercício | Séries | Reps | S1-S6 (editable) | Obs | Técnica | Volume
  const gridCols = isPatient
    ? "1fr 50px 60px 65px 65px 65px 65px 65px 65px 1fr 110px 70px"
    : "1fr 50px 60px 65px 65px 65px 65px 65px 65px 1fr 110px 40px";

  const colCount = 12;

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
        <div className="text-[10px] font-bold uppercase text-muted-foreground">Exercícios</div>
        <div className="text-[10px] font-bold uppercase text-muted-foreground text-center">Séries</div>
        <div className="text-[10px] font-bold uppercase text-muted-foreground text-center">Reps</div>
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
        {exercises.map((ex) => {
          const exVolume = calcExerciseVolume(ex);
          return (
            <div key={ex.id} className="px-4 py-1.5 grid gap-1 items-start min-w-0" style={{ gridTemplateColumns: gridCols }}>
              {/* Exercise Name - wraps for long text */}
              <div className="min-w-0 px-1 py-1">
                <span className="text-sm font-medium break-words whitespace-normal leading-snug">{ex.name}</span>
              </div>

              {/* Sets */}
              <div className="flex items-center justify-center py-1">
                {isAdmin ? (
                  <Input
                    type="number"
                    className="h-8 w-full text-xs text-center border-0 bg-secondary/30 px-0 focus-visible:ring-1 focus-visible:ring-primary/30 rounded"
                    value={ex.sets}
                    onChange={(e) => handleFieldChange(ex.id, "sets", e.target.value)}
                    onBlur={(e) => handleFieldBlur(ex.id, "sets", e.target.value)}
                  />
                ) : (
                  <span className="text-xs font-medium text-foreground">{ex.sets}</span>
                )}
              </div>

              {/* Reps */}
              <div className="flex items-center justify-center py-1">
                {isAdmin ? (
                  <Input
                    type="text"
                    className="h-8 w-full text-xs text-center border-0 bg-secondary/30 px-0 focus-visible:ring-1 focus-visible:ring-primary/30 rounded"
                    value={ex.reps}
                    onChange={(e) => handleFieldChange(ex.id, "reps", e.target.value)}
                    onBlur={(e) => handleFieldBlur(ex.id, "reps", e.target.value)}
                  />
                ) : (
                  <span className="text-xs text-muted-foreground">{ex.reps}</span>
                )}
              </div>

              {/* Series 1-6 */}
              {SERIES_KEYS.map((key, idx) => (
                <div key={key} className="py-1">
                  {idx < ex.sets ? (
                    <Input
                      type="text"
                      inputMode="decimal"
                      className={`h-8 text-xs text-center border-0 px-0 focus-visible:ring-1 focus-visible:ring-primary/30 rounded ${
                        isAdmin ? "bg-muted/20 text-muted-foreground/50" : "bg-secondary/30"
                      }`}
                      placeholder={isAdmin ? "—" : "kg"}
                      value={(ex[key] as string) || ""}
                      onChange={(e) => handleFieldChange(ex.id, key, e.target.value || null)}
                      onBlur={(e) => handleFieldBlur(ex.id, key, e.target.value || null)}
                      readOnly={isAdmin}
                      tabIndex={isAdmin ? -1 : undefined}
                    />
                  ) : (
                    <div className="h-8" />
                  )}
                </div>
              ))}

              {/* Observações - wraps for long text */}
              <div className="py-1">
                {isAdmin ? (
                  <textarea
                    className="w-full text-xs bg-transparent px-1 py-1 resize-none min-h-[32px] border-0 focus:outline-none focus:ring-1 focus:ring-primary/30 rounded text-foreground placeholder:text-muted-foreground"
                    placeholder="—"
                    value={ex.notes || ""}
                    rows={1}
                    onChange={(e) => {
                      handleFieldChange(ex.id, "notes", e.target.value || null);
                      e.target.style.height = "auto";
                      e.target.style.height = e.target.scrollHeight + "px";
                    }}
                    onBlur={(e) => handleFieldBlur(ex.id, "notes", e.target.value || null)}
                  />
                ) : (
                  <span className="text-xs text-muted-foreground break-words whitespace-normal leading-snug block px-1 py-1">
                    {ex.notes || "—"}
                  </span>
                )}
              </div>

              {/* Técnica */}
              <div className="py-1">
                {isAdmin ? (
                  <TechniqueAutocomplete
                    value={ex.technique}
                    onSelect={async (technique) => {
                      const newVal = technique?.name || null;
                      handleFieldChange(ex.id, "technique", newVal);
                      await supabase.from("workout_exercises").update({ technique: newVal } as any).eq("id", ex.id);
                    }}
                    techniqueCatalog={techniqueCatalog}
                    onDescriptionClick={(t) => setTechniqueDetail(t)}
                  />
                ) : (
                  ex.technique ? (
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
                  )
                )}
              </div>

              {/* Delete (admin) / Volume (patient) */}
              <div className="flex items-center justify-center py-1">
                {isAdmin ? (
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive" onClick={() => handleDeleteExercise(ex.id)}>
                    <Trash2 className="w-3 h-3" />
                  </Button>
                ) : (
                  <span className={`text-xs font-semibold ${exVolume !== null ? "text-primary" : "text-muted-foreground/40"}`}>
                    {exVolume !== null ? `${exVolume.toLocaleString("pt-BR")}` : "—"}
                  </span>
                )}
              </div>
            </div>
          );
        })}

        {/* Add Exercise Row (admin only) */}
        {isAdmin && (
          <div className="px-4 py-2 grid gap-1 items-center bg-secondary/20" style={{ gridTemplateColumns: gridCols }}>
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
            <div className={`col-span-${colCount - 2}`}></div>
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
