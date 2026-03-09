import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Plus, Utensils } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Diet {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

interface DietMeal {
  id: string;
  name: string;
  time: string | null;
  sort_order: number;
  foods: DietMealFood[];
}

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

interface PatientDietTabProps {
  patientId: string;
}

const PatientDietTab = ({ patientId }: PatientDietTabProps) => {
  const [diets, setDiets] = useState<Diet[]>([]);
  const [selectedDiet, setSelectedDiet] = useState<Diet | null>(null);
  const [meals, setMeals] = useState<DietMeal[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMeals, setLoadingMeals] = useState(false);

  useEffect(() => {
    fetchDiets();
  }, [patientId]);

  const fetchDiets = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("diets")
      .select("*")
      .eq("patient_id", patientId)
      .order("created_at", { ascending: false });
    
    setDiets(data || []);
    if (data && data.length > 0) {
      setSelectedDiet(data[0]);
      fetchMeals(data[0].id);
    }
    setLoading(false);
  };

  const fetchMeals = async (dietId: string) => {
    setLoadingMeals(true);
    const { data: mealsData } = await supabase
      .from("diet_meals")
      .select("*")
      .eq("diet_id", dietId)
      .order("sort_order", { ascending: true });

    if (mealsData) {
      const mealsWithFoods: DietMeal[] = await Promise.all(
        mealsData.map(async (meal) => {
          const { data: foodsData } = await supabase
            .from("diet_meal_foods")
            .select("*")
            .eq("diet_meal_id", meal.id)
            .order("sort_order", { ascending: true });
          return { ...meal, foods: foodsData || [] };
        })
      );
      setMeals(mealsWithFoods);
    }
    setLoadingMeals(false);
  };

  const handleSelectDiet = (diet: Diet) => {
    setSelectedDiet(diet);
    fetchMeals(diet.id);
  };

  const calculateTotals = () => {
    let protein = 0, carbs = 0, fat = 0;
    meals.forEach(meal => {
      meal.foods.forEach(food => {
        protein += food.protein;
        carbs += food.carbs;
        fat += food.fat;
      });
    });
    const calories = protein * 4 + carbs * 4 + fat * 9;
    return { calories: Math.round(calories), protein: Math.round(protein), carbs: Math.round(carbs), fat: Math.round(fat) };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (diets.length === 0) {
    return (
      <div className="glass-card p-8 text-center">
        <Utensils className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">Nenhuma dieta cadastrada</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Este paciente ainda não possui nenhuma dieta registrada.
        </p>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Criar Nova Dieta
        </Button>
      </div>
    );
  }

  const totals = calculateTotals();

  return (
    <div className="space-y-6">
      {/* Diet Selector */}
      {diets.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {diets.map((diet) => (
            <button
              key={diet.id}
              onClick={() => handleSelectDiet(diet)}
              className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                selectedDiet?.id === diet.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary/50 text-muted-foreground hover:text-foreground"
              }`}
            >
              {diet.name}
            </button>
          ))}
        </div>
      )}

      {selectedDiet && (
        <>
          {/* Header */}
          <div className="glass-card p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-foreground">{selectedDiet.name}</h2>
                <p className="text-sm text-muted-foreground">
                  Criada em {new Date(selectedDiet.created_at).toLocaleDateString("pt-BR")}
                </p>
              </div>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-success/10 text-success border border-success/20 w-fit">
                Dieta Ativa
              </span>
            </div>
          </div>

          {/* Macros */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Calorias", value: `${totals.calories} kcal`, color: "text-primary" },
              { label: "Proteína", value: `${totals.protein}g`, color: "text-success" },
              { label: "Carboidrato", value: `${totals.carbs}g`, color: "text-warning" },
              { label: "Gordura", value: `${totals.fat}g`, color: "text-destructive" },
            ].map((macro) => (
              <div key={macro.label} className="glass-card p-4 text-center">
                <p className={`text-xl font-bold ${macro.color}`}>{macro.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{macro.label}</p>
              </div>
            ))}
          </div>

          {/* Meals */}
          {loadingMeals ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            </div>
          ) : meals.length === 0 ? (
            <div className="glass-card p-6 text-center">
              <p className="text-muted-foreground">Nenhuma refeição cadastrada nesta dieta.</p>
            </div>
          ) : (
            meals.map((meal) => (
              <div key={meal.id} className="glass-card p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-foreground">{meal.name}</h3>
                  {meal.time && <span className="text-sm text-muted-foreground">{meal.time}</span>}
                </div>
                {meal.foods.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Nenhum alimento nesta refeição.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-2 text-muted-foreground font-medium">Alimento</th>
                          <th className="text-left py-2 text-muted-foreground font-medium">Quantidade</th>
                          <th className="text-right py-2 text-muted-foreground font-medium hidden sm:table-cell">P</th>
                          <th className="text-right py-2 text-muted-foreground font-medium hidden sm:table-cell">C</th>
                          <th className="text-right py-2 text-muted-foreground font-medium hidden sm:table-cell">G</th>
                        </tr>
                      </thead>
                      <tbody>
                        {meal.foods.map((food) => (
                          <tr key={food.id} className="border-b border-border/50 last:border-0">
                            <td className="py-3 text-foreground font-medium">{food.food_name}</td>
                            <td className="py-3 text-foreground">{food.quantity}{food.measure}</td>
                            <td className="py-3 text-right text-success hidden sm:table-cell">{food.protein}g</td>
                            <td className="py-3 text-right text-warning hidden sm:table-cell">{food.carbs}g</td>
                            <td className="py-3 text-right text-destructive hidden sm:table-cell">{food.fat}g</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ))
          )}
        </>
      )}
    </div>
  );
};

export default PatientDietTab;
