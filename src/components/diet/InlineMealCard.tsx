import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Plus, Utensils } from "lucide-react";
import { toast } from "sonner";

interface DietMealFood {
  id: string;
  food_id?: string | null;
  food_name: string;
  quantity: number;
  measure: string;
  protein: number;
  carbs: number;
  fat: number;
  sort_order: number;
}

interface FoodCatalogItem {
  id: string;
  name: string;
  measure: string;
  protein_per_unit: number;
  carbs_per_unit: number;
  fat_per_unit: number;
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
  onFoodsChange?: (mealId: string, foods: DietMealFood[]) => void;
}

const normalizeFoodName = (value: string) => value.trim().toLowerCase();
const toNumber = (value: string | number) => (typeof value === "string" ? parseFloat(value) || 0 : value);
const roundMacro = (value: number) => Math.round(value * 100) / 100;

export default function InlineMealCard({ meal, mealIndex, onUpdate, onDelete, onFoodsChange }: InlineMealCardProps) {
  const [name, setName] = useState(meal.name);
  const [time, setTime] = useState(meal.time || "");
  const [foods, setFoods] = useState<DietMealFood[]>(meal.foods);
  const [foodCatalog, setFoodCatalog] = useState<FoodCatalogItem[]>([]);
  const [newFood, setNewFood] = useState({ food_name: "", quantity: "", measure: "g" });
  const nameTimeoutRef = useRef<NodeJS.Timeout>();
  const timeTimeoutRef = useRef<NodeJS.Timeout>();

  const catalogByName = useMemo(
    () =>
      new Map(
        foodCatalog.map((food) => [normalizeFoodName(food.name), food] as const),
      ),
    [foodCatalog],
  );

  const catalogById = useMemo(
    () => new Map(foodCatalog.map((food) => [food.id, food] as const)),
    [foodCatalog],
  );

  const getCatalogFoodByName = (foodName: string) => catalogByName.get(normalizeFoodName(foodName));

  const calculateMacros = (catalogFood: FoodCatalogItem, quantity: number) => ({
    protein: roundMacro(catalogFood.protein_per_unit * quantity),
    carbs: roundMacro(catalogFood.carbs_per_unit * quantity),
    fat: roundMacro(catalogFood.fat_per_unit * quantity),
  });

  const syncFoodsState = (nextFoods: DietMealFood[]) => {
    setFoods(nextFoods);
    onFoodsChange?.(meal.id, nextFoods);
  };

  useEffect(() => {
    setFoods(meal.foods);
  }, [meal.foods]);

  useEffect(() => {
    const fetchFoodCatalog = async () => {
      const { data } = await supabase
        .from("foods")
        .select("id, name, measure, protein_per_unit, carbs_per_unit, fat_per_unit")
        .order("name", { ascending: true });

      setFoodCatalog(data || []);
    };

    fetchFoodCatalog();
  }, []);

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
    const currentFood = foods.find((food) => food.id === foodId);
    if (!currentFood) return;

    let updatedFood: DietMealFood = { ...currentFood };

    if (field === "food_name") {
      const typedName = String(value);
      const matchedFood = getCatalogFoodByName(typedName);

      if (matchedFood) {
        updatedFood = {
          ...updatedFood,
          food_id: matchedFood.id,
          food_name: matchedFood.name,
          measure: matchedFood.measure,
          ...calculateMacros(matchedFood, updatedFood.quantity),
        };
      } else {
        updatedFood = {
          ...updatedFood,
          food_id: null,
          food_name: typedName,
          protein: 0,
          carbs: 0,
          fat: 0,
        };
      }
    } else if (field === "quantity") {
      const quantity = toNumber(value);
      updatedFood = { ...updatedFood, quantity };

      const matchedFood =
        (updatedFood.food_id && catalogById.get(updatedFood.food_id)) || getCatalogFoodByName(updatedFood.food_name);

      if (matchedFood) {
        updatedFood = {
          ...updatedFood,
          food_id: matchedFood.id,
          measure: matchedFood.measure,
          ...calculateMacros(matchedFood, quantity),
        };
      }
    } else if (field === "measure") {
      updatedFood = { ...updatedFood, measure: String(value) };
    } else {
      updatedFood = { ...updatedFood, [field]: toNumber(value) };
    }

    const nextFoods = foods.map((food) => (food.id === foodId ? updatedFood : food));
    syncFoodsState(nextFoods);

    const { error } = await supabase
      .from("diet_meal_foods")
      .update({
        food_id: updatedFood.food_id ?? null,
        food_name: updatedFood.food_name,
        quantity: updatedFood.quantity,
        measure: updatedFood.measure,
        protein: updatedFood.protein,
        carbs: updatedFood.carbs,
        fat: updatedFood.fat,
      })
      .eq("id", foodId);

    if (error) toast.error("Erro ao atualizar alimento");
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
    const quantity = toNumber(newFood.quantity);
    const matchedFood = getCatalogFoodByName(newFood.food_name);

    const insertPayload = {
      diet_meal_id: meal.id,
      food_id: matchedFood?.id ?? null,
      food_name: matchedFood?.name || newFood.food_name.trim(),
      quantity,
      measure: matchedFood?.measure || newFood.measure,
      protein: matchedFood ? calculateMacros(matchedFood, quantity).protein : 0,
      carbs: matchedFood ? calculateMacros(matchedFood, quantity).carbs : 0,
      fat: matchedFood ? calculateMacros(matchedFood, quantity).fat : 0,
      sort_order: sortOrder,
    };

    const { data, error } = await supabase
      .from("diet_meal_foods")
      .insert(insertPayload)
      .select("*")
      .single();

    if (error) {
      toast.error("Erro ao adicionar alimento");
      return;
    }

    const nextFoods = [...foods, data as DietMealFood].sort((a, b) => a.sort_order - b.sort_order);
    syncFoodsState(nextFoods);
    setNewFood({ food_name: "", quantity: "", measure: "g" });
  };

  const handleDeleteFood = async (foodId: string) => {
    const { error } = await supabase.from("diet_meal_foods").delete().eq("id", foodId);
    if (error) {
      toast.error("Erro ao excluir alimento");
      return;
    }

    const nextFoods = foods.filter((food) => food.id !== foodId);
    syncFoodsState(nextFoods);
  };

  const mealTotals = foods.reduce(
    (acc, food) => ({
      protein: acc.protein + food.protein,
      carbs: acc.carbs + food.carbs,
      fat: acc.fat + food.fat,
    }),
    { protein: 0, carbs: 0, fat: 0 },
  );

  const mealCalories = Math.round(mealTotals.protein * 4 + mealTotals.carbs * 4 + mealTotals.fat * 9);
  const proteinKcal = Math.round(mealTotals.protein * 4);
  const carbsKcal = Math.round(mealTotals.carbs * 4);
  const fatKcal = Math.round(mealTotals.fat * 9);

  const newFoodQuantity = toNumber(newFood.quantity);
  const matchedNewFood = getCatalogFoodByName(newFood.food_name);
  const newFoodMacros = matchedNewFood
    ? calculateMacros(matchedNewFood, newFoodQuantity)
    : { protein: 0, carbs: 0, fat: 0 };

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
      <div className="bg-muted/30 px-4 py-2 grid gap-2 text-xs font-medium uppercase" style={{ gridTemplateColumns: "1fr 70px 70px 50px 50px 50px 60px" }}>
        <div className="text-muted-foreground">Alimento</div>
        <div className="text-muted-foreground text-center">Quant</div>
        <div className="text-muted-foreground text-center">Med</div>
        <div className="text-success text-center">Ptn</div>
        <div className="text-warning text-center">Carb</div>
        <div className="text-destructive text-center">Gor</div>
        <div></div>
      </div>

      {/* Food Rows */}
      <div className="divide-y divide-border/50">
        {foods.map((food) => (
          <div key={food.id} className="px-4 py-2 grid gap-2 items-center" style={{ gridTemplateColumns: "1fr 70px 70px 50px 50px 50px 60px" }}>
            <div>
              <Input
                value={food.food_name}
                onChange={(e) => handleFoodChange(food.id, "food_name", e.target.value)}
                className="h-8 text-sm border-0 bg-transparent px-0 focus-visible:ring-0"
                placeholder="Nome do alimento..."
              />
            </div>
            <div>
              <Input
                type="number"
                step="0.1"
                value={food.quantity || ""}
                onChange={(e) => handleFoodChange(food.id, "quantity", e.target.value)}
                className="h-8 text-sm text-center border-0 bg-transparent px-0 focus-visible:ring-0"
                placeholder="-"
              />
            </div>
            <div>
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
                  <SelectItem value="unid.">unid.</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Input type="number" value={food.protein || ""} readOnly className="h-8 text-sm text-center text-success border-0 bg-transparent px-0 focus-visible:ring-0" placeholder="0" />
            </div>
            <div>
              <Input type="number" value={food.carbs || ""} readOnly className="h-8 text-sm text-center text-warning border-0 bg-transparent px-0 focus-visible:ring-0" placeholder="0" />
            </div>
            <div>
              <Input type="number" value={food.fat || ""} readOnly className="h-8 text-sm text-center text-destructive border-0 bg-transparent px-0 focus-visible:ring-0" placeholder="0" />
            </div>
            <div className="flex justify-end">
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
              step="0.1"
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
                <SelectItem value="unid.">unid.</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="col-span-1">
            <Input
              type="number"
              value={newFoodMacros.protein || ""}
              readOnly
              className="h-8 text-sm text-center text-success border-0 bg-transparent px-0 focus-visible:ring-0"
              placeholder="0"
            />
          </div>
          <div className="col-span-1">
            <Input
              type="number"
              value={newFoodMacros.carbs || ""}
              readOnly
              className="h-8 text-sm text-center text-warning border-0 bg-transparent px-0 focus-visible:ring-0"
              placeholder="0"
            />
          </div>
          <div className="col-span-1">
            <Input
              type="number"
              value={newFoodMacros.fat || ""}
              readOnly
              className="h-8 text-sm text-center text-destructive border-0 bg-transparent px-0 focus-visible:ring-0"
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
