import { useState, useRef, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Plus, Utensils } from "lucide-react";
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
  const [newFood, setNewFood] = useState({ food_name: "", quantity: "", measure: "g", protein: "0", carbs: "0", fat: "0" });
  const nameTimeoutRef = useRef<NodeJS.Timeout>();
  const timeTimeoutRef = useRef<NodeJS.Timeout>();

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

  const handleFoodChange = async (foodId: string, field: string, value: string | number) => {
    const numValue = typeof value === "string" ? parseFloat(value) || 0 : value;
    
    setFoods(prev => prev.map(f => 
      f.id === foodId ? { ...f, [field]: field === "food_name" || field === "measure" ? value : numValue } : f
    ));

    const updateData: Record<string, unknown> = {};
    if (field === "food_name" || field === "measure") {
      updateData[field] = value;
    } else {
      updateData[field] = numValue;
    }
    
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
      onUpdate();
    }
  };

  const handleDeleteFood = async (foodId: string) => {
    const { error } = await supabase.from("diet_meal_foods").delete().eq("id", foodId);
    if (error) {
      toast.error("Erro ao excluir alimento");
    } else {
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
  const proteinKcal = Math.round(mealTotals.protein * 4);
  const carbsKcal = Math.round(mealTotals.carbs * 4);
  const fatKcal = Math.round(mealTotals.fat * 9);

  return (
    <div className="glass-card overflow-hidden">
      {/* Header */}
      <div className="bg-muted/50 px-4 py-3 flex items-center gap-3">
        <Utensils className="w-4 h-4 text-primary" />
        <span className="text-xs font-semibold text-muted-foreground">REF {mealIndex + 1}:</span>
        <Input
          value={time}
          onChange={(e) => handleTimeChange(e.target.value)}
          placeholder="08:00"
          className="w-20 h-7 text-xs bg-secondary/80 border-0"
        />
        <span className="text-muted-foreground">(</span>
        <Input
          value={name}
          onChange={(e) => handleNameChange(e.target.value)}
          placeholder="Nome da refeição"
          className="flex-1 h-7 text-xs font-semibold uppercase bg-secondary/80 border-0"
        />
        <span className="text-muted-foreground">)</span>
        <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive" onClick={onDelete}>
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>

      {/* Table Header */}
      <div className="bg-muted/30 px-4 py-2 grid grid-cols-12 gap-2 text-xs font-medium uppercase">
        <div className="col-span-5 text-muted-foreground">Alimento</div>
        <div className="col-span-1 text-muted-foreground text-center">Quant</div>
        <div className="col-span-1 text-muted-foreground text-center">Med</div>
        <div className="col-span-1 text-success text-center">Ptn</div>
        <div className="col-span-1 text-warning text-center">Carb</div>
        <div className="col-span-1 text-destructive text-center">Fat</div>
        <div className="col-span-2"></div>
      </div>

      {/* Food Rows */}
      <div className="divide-y divide-border/50">
        {foods.map((food) => (
          <div key={food.id} className="px-4 py-2 grid grid-cols-12 gap-2 items-center">
            <div className="col-span-5">
              <Input
                value={food.food_name}
                onChange={(e) => handleFoodChange(food.id, "food_name", e.target.value)}
                className="h-8 text-sm border-0 bg-transparent px-0 focus-visible:ring-0"
                placeholder="Nome do alimento..."
              />
            </div>
            <div className="col-span-1">
              <Input
                type="number"
                value={food.quantity || ""}
                onChange={(e) => handleFoodChange(food.id, "quantity", e.target.value)}
                className="h-8 text-sm text-center border-0 bg-transparent px-0 focus-visible:ring-0"
                placeholder="-"
              />
            </div>
            <div className="col-span-1">
              <Select value={food.measure} onValueChange={(v) => handleFoodChange(food.id, "measure", v)}>
                <SelectTrigger className="h-8 text-xs border-0 bg-transparent px-1">
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
                className="h-8 text-sm text-center text-success border-0 bg-transparent px-0 focus-visible:ring-0"
                placeholder="0"
              />
            </div>
            <div className="col-span-1">
              <Input
                type="number"
                value={food.carbs || ""}
                onChange={(e) => handleFoodChange(food.id, "carbs", e.target.value)}
                className="h-8 text-sm text-center text-warning border-0 bg-transparent px-0 focus-visible:ring-0"
                placeholder="0"
              />
            </div>
            <div className="col-span-1">
              <Input
                type="number"
                value={food.fat || ""}
                onChange={(e) => handleFoodChange(food.id, "fat", e.target.value)}
                className="h-8 text-sm text-center text-destructive border-0 bg-transparent px-0 focus-visible:ring-0"
                placeholder="0"
              />
            </div>
            <div className="col-span-2 flex justify-end">
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive" onClick={() => handleDeleteFood(food.id)}>
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          </div>
        ))}

        {/* Add Food Row */}
        <div className="px-4 py-2 grid grid-cols-12 gap-2 items-center bg-secondary/20">
          <div className="col-span-5">
            <Input
              value={newFood.food_name}
              onChange={(e) => setNewFood({ ...newFood, food_name: e.target.value })}
              onKeyDown={(e) => e.key === "Enter" && handleAddFood()}
              className="h-8 text-sm border-0 bg-transparent px-0 focus-visible:ring-0"
              placeholder="Digite o nome do alimento..."
            />
          </div>
          <div className="col-span-1">
            <Input
              type="number"
              value={newFood.quantity}
              onChange={(e) => setNewFood({ ...newFood, quantity: e.target.value })}
              className="h-8 text-sm text-center border-0 bg-transparent px-0 focus-visible:ring-0"
              placeholder="-"
            />
          </div>
          <div className="col-span-1">
            <Select value={newFood.measure} onValueChange={(v) => setNewFood({ ...newFood, measure: v })}>
              <SelectTrigger className="h-8 text-xs border-0 bg-transparent px-1">
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
              className="h-8 text-sm text-center border-0 bg-transparent px-0 focus-visible:ring-0"
              placeholder="0"
            />
          </div>
          <div className="col-span-1">
            <Input
              type="number"
              value={newFood.carbs}
              onChange={(e) => setNewFood({ ...newFood, carbs: e.target.value })}
              className="h-8 text-sm text-center border-0 bg-transparent px-0 focus-visible:ring-0"
              placeholder="0"
            />
          </div>
          <div className="col-span-1">
            <Input
              type="number"
              value={newFood.fat}
              onChange={(e) => setNewFood({ ...newFood, fat: e.target.value })}
              className="h-8 text-sm text-center border-0 bg-transparent px-0 focus-visible:ring-0"
              placeholder="0"
            />
          </div>
          <div className="col-span-2"></div>
        </div>
      </div>

      {/* Add Food Button */}
      <div className="px-4 py-2 border-t border-border/50">
        <Button variant="ghost" size="sm" onClick={handleAddFood} className="text-primary gap-1 h-7 px-2">
          <Plus className="w-3 h-3" />
          Adicionar alimento
        </Button>
      </div>

      {/* Totals */}
      <div className="bg-muted/40 px-4 py-2 flex items-center gap-4 text-xs">
        <span className="font-semibold text-foreground">kcals {mealCalories}</span>
        <span className="text-muted-foreground">
          (g) <span className="text-success">{Math.round(mealTotals.protein)}</span> · <span className="text-warning">{Math.round(mealTotals.carbs)}</span> · <span className="text-destructive">{Math.round(mealTotals.fat)}</span>
        </span>
        <span className="text-muted-foreground">
          (kcal) <span className="text-success">{proteinKcal}</span> · <span className="text-warning">{carbsKcal}</span> · <span className="text-destructive">{fatKcal}</span>
        </span>
      </div>
    </div>
  );
}
