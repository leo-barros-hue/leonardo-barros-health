import { useState } from "react";
import { Plus, Trash2, Utensils } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface FoodItem {
  id: string;
  food: string;
  quantity: string;
  measure: "unid." | "g" | "ml";
  protein: number;
  carbs: number;
  fat: number;
}

interface Meal {
  id: string;
  name: string;
  time: string;
  foods: FoodItem[];
}

const MEAL_PRESETS = [
  "Café da Manhã",
  "Lanche da Manhã",
  "Almoço",
  "Lanche da Tarde",
  "Jantar",
  "Ceia",
];

const createEmptyFood = (): FoodItem => ({
  id: crypto.randomUUID(),
  food: "",
  quantity: "",
  measure: "g",
  protein: 0,
  carbs: 0,
  fat: 0,
});

const createEmptyMeal = (index: number): Meal => ({
  id: crypto.randomUUID(),
  name: MEAL_PRESETS[index] || `Refeição ${index + 1}`,
  time: "",
  foods: [createEmptyFood()],
});

const calcCalories = (protein: number, carbs: number, fat: number) =>
  protein * 4 + carbs * 4 + fat * 9;

const AdminDiets = () => {
  const [meals, setMeals] = useState<Meal[]>([createEmptyMeal(0)]);

  const updateFood = (mealId: string, foodId: string, field: keyof FoodItem, value: string | number) => {
    setMeals((prev) =>
      prev.map((meal) =>
        meal.id === mealId
          ? {
              ...meal,
              foods: meal.foods.map((f) =>
                f.id === foodId ? { ...f, [field]: value } : f
              ),
            }
          : meal
      )
    );
  };

  const addFood = (mealId: string) => {
    setMeals((prev) =>
      prev.map((meal) =>
        meal.id === mealId
          ? { ...meal, foods: [...meal.foods, createEmptyFood()] }
          : meal
      )
    );
  };

  const removeFood = (mealId: string, foodId: string) => {
    setMeals((prev) =>
      prev.map((meal) =>
        meal.id === mealId
          ? { ...meal, foods: meal.foods.filter((f) => f.id !== foodId) }
          : meal
      )
    );
  };

  const addMeal = () => {
    setMeals((prev) => [...prev, createEmptyMeal(prev.length)]);
  };

  const removeMeal = (mealId: string) => {
    setMeals((prev) => prev.filter((m) => m.id !== mealId));
  };

  const updateMeal = (mealId: string, field: keyof Pick<Meal, "name" | "time">, value: string) => {
    setMeals((prev) =>
      prev.map((meal) =>
        meal.id === mealId ? { ...meal, [field]: value } : meal
      )
    );
  };

  const getMealTotals = (foods: FoodItem[]) => {
    const protein = foods.reduce((s, f) => s + (f.protein || 0), 0);
    const carbs = foods.reduce((s, f) => s + (f.carbs || 0), 0);
    const fat = foods.reduce((s, f) => s + (f.fat || 0), 0);
    const calories = calcCalories(protein, carbs, fat);
    return { protein, carbs, fat, calories };
  };

  const grandTotals = meals.reduce(
    (acc, meal) => {
      const t = getMealTotals(meal.foods);
      return {
        calories: acc.calories + t.calories,
        protein: acc.protein + t.protein,
        carbs: acc.carbs + t.carbs,
        fat: acc.fat + t.fat,
      };
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  return (
    <div className="space-y-6 stagger-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Montar Dieta</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Crie blocos de refeições com alimentos e macros
          </p>
        </div>
      </div>

      {/* Grand totals */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Calorias Totais", value: `${grandTotals.calories} kcal`, color: "text-primary" },
          { label: "Proteína Total", value: `${grandTotals.protein}g`, color: "text-success" },
          { label: "Carboidrato Total", value: `${grandTotals.carbs}g`, color: "text-warning" },
          { label: "Gordura Total", value: `${grandTotals.fat}g`, color: "text-destructive" },
        ].map((m) => (
          <div key={m.label} className="glass-card p-4 text-center">
            <p className={`text-xl font-bold ${m.color}`}>{m.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{m.label}</p>
          </div>
        ))}
      </div>

      {/* Meal blocks */}
      {meals.map((meal, mealIndex) => {
        const totals = getMealTotals(meal.foods);
        return (
          <div key={meal.id} className="glass-card overflow-hidden">
            {/* Meal header */}
            <div className="bg-primary/10 border-b border-primary/20 px-6 py-4 flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex items-center gap-2 flex-1">
                <Utensils className="w-5 h-5 text-primary" />
                <span className="text-xs font-bold text-primary uppercase tracking-wider">
                  REF {mealIndex + 1}:
                </span>
                <Input
                  value={meal.time}
                  onChange={(e) => updateMeal(meal.id, "time", e.target.value)}
                  placeholder="08h00"
                  className="w-20 h-8 text-sm bg-secondary/50 border-border"
                />
                <span className="text-foreground font-bold text-sm">(</span>
                <Input
                  value={meal.name}
                  onChange={(e) => updateMeal(meal.id, "name", e.target.value)}
                  placeholder="Nome da refeição"
                  className="max-w-[200px] h-8 text-sm bg-secondary/50 border-border font-bold uppercase"
                />
                <span className="text-foreground font-bold text-sm">)</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeMeal(meal.id)}
                className="text-destructive hover:bg-destructive/10 self-end sm:self-auto"
                disabled={meals.length === 1}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-secondary/30">
                    <th className="text-left py-3 px-4 text-muted-foreground font-semibold uppercase text-xs tracking-wider">
                      Alimento
                    </th>
                    <th className="text-center py-3 px-3 text-muted-foreground font-semibold uppercase text-xs tracking-wider w-20">
                      Quant
                    </th>
                    <th className="text-center py-3 px-3 text-muted-foreground font-semibold uppercase text-xs tracking-wider w-20">
                      Med
                    </th>
                    <th className="text-center py-3 px-3 text-success font-semibold uppercase text-xs tracking-wider w-20">
                      Ptn
                    </th>
                    <th className="text-center py-3 px-3 text-warning font-semibold uppercase text-xs tracking-wider w-20">
                      Carb
                    </th>
                    <th className="text-center py-3 px-3 text-destructive font-semibold uppercase text-xs tracking-wider w-20">
                      Fat
                    </th>
                    <th className="w-10"></th>
                  </tr>
                </thead>
                <tbody>
                  {meal.foods.map((food) => (
                    <tr key={food.id} className="border-b border-border/50 hover:bg-secondary/20 transition-colors">
                      <td className="py-2 px-4">
                        <Input
                          value={food.food}
                          onChange={(e) => updateFood(meal.id, food.id, "food", e.target.value)}
                          placeholder="Nome do alimento"
                          className="h-8 text-sm bg-transparent border-none shadow-none focus-visible:ring-1 px-2"
                        />
                      </td>
                      <td className="py-2 px-2">
                        <Input
                          value={food.quantity}
                          onChange={(e) => updateFood(meal.id, food.id, "quantity", e.target.value)}
                          placeholder="-"
                          className="h-8 text-sm text-center bg-transparent border-none shadow-none focus-visible:ring-1 px-1"
                        />
                      </td>
                      <td className="py-2 px-2">
                        <Select
                          value={food.measure}
                          onValueChange={(v) => updateFood(meal.id, food.id, "measure", v)}
                        >
                          <SelectTrigger className="h-8 text-sm bg-transparent border-none shadow-none w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="unid.">unid.</SelectItem>
                            <SelectItem value="g">g</SelectItem>
                            <SelectItem value="ml">ml</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="py-2 px-2">
                        <Input
                          type="number"
                          min={0}
                          value={food.protein || ""}
                          onChange={(e) => updateFood(meal.id, food.id, "protein", Number(e.target.value))}
                          placeholder="0"
                          className="h-8 text-sm text-center text-success bg-transparent border-none shadow-none focus-visible:ring-1 px-1"
                        />
                      </td>
                      <td className="py-2 px-2">
                        <Input
                          type="number"
                          min={0}
                          value={food.carbs || ""}
                          onChange={(e) => updateFood(meal.id, food.id, "carbs", Number(e.target.value))}
                          placeholder="0"
                          className="h-8 text-sm text-center text-warning bg-transparent border-none shadow-none focus-visible:ring-1 px-1"
                        />
                      </td>
                      <td className="py-2 px-2">
                        <Input
                          type="number"
                          min={0}
                          value={food.fat || ""}
                          onChange={(e) => updateFood(meal.id, food.id, "fat", Number(e.target.value))}
                          placeholder="0"
                          className="h-8 text-sm text-center text-destructive bg-transparent border-none shadow-none focus-visible:ring-1 px-1"
                        />
                      </td>
                      <td className="py-2 px-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeFood(meal.id, food.id)}
                          className="h-7 w-7 text-muted-foreground hover:text-destructive"
                          disabled={meal.foods.length === 1}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Add food button */}
            <div className="px-4 py-2 border-t border-border/50">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => addFood(meal.id)}
                className="text-primary hover:bg-primary/10 text-xs"
              >
                <Plus className="w-3.5 h-3.5 mr-1" /> Adicionar alimento
              </Button>
            </div>

            {/* Meal totals */}
            <div className="bg-secondary/40 border-t border-border px-6 py-3">
              <div className="flex flex-wrap items-center gap-6 text-sm">
                <span className="font-bold text-primary">
                  kcals {totals.calories}
                </span>
                <div className="flex items-center gap-1">
                  <span className="text-muted-foreground">(g)</span>
                  <span className="font-bold text-success">{totals.protein}</span>
                  <span className="text-muted-foreground mx-2">·</span>
                  <span className="font-bold text-warning">{totals.carbs}</span>
                  <span className="text-muted-foreground mx-2">·</span>
                  <span className="font-bold text-destructive">{totals.fat}</span>
                </div>
                <div className="flex items-center gap-1 text-muted-foreground text-xs">
                  <span>(kcal)</span>
                  <span className="font-bold text-success">{totals.protein * 4}</span>
                  <span className="mx-1">·</span>
                  <span className="font-bold text-warning">{totals.carbs * 4}</span>
                  <span className="mx-1">·</span>
                  <span className="font-bold text-destructive">{totals.fat * 9}</span>
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {/* Add meal button */}
      <Button
        onClick={addMeal}
        className="w-full py-6 border-2 border-dashed border-primary/30 bg-primary/5 hover:bg-primary/10 text-primary"
        variant="ghost"
      >
        <Plus className="w-5 h-5 mr-2" /> Adicionar Refeição
      </Button>
    </div>
  );
};

export default AdminDiets;
