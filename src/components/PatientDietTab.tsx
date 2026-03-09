import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Plus, Utensils, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import DietDialog from "@/components/diet/DietDialog";
import MealDialog from "@/components/diet/MealDialog";
import FoodDialog from "@/components/diet/FoodDialog";

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

interface EnergyProfile {
  bmr: number | null;
  tdee: number | null;
  formula: string | null;
}

const PatientDietTab = ({ patientId }: PatientDietTabProps) => {
  const [diets, setDiets] = useState<Diet[]>([]);
  const [selectedDiet, setSelectedDiet] = useState<Diet | null>(null);
  const [meals, setMeals] = useState<DietMeal[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMeals, setLoadingMeals] = useState(false);
  const [energyProfile, setEnergyProfile] = useState<EnergyProfile>({ bmr: null, tdee: null, formula: null });

  // Dialog states
  const [dietDialogOpen, setDietDialogOpen] = useState(false);
  const [editingDiet, setEditingDiet] = useState<Diet | null>(null);
  const [mealDialogOpen, setMealDialogOpen] = useState(false);
  const [editingMeal, setEditingMeal] = useState<DietMeal | null>(null);
  const [foodDialogOpen, setFoodDialogOpen] = useState(false);
  const [editingFood, setEditingFood] = useState<DietMealFood | null>(null);
  const [currentMealId, setCurrentMealId] = useState<string>("");

  useEffect(() => {
    fetchDiets();
    fetchEnergyProfile();
  }, [patientId]);

  const fetchEnergyProfile = async () => {
    // Fetch patient data for age and sex
    const { data: patientData } = await supabase
      .from("patients")
      .select("sex, birth_date")
      .eq("id", patientId)
      .single();

    // Fetch energy profile
    const { data: profileData } = await supabase
      .from("patient_energy_profiles")
      .select("height, activity_factor, selected_formula")
      .eq("patient_id", patientId)
      .single();

    // Fetch latest weight and body fat
    const { data: measurementData } = await supabase
      .from("body_measurements")
      .select("weight, body_fat_pct")
      .eq("patient_id", patientId)
      .order("measured_at", { ascending: false })
      .limit(1)
      .single();

    if (!profileData?.selected_formula || !measurementData?.weight) {
      setEnergyProfile({ bmr: null, tdee: null, formula: null });
      return;
    }

    const weight = measurementData.weight || 0;
    const height = profileData.height || 0;
    const bodyFat = measurementData.body_fat_pct || 0;
    const activityFactor = profileData.activity_factor || 1.2;
    const sex = patientData?.sex || "M";
    
    // Calculate age
    let age = 0;
    if (patientData?.birth_date) {
      const birthDate = new Date(patientData.birth_date);
      const today = new Date();
      age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
    }

    let bmr = 0;
    const formula = profileData.selected_formula;
    const lbm = weight * (1 - bodyFat / 100);

    if (formula === "harris") {
      if (sex === "M") {
        bmr = 88.362 + 13.397 * weight + 4.799 * height - 5.677 * age;
      } else {
        bmr = 447.593 + 9.247 * weight + 3.098 * height - 4.330 * age;
      }
    } else if (formula === "mifflin") {
      if (sex === "M") {
        bmr = 10 * weight + 6.25 * height - 5 * age + 5;
      } else {
        bmr = 10 * weight + 6.25 * height - 5 * age - 161;
      }
    } else if (formula === "cunningham" && bodyFat > 0) {
      bmr = 500 + 22 * lbm;
    } else if (formula === "tinsley" && bodyFat > 0) {
      bmr = 284 + 25.9 * lbm;
    }

    const tdee = bmr * activityFactor;

    const formulaNames: Record<string, string> = {
      harris: "Harris-Benedict",
      mifflin: "Mifflin-St Jeor",
      cunningham: "Cunningham",
      tinsley: "Tinsley"
    };

    setEnergyProfile({
      bmr: bmr > 0 ? Math.round(bmr) : null,
      tdee: tdee > 0 ? Math.round(tdee) : null,
      formula: formulaNames[formula] || null
    });
  };

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
    } else {
      setSelectedDiet(null);
      setMeals([]);
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

  const handleDeleteDiet = async (dietId: string) => {
    if (!confirm("Excluir esta dieta?")) return;
    const { error } = await supabase.from("diets").delete().eq("id", dietId);
    if (error) {
      toast.error("Erro ao excluir dieta");
    } else {
      toast.success("Dieta excluída");
      fetchDiets();
    }
  };

  const handleDeleteMeal = async (mealId: string) => {
    if (!confirm("Excluir esta refeição?")) return;
    const { error } = await supabase.from("diet_meals").delete().eq("id", mealId);
    if (error) {
      toast.error("Erro ao excluir refeição");
    } else {
      toast.success("Refeição excluída");
      if (selectedDiet) fetchMeals(selectedDiet.id);
    }
  };

  const handleDeleteFood = async (foodId: string) => {
    if (!confirm("Excluir este alimento?")) return;
    const { error } = await supabase.from("diet_meal_foods").delete().eq("id", foodId);
    if (error) {
      toast.error("Erro ao excluir alimento");
    } else {
      toast.success("Alimento excluído");
      if (selectedDiet) fetchMeals(selectedDiet.id);
    }
  };

  const openAddMeal = () => {
    setEditingMeal(null);
    setMealDialogOpen(true);
  };

  const openEditMeal = (meal: DietMeal) => {
    setEditingMeal(meal);
    setMealDialogOpen(true);
  };

  const openAddFood = (mealId: string) => {
    setCurrentMealId(mealId);
    setEditingFood(null);
    setFoodDialogOpen(true);
  };

  const openEditFood = (mealId: string, food: DietMealFood) => {
    setCurrentMealId(mealId);
    setEditingFood(food);
    setFoodDialogOpen(true);
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

  const totals = calculateTotals();

  return (
    <div className="space-y-6">
      {/* Energy Profile Banner */}
      {energyProfile.bmr && energyProfile.tdee && (
        <div className="glass-card p-4 bg-green-500/10 border border-green-500/20">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="text-center">
                <p className="text-xs text-muted-foreground uppercase font-semibold">TMB</p>
                <p className="text-xl font-bold text-foreground">{energyProfile.bmr.toLocaleString('pt-BR')} <span className="text-sm font-normal text-muted-foreground">kcal</span></p>
              </div>
              <div className="h-8 w-px bg-border" />
              <div className="text-center">
                <p className="text-xs text-muted-foreground uppercase font-semibold">Gasto Total</p>
                <p className="text-xl font-bold text-green-500">{energyProfile.tdee.toLocaleString('pt-BR')} <span className="text-sm font-normal text-green-500/70">kcal</span></p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">Fórmula: <span className="font-medium text-foreground">{energyProfile.formula}</span></p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-foreground">Dietas</h2>
        <Button onClick={() => { setEditingDiet(null); setDietDialogOpen(true); }} className="gap-2">
          <Plus className="w-4 h-4" />
          Nova Dieta
        </Button>
      </div>

      {diets.length === 0 ? (
        <div className="glass-card p-8 text-center">
          <Utensils className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">Nenhuma dieta cadastrada</h3>
          <p className="text-sm text-muted-foreground">
            Clique em "Nova Dieta" para começar.
          </p>
        </div>
      ) : (
        <>
          {/* Diet Selector */}
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

          {selectedDiet && (
            <>
              {/* Diet Header */}
              <div className="glass-card p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-bold text-foreground">{selectedDiet.name}</h2>
                    <p className="text-sm text-muted-foreground">
                      Criada em {new Date(selectedDiet.created_at).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => { setEditingDiet(selectedDiet); setDietDialogOpen(true); }}>
                      <Pencil className="w-4 h-4 mr-1" /> Editar
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDeleteDiet(selectedDiet.id)}>
                      <Trash2 className="w-4 h-4 mr-1" /> Excluir
                    </Button>
                  </div>
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

              {/* Add Meal Button */}
              <div className="flex justify-end">
                <Button variant="outline" onClick={openAddMeal} className="gap-2">
                  <Plus className="w-4 h-4" />
                  Adicionar Refeição
                </Button>
              </div>

              {/* Meals */}
              {loadingMeals ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                </div>
              ) : meals.length === 0 ? (
                <div className="glass-card p-6 text-center">
                  <p className="text-muted-foreground">Nenhuma refeição cadastrada.</p>
                </div>
              ) : (
                meals.map((meal) => (
                  <div key={meal.id} className="glass-card p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-bold text-foreground">{meal.name}</h3>
                        {meal.time && <span className="text-sm text-muted-foreground">{meal.time}</span>}
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" onClick={() => openEditMeal(meal)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteMeal(meal.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    {meal.foods.length === 0 ? (
                      <p className="text-sm text-muted-foreground mb-3">Nenhum alimento.</p>
                    ) : (
                      <div className="overflow-x-auto mb-3">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-border">
                              <th className="text-left py-2 text-muted-foreground font-medium">Alimento</th>
                              <th className="text-left py-2 text-muted-foreground font-medium">Quantidade</th>
                              <th className="text-right py-2 text-muted-foreground font-medium hidden sm:table-cell">P</th>
                              <th className="text-right py-2 text-muted-foreground font-medium hidden sm:table-cell">C</th>
                              <th className="text-right py-2 text-muted-foreground font-medium hidden sm:table-cell">G</th>
                              <th className="w-20"></th>
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
                                <td className="py-3 text-right">
                                  <div className="flex justify-end gap-1">
                                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => openEditFood(meal.id, food)}>
                                      <Pencil className="w-3 h-3" />
                                    </Button>
                                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => handleDeleteFood(food.id)}>
                                      <Trash2 className="w-3 h-3" />
                                    </Button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                    <Button variant="outline" size="sm" onClick={() => openAddFood(meal.id)} className="gap-1">
                      <Plus className="w-3 h-3" /> Alimento
                    </Button>
                  </div>
                ))
              )}
            </>
          )}
        </>
      )}

      {/* Dialogs */}
      <DietDialog
        open={dietDialogOpen}
        onOpenChange={setDietDialogOpen}
        patientId={patientId}
        diet={editingDiet}
        onSuccess={fetchDiets}
      />
      {selectedDiet && (
        <MealDialog
          open={mealDialogOpen}
          onOpenChange={setMealDialogOpen}
          dietId={selectedDiet.id}
          meal={editingMeal}
          onSuccess={() => fetchMeals(selectedDiet.id)}
        />
      )}
      <FoodDialog
        open={foodDialogOpen}
        onOpenChange={setFoodDialogOpen}
        mealId={currentMealId}
        food={editingFood}
        onSuccess={() => selectedDiet && fetchMeals(selectedDiet.id)}
      />
    </div>
  );
};

export default PatientDietTab;
