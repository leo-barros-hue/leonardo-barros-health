import { useState, useRef, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Plus, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";

interface DietMealFood {
  id: string;
  food_name: string;
  quantity: number;
  measure: string;
  protein: number;
  carbs: number;
  fat: number;
  sort_order: number;
  food_id?: string | null;
  protein_per_unit?: number | null;
  carbs_per_unit?: number | null;
  fat_per_unit?: number | null;
}

interface InlineMealCardProps {
  meal: {
    id: string;
    name: string;
    time: string | null;
    sort_order: number;
    foods: DietMealFood[];
  };
  mealIndex: number;
  onUpdate: () => void;
  onDelete: () => void;
}

export default function InlineMealCard({ meal, mealIndex, onUpdate, onDelete }: InlineMealCardProps) {
  const [name, setName] = useState(meal.name);
  const [time, setTime] = useState(meal.time || "");
  const [foods, setFoods] = useState<DietMealFood[]>(meal.foods);
  const [editingFoodId, setEditingFoodId] = useState<string | null>(null);
  const [newFoodMode, setNewFoodMode] = useState(false);
  const [newFood, setNewFood] = useState({ food_name: "", quantity: "", measure: "g", protein: "0", carbs: "0", fat: "0" });
  const [expanded, setExpanded] = useState(true);
  const nameTimeoutRef = useRef<NodeJS.Timeout>();
  const timeTimeoutRef = useRef<NodeJS.Timeout>();

  const roundMacro = (value: number) => Math.round(value * 100) / 100;

  useEffect(() => {
    setFoods(meal.foods);
  }, [meal.foods]);

  const handleNameChange = (value: string) => {
    setName(value);
    if (nameTimeoutRef.current) clearTimeout(nameTimeoutRef.current);
    nameTimeoutRef.current = setTimeout(async () => {
      await supabase.from("diet_meals").update({ name: value }).eq("id", meal.id);
    }, 500);
  };

  const handleTimeChange = (value: string) => {
    setTime(value);
    if (timeTimeoutRef.current) clearTimeout(timeTimeoutRef.current);
    timeTimeoutRef.current = setTimeout(async () => {
      await supabase.from("diet_meals").update({ time: value || null }).eq("id", meal.id);
    }, 500);
  };

  const handleFoodChange = async (foodId: string, field: keyof DietMealFood, value: string | number) => {
    const currentFood = foods.find((food) => food.id === foodId);
    if (!currentFood) return;

    const parsedValue = field === "food_name" || field === "measure"
      ? value
      : typeof value === "string"
        ? parseFloat(value) || 0
        : value;

    let updatedFood: DietMealFood = { ...currentFood, [field]: parsedValue } as DietMealFood;
    let updateData: Record<string, unknown> = { [field]: parsedValue };

    const hasPerUnitData =
      currentFood.food_id &&
      currentFood.protein_per_unit != null &&
      currentFood.carbs_per_unit != null &&
      currentFood.fat_per_unit != null;

    if (field === "quantity" && hasPerUnitData) {
      const quantity = typeof parsedValue === "number" ? parsedValue : 0;
      const protein = roundMacro(quantity * (currentFood.protein_per_unit || 0));
      const carbs = roundMacro(quantity * (currentFood.carbs_per_unit || 0));
      const fat = roundMacro(quantity * (currentFood.fat_per_unit || 0));
      updatedFood = { ...updatedFood, quantity, protein, carbs, fat };
      updateData = { ...updateData, quantity, protein, carbs, fat };
    }

    if (field === "food_name" && currentFood.food_id) {
      updatedFood = { ...updatedFood, food_id: null, protein_per_unit: null, carbs_per_unit: null, fat_per_unit: null };
      updateData = { ...updateData, food_id: null };
    }

    setFoods((prev) => prev.map((food) => (food.id === foodId ? updatedFood : food)));
    await supabase.from("diet_meal_foods").update(updateData).eq("id", foodId);
  };

  const handleAddFood = async () => {
    if (!newFood.food_name.trim()) return;

    const { data: maxOrder } = await supabase
      .from("diet_meal_foods")
      .select("sort_order")
      .eq("diet_meal_id", meal.id)
      .order("sort_order", { ascending: false })
      .limit(1);

    const sortOrder = maxOrder && maxOrder.length > 0 ? maxOrder[0].sort_order + 1 : 0;

    const { error } = await supabase.from("diet_meal_foods").insert({
      diet_meal_id: meal.id,
      food_name: newFood.food_name,
      quantity: parseFloat(newFood.quantity) || 0,
      measure: newFood.measure,
      protein: parseFloat(newFood.protein) || 0,
      carbs: parseFloat(newFood.carbs) || 0,
      fat: parseFloat(newFood.fat) || 0,
      sort_order: sortOrder,
    });

    if (error) {
      toast.error("Erro ao adicionar alimento");
    } else {
      setNewFood({ food_name: "", quantity: "", measure: "g", protein: "0", carbs: "0", fat: "0" });
      setNewFoodMode(false);
      onUpdate();
    }
  };

  const handleDeleteFood = async (foodId: string) => {
    const { error } = await supabase.from("diet_meal_foods").delete().eq("id", foodId);
    if (error) {
      toast.error("Erro ao excluir alimento");
    } else {
      setFoods((prev) => prev.filter((f) => f.id !== foodId));
      onUpdate();
    }
  };

  const mealTotals = foods.reduce(
    (acc, food) => ({
      protein: acc.protein + food.protein,
      carbs: acc.carbs + food.carbs,
      fat: acc.fat + food.fat,
    }),
    { protein: 0, carbs: 0, fat: 0 }
  );
  const mealCalories = Math.round(mealTotals.protein * 4 + mealTotals.carbs * 4 + mealTotals.fat * 9);

  return (
    <div className="glass-card overflow-hidden border border-border/60">
      {/* ── Header ── */}
      <div
        className="flex items-center justify-between px-4 py-3 bg-muted/40 cursor-pointer select-none"
        onClick={() => setExpanded((p) => !p)}
      >
        <div className="flex items-center gap-3 flex-1 min-w-0" onClick={(e) => e.stopPropagation()}>
          <span className="text-xs font-bold text-primary shrink-0">
            {String(mealIndex + 1).padStart(2, "0")}
          </span>
          <Input
            value={time}
            onChange={(e) => handleTimeChange(e.target.value)}
            placeholder="08:00"
            className="w-16 h-6 text-xs bg-transparent border-0 px-0 focus-visible:ring-0 text-muted-foreground"
          />
          <span className="text-muted-foreground text-xs shrink-0">—</span>
          <Input
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            placeholder="Nome da refeição"
            className="flex-1 h-6 text-sm font-semibold uppercase bg-transparent border-0 px-0 focus-visible:ring-0 text-foreground"
          />
        </div>
        <div className="flex items-center gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
          <span className="text-xs text-muted-foreground font-mono">{mealCalories} kcal</span>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
            onClick={onDelete}
          >
            <Trash2 className="w-3 h-3" />
          </Button>
          <button className="text-muted-foreground" onClick={() => setExpanded((p) => !p)}>
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {expanded && (
        <>
          {/* ── Food list ── */}
          <div className="divide-y divide-border/40">
            {foods.length === 0 && !newFoodMode && (
              <p className="text-xs text-muted-foreground text-center py-4">Nenhum alimento cadastrado.</p>
            )}

            {foods.map((food, idx) => {
              const isEditing = editingFoodId === food.id;
              const foodCalories = Math.round(food.protein * 4 + food.carbs * 4 + food.fat * 9);

              return (
                <div
                  key={food.id}
                  className="group px-4 py-2"
                  onDoubleClick={() => setEditingFoodId(food.id)}
                >
                  {isEditing ? (
                    /* ── Edit row ── */
                    <div className="grid grid-cols-12 gap-1 items-center">
                      <div className="col-span-5">
                        <Input
                          autoFocus
                          value={food.food_name}
                          onChange={(e) => handleFoodChange(food.id, "food_name", e.target.value)}
                          className="h-7 text-xs border-0 bg-secondary/50 px-2 focus-visible:ring-1"
                          placeholder="Alimento"
                        />
                      </div>
                      <div className="col-span-2 flex gap-1">
                        <Input
                          type="number"
                          value={food.quantity || ""}
                          onChange={(e) => handleFoodChange(food.id, "quantity", e.target.value)}
                          className="h-7 text-xs text-center border-0 bg-secondary/50 px-1 focus-visible:ring-1"
                          placeholder="Qtd"
                        />
                        <Select value={food.measure} onValueChange={(v) => handleFoodChange(food.id, "measure", v)}>
                          <SelectTrigger className="h-7 text-xs border-0 bg-secondary/50 px-1 w-14">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="g">g</SelectItem>
                            <SelectItem value="ml">ml</SelectItem>
                            <SelectItem value="un">un</SelectItem>
                            <SelectItem value="xíc">xíc</SelectItem>
                            <SelectItem value="col">col</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="col-span-1">
                        <Input
                          type="number"
                          value={food.protein || ""}
                          onChange={(e) => handleFoodChange(food.id, "protein", e.target.value)}
                          className="h-7 text-xs text-center border-0 bg-secondary/50 px-1 text-success focus-visible:ring-1"
                          placeholder="Ptn"
                        />
                      </div>
                      <div className="col-span-1">
                        <Input
                          type="number"
                          value={food.carbs || ""}
                          onChange={(e) => handleFoodChange(food.id, "carbs", e.target.value)}
                          className="h-7 text-xs text-center border-0 bg-secondary/50 px-1 text-warning focus-visible:ring-1"
                          placeholder="Carb"
                        />
                      </div>
                      <div className="col-span-1">
                        <Input
                          type="number"
                          value={food.fat || ""}
                          onChange={(e) => handleFoodChange(food.id, "fat", e.target.value)}
                          className="h-7 text-xs text-center border-0 bg-secondary/50 px-1 text-destructive focus-visible:ring-1"
                          placeholder="Gord"
                        />
                      </div>
                      <div className="col-span-2 flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-xs text-primary"
                          onClick={() => setEditingFoodId(null)}
                        >
                          OK
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                          onClick={() => handleDeleteFood(food.id)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    /* ── Prescription row ── */
                    <div className="flex items-baseline gap-2 text-sm">
                      <span className="text-xs text-muted-foreground font-mono w-5 shrink-0 text-right">
                        {idx + 1}.
                      </span>
                      <span className="font-medium text-foreground leading-snug">
                        {food.food_name || <span className="text-muted-foreground italic">sem nome</span>}
                      </span>
                      <span className="text-muted-foreground shrink-0">
                        — {food.quantity > 0 ? `${food.quantity} ${food.measure}` : "—"}
                      </span>
                      <span className="text-xs text-muted-foreground ml-auto shrink-0 flex items-center gap-2">
                        <span className="text-success">{Math.round(food.protein)}g</span>
                        <span className="opacity-30">·</span>
                        <span className="text-warning">{Math.round(food.carbs)}g</span>
                        <span className="opacity-30">·</span>
                        <span className="text-destructive">{Math.round(food.fat)}g</span>
                        <span className="opacity-30">·</span>
                        <span className="font-mono">{foodCalories} kcal</span>
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive shrink-0 ml-1"
                        onClick={() => handleDeleteFood(food.id)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}

            {/* ── New food row ── */}
            {newFoodMode && (
              <div className="px-4 py-2 bg-secondary/10">
                <div className="grid grid-cols-12 gap-1 items-center">
                  <div className="col-span-5">
                    <Input
                      autoFocus
                      value={newFood.food_name}
                      onChange={(e) => setNewFood({ ...newFood, food_name: e.target.value })}
                      onKeyDown={(e) => e.key === "Enter" && handleAddFood()}
                      className="h-7 text-xs border-0 bg-secondary/50 px-2 focus-visible:ring-1"
                      placeholder="Nome do alimento..."
                    />
                  </div>
                  <div className="col-span-2 flex gap-1">
                    <Input
                      type="number"
                      value={newFood.quantity}
                      onChange={(e) => setNewFood({ ...newFood, quantity: e.target.value })}
                      className="h-7 text-xs text-center border-0 bg-secondary/50 px-1 focus-visible:ring-1"
                      placeholder="Qtd"
                    />
                    <Select value={newFood.measure} onValueChange={(v) => setNewFood({ ...newFood, measure: v })}>
                      <SelectTrigger className="h-7 text-xs border-0 bg-secondary/50 px-1 w-14">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="g">g</SelectItem>
                        <SelectItem value="ml">ml</SelectItem>
                        <SelectItem value="un">un</SelectItem>
                        <SelectItem value="xíc">xíc</SelectItem>
                        <SelectItem value="col">col</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-1">
                    <Input
                      type="number"
                      value={newFood.protein}
                      onChange={(e) => setNewFood({ ...newFood, protein: e.target.value })}
                      className="h-7 text-xs text-center border-0 bg-secondary/50 px-1 text-success focus-visible:ring-1"
                      placeholder="Ptn"
                    />
                  </div>
                  <div className="col-span-1">
                    <Input
                      type="number"
                      value={newFood.carbs}
                      onChange={(e) => setNewFood({ ...newFood, carbs: e.target.value })}
                      className="h-7 text-xs text-center border-0 bg-secondary/50 px-1 text-warning focus-visible:ring-1"
                      placeholder="Carb"
                    />
                  </div>
                  <div className="col-span-1">
                    <Input
                      type="number"
                      value={newFood.fat}
                      onChange={(e) => setNewFood({ ...newFood, fat: e.target.value })}
                      className="h-7 text-xs text-center border-0 bg-secondary/50 px-1 text-destructive focus-visible:ring-1"
                      placeholder="Gord"
                    />
                  </div>
                  <div className="col-span-2 flex justify-end gap-1">
                    <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-primary" onClick={handleAddFood}>
                      Add
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 text-xs text-muted-foreground"
                      onClick={() => setNewFoodMode(false)}
                    >
                      ✕
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ── Footer ── */}
          <div className="px-4 py-2 border-t border-border/40 flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setNewFoodMode(true)}
              className="text-primary gap-1 h-7 px-2 text-xs"
            >
              <Plus className="w-3 h-3" />
              Adicionar alimento
            </Button>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span>
                <span className="text-success font-medium">{Math.round(mealTotals.protein)}g</span> ptn
              </span>
              <span>
                <span className="text-warning font-medium">{Math.round(mealTotals.carbs)}g</span> carb
              </span>
              <span>
                <span className="text-destructive font-medium">{Math.round(mealTotals.fat)}g</span> gord
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
