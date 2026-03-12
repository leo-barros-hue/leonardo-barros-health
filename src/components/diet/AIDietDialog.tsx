import { useState, useRef, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Sparkles, Wand2, Mic, MicOff, SendHorizonal } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AIDietDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patientId: string;
  dietId: string;
  tdee: number | null;
  weight: number | null;
  onSuccess: () => void;
}

export default function AIDietDialog({ open, onOpenChange, patientId, dietId, tdee, weight, onSuccess }: AIDietDialogProps) {
  const [generating, setGenerating] = useState(false);
  const [mode, setMode] = useState<"generate" | "adjust_macros" | null>(null);
  const [instructions, setInstructions] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<any>(null);

  const toggleRecording = useCallback(() => {
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error("Seu navegador não suporta reconhecimento de voz. Use Chrome ou Edge.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "pt-BR";
    recognition.continuous = true;
    recognition.interimResults = true;

    let finalTranscript = "";

    recognition.onresult = (event: any) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + " ";
        } else {
          interim = transcript;
        }
      }
      setInstructions(prev => {
        const base = prev.replace(/🎤.*$/, "").trimEnd();
        const combined = base ? base + " " + finalTranscript : finalTranscript;
        return interim ? combined + "🎤 " + interim : combined.trimEnd();
      });
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      if (event.error === "not-allowed") {
        toast.error("Permissão do microfone negada. Habilite nas configurações do navegador.");
      }
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
      setInstructions(prev => prev.replace(/🎤.*$/, "").trimEnd());
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsRecording(true);
  }, [isRecording]);

  const handleGenerate = async (selectedMode: "generate" | "adjust_macros") => {
    if (!tdee) {
      toast.error("Configure o gasto calórico (TDEE) na aba Energia antes de usar a IA.");
      return;
    }

    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
    }

    setMode(selectedMode);
    setGenerating(true);

    try {
      const { data: patient } = await supabase
        .from("patients")
        .select("sex, birth_date, objective")
        .eq("id", patientId)
        .single();

      let age = 0;
      if (patient?.birth_date) {
        const bd = new Date(patient.birth_date);
        const today = new Date();
        age = today.getFullYear() - bd.getFullYear();
        const m = today.getMonth() - bd.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < bd.getDate())) age--;
      }

      const { data: foods } = await supabase
        .from("foods")
        .select("id, name, protein_per_unit, carbs_per_unit, fat_per_unit, kcal_per_unit, category");

      const patientProfile = {
        sex: patient?.sex || "M",
        age,
        weight: weight || 70,
        objective: patient?.objective || "Manutenção",
        tdee,
      };

      let currentDiet = null;
      if (selectedMode === "adjust_macros") {
        const { data: mealsData } = await supabase
          .from("diet_meals")
          .select("*")
          .eq("diet_id", dietId)
          .order("sort_order");

        if (mealsData && mealsData.length > 0) {
          const mealsWithFoods = await Promise.all(
            mealsData.map(async (meal) => {
              const { data: mealFoods } = await supabase
                .from("diet_meal_foods")
                .select("*")
                .eq("diet_meal_id", meal.id)
                .order("sort_order");
              return { ...meal, foods: mealFoods || [] };
            })
          );
          currentDiet = mealsWithFoods;
        } else {
          toast.error("Adicione refeições à dieta antes de ajustar macros.");
          setGenerating(false);
          return;
        }
      }

      const cleanInstructions = instructions.replace(/🎤.*$/, "").trim();

      const { data: result, error } = await supabase.functions.invoke("generate-diet", {
        body: {
          mode: selectedMode,
          patientProfile,
          foods: foods || [],
          currentDiet,
          customInstructions: cleanInstructions || null,
        },
      });

      if (error) throw error;
      if (result?.error) throw new Error(result.error);

      if (selectedMode === "generate") {
        await applyGeneratedDiet(result, foods || []);
      } else {
        await applyAdjustedDiet(result);
      }

      toast.success(selectedMode === "generate" ? "Dieta gerada com sucesso pela IA!" : "Macros ajustados pela IA!");
      onSuccess();
      onOpenChange(false);
    } catch (err: any) {
      console.error("AI diet error:", err);
      toast.error(err?.message || "Erro ao gerar dieta com IA");
    } finally {
      setGenerating(false);
      setMode(null);
    }
  };

  const applyGeneratedDiet = async (result: any, foods: any[]) => {
    const { data: existingMeals } = await supabase
      .from("diet_meals")
      .select("id")
      .eq("diet_id", dietId);

    if (existingMeals && existingMeals.length > 0) {
      for (const meal of existingMeals) {
        await supabase.from("diet_meal_foods").delete().eq("diet_meal_id", meal.id);
      }
      await supabase.from("diet_meals").delete().eq("diet_id", dietId);
    }

    const foodCatalog = new Map(foods.map((f) => [f.name.toLowerCase().trim(), f]));

    for (let i = 0; i < result.meals.length; i++) {
      const meal = result.meals[i];
      const { data: newMeal } = await supabase
        .from("diet_meals")
        .insert({
          diet_id: dietId,
          name: meal.name,
          time: meal.time,
          sort_order: i,
        })
        .select("id")
        .single();

      if (newMeal && meal.foods) {
        for (let j = 0; j < meal.foods.length; j++) {
          const food = meal.foods[j];
          const catalogFood = foodCatalog.get(food.food_name.toLowerCase().trim());
          const qty = food.quantity || 100;

          await supabase.from("diet_meal_foods").insert({
            diet_meal_id: newMeal.id,
            food_id: catalogFood?.id || null,
            food_name: catalogFood?.name || food.food_name,
            quantity: qty,
            measure: "g",
            protein: catalogFood ? Math.round(catalogFood.protein_per_unit * qty * 100) / 100 : 0,
            carbs: catalogFood ? Math.round(catalogFood.carbs_per_unit * qty * 100) / 100 : 0,
            fat: catalogFood ? Math.round(catalogFood.fat_per_unit * qty * 100) / 100 : 0,
            sort_order: j,
          });
        }
      }
    }
  };

  const applyAdjustedDiet = async (result: any) => {
    if (!result.meals) return;

    for (const meal of result.meals) {
      if (!meal.foods) continue;
      for (const food of meal.foods) {
        if (food.food_id) {
          const { data: catalogFood } = await supabase
            .from("foods")
            .select("protein_per_unit, carbs_per_unit, fat_per_unit")
            .eq("id", food.food_id)
            .single();

          const qty = food.quantity || 100;
          await supabase.from("diet_meal_foods").update({
            quantity: qty,
            protein: catalogFood ? Math.round(catalogFood.protein_per_unit * qty * 100) / 100 : 0,
            carbs: catalogFood ? Math.round(catalogFood.carbs_per_unit * qty * 100) / 100 : 0,
            fat: catalogFood ? Math.round(catalogFood.fat_per_unit * qty * 100) / 100 : 0,
          }).eq("id", food.food_id);
        }
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Assistente de IA - Dieta
          </DialogTitle>
          <DialogDescription>
            Descreva suas orientações e escolha como a IA deve ajudar.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 pt-2">
          {tdee ? (
            <p className="text-sm text-muted-foreground">
              TDEE do paciente: <span className="font-bold text-foreground">{tdee.toLocaleString("pt-BR")} kcal</span>
            </p>
          ) : (
            <p className="text-sm text-destructive">
              ⚠️ Configure o TDEE na aba Energia antes de usar a IA.
            </p>
          )}

          {/* Instructions textarea with mic */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Orientações para a IA</label>
            <div className="relative">
              <Textarea
                placeholder="Ex: Paciente não come glúten, prefere alimentos naturais, incluir whey no pós-treino..."
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                className="min-h-[80px] pr-24 resize-none"
                disabled={generating}
              />
              <div className="absolute right-2 bottom-2 flex gap-1">
                <Button
                  type="button"
                  variant={isRecording ? "destructive" : "ghost"}
                  size="icon"
                  className="h-8 w-8"
                  onClick={toggleRecording}
                  disabled={generating}
                  title={isRecording ? "Parar gravação" : "Gravar orientações por voz"}
                >
                  {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </Button>
                <Button
                  type="button"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => handleGenerate("generate")}
                  disabled={generating || !tdee || !instructions.replace(/🎤.*$/, "").trim()}
                  title="Enviar orientações e gerar dieta"
                >
                  {generating && mode === "generate" ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <SendHorizonal className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
            {isRecording && (
              <p className="text-xs text-destructive animate-pulse">🔴 Gravando... fale suas orientações</p>
            )}
          </div>

          <Button
            variant="outline"
            className="w-full justify-start gap-3 h-auto py-4"
            disabled={generating || !tdee}
            onClick={() => handleGenerate("generate")}
          >
            {generating && mode === "generate" ? (
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
            ) : (
              <Sparkles className="w-5 h-5 text-primary" />
            )}
            <div className="text-left">
              <p className="font-semibold">Gerar Dieta Completa</p>
              <p className="text-xs text-muted-foreground">
                A IA cria todas as refeições, horários e alimentos automaticamente
              </p>
            </div>
          </Button>

          <Button
            variant="outline"
            className="w-full justify-start gap-3 h-auto py-4"
            disabled={generating || !tdee}
            onClick={() => handleGenerate("adjust_macros")}
          >
            {generating && mode === "adjust_macros" ? (
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
            ) : (
              <Wand2 className="w-5 h-5 text-primary" />
            )}
            <div className="text-left">
              <p className="font-semibold">Ajustar Macros</p>
              <p className="text-xs text-muted-foreground">
                A IA redistribui quantidades para atingir o TDEE alvo
              </p>
            </div>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
