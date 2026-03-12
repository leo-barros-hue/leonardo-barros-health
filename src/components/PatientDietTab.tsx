import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Plus, Utensils, Pencil, Trash2, Flame, UtensilsCrossed, Scale } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, ResponsiveContainer, LabelList, PieChart, Pie } from "recharts";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import DietDialog from "@/components/diet/DietDialog";
import InlineMealCard from "@/components/diet/InlineMealCard";

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
  food_id?: string | null;
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
  weight: number | null;
}

const PatientDietTab = ({ patientId }: PatientDietTabProps) => {
  const [diets, setDiets] = useState<Diet[]>([]);
  const [selectedDiet, setSelectedDiet] = useState<Diet | null>(null);
  const [meals, setMeals] = useState<DietMeal[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMeals, setLoadingMeals] = useState(false);
  const [energyProfile, setEnergyProfile] = useState<EnergyProfile>({ bmr: null, tdee: null, formula: null, weight: null });

  // Dialog states
  const [dietDialogOpen, setDietDialogOpen] = useState(false);
  const [editingDiet, setEditingDiet] = useState<Diet | null>(null);

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
      setEnergyProfile({ bmr: null, tdee: null, formula: null, weight: null });
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

  const handleMealFoodsChange = (mealId: string, updatedFoods: DietMealFood[]) => {
    setMeals((prev) =>
      prev.map((meal) =>
        meal.id === mealId
          ? { ...meal, foods: updatedFoods }
          : meal
      )
    );
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

  const handleAddMeal = async () => {
    if (!selectedDiet) return;
    
    const { data: maxOrder } = await supabase
      .from("diet_meals")
      .select("sort_order")
      .eq("diet_id", selectedDiet.id)
      .order("sort_order", { ascending: false })
      .limit(1);
    
    const newOrder = maxOrder && maxOrder.length > 0 ? maxOrder[0].sort_order + 1 : 0;

    const { data, error } = await supabase.from("diet_meals").insert({
      name: "Nova Refeição",
      time: null,
      diet_id: selectedDiet.id,
      sort_order: newOrder,
    }).select("*").single();

    if (error) {
      toast.error("Erro ao adicionar refeição");
    } else if (data) {
      setMeals((prev) => [...prev, { ...data, foods: [] }]);
    }
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
      {/* Energy Balance Block */}
      {energyProfile.tdee && (() => {
        const balance = totals.calories - energyProfile.tdee!;
        const isSurplus = balance > 0;
        const isDeficit = balance < 0;
        const chartData = [
          { name: "Gasto (TDEE)", value: energyProfile.tdee! },
          { name: "Ingestão", value: totals.calories },
          { name: "Balanço", value: balance },
        ];
        const chartColors = [
          "hsl(var(--primary))",
          "hsl(50, 90%, 60%)",
          isDeficit ? "hsl(var(--destructive))" : isSurplus ? "hsl(142, 71%, 45%)" : "hsl(var(--muted-foreground))",
        ];
        return (
          <div className="glass-card p-5 border border-border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">Balanço Energético</h3>
              <p className="text-xs text-muted-foreground">Fórmula: <span className="font-medium text-foreground">{energyProfile.formula}</span></p>
            </div>

            {/* Info cards + Chart side by side */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Cards */}
              <div className="grid grid-cols-3 gap-3">
                <div className="flex flex-col items-center justify-center gap-1 p-3 rounded-xl bg-secondary/40 text-center">
                  <div className="flex items-center gap-1.5">
                    <Flame className="w-4 h-4 text-primary" />
                    <p className="text-xs text-muted-foreground">Gasto (TDEE)</p>
                  </div>
                  <p className="text-lg font-bold text-primary">{energyProfile.tdee!.toLocaleString('pt-BR')}</p>
                  <p className="text-xs text-muted-foreground">kcal</p>
                  <p className="text-[10px] text-muted-foreground mt-1">{energyProfile.formula}</p>
                </div>
                <div className="flex flex-col items-center justify-center gap-1 p-3 rounded-xl bg-secondary/40 text-center">
                  <div className="flex items-center gap-1.5">
                    <UtensilsCrossed className="w-4 h-4 text-foreground" />
                    <p className="text-xs text-muted-foreground">Ingestão</p>
                  </div>
                  <p className="text-lg font-bold text-foreground">{totals.calories.toLocaleString('pt-BR')}</p>
                  <p className="text-xs text-muted-foreground">kcal</p>
                </div>
                <div className={`flex flex-col items-center justify-center gap-1 p-3 rounded-xl text-center ${isDeficit ? 'bg-destructive/10' : isSurplus ? 'bg-success/10' : 'bg-secondary/40'}`}>
                  <div className="flex items-center gap-1.5">
                    <Scale className={`w-4 h-4 ${isDeficit ? 'text-destructive' : isSurplus ? 'text-success' : 'text-muted-foreground'}`} />
                    <p className="text-xs text-muted-foreground">Balanço</p>
                  </div>
                  <p className={`text-lg font-bold ${isDeficit ? 'text-destructive' : isSurplus ? 'text-success' : 'text-foreground'}`}>
                    {isSurplus ? '+' : ''}{balance.toLocaleString('pt-BR')}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {isDeficit ? 'Déficit' : isSurplus ? 'Superávit' : 'Equilíbrio'}
                  </p>
                </div>
              </div>

              {/* Chart */}
              {(() => {
                const maxVal = Math.max(energyProfile.tdee!, totals.calories, Math.abs(balance));
                const yMax = Math.ceil(maxVal * 1.15 / 100) * 100;
                return (
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={chartData} barCategoryGap={0} barGap={0}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                      <XAxis dataKey="name" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                      <YAxis domain={[0, yMax]} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} width={50} label={{ value: "Calorias", angle: -90, position: "insideLeft", style: { fontSize: 11, fill: "hsl(var(--muted-foreground))", textAnchor: "middle" } }} />
                      <Tooltip
                        formatter={(value: number) => [`${Math.abs(value).toLocaleString('pt-BR')} kcal`, '']}
                        contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
                      />
                      <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                        {chartData.map((_, index) => (
                          <Cell key={index} fill={chartColors[index]} />
                        ))}
                        <LabelList dataKey="value" position="center" formatter={(v: number) => v.toLocaleString('pt-BR')} style={{ fontSize: 13, fontWeight: 700, fill: "#fff" }} />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                );
              })()}
            </div>
          </div>
        );
      })()}

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
                <Button variant="outline" onClick={handleAddMeal} className="gap-2">
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {meals.map((meal, index) => (
                    <InlineMealCard
                      key={meal.id}
                      meal={meal}
                      mealIndex={index}
                      onUpdate={() => selectedDiet && fetchMeals(selectedDiet.id)}
                      onDelete={() => handleDeleteMeal(meal.id)}
                      onFoodsChange={handleMealFoodsChange}
                    />
                  ))}
                </div>
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
    </div>
  );
};

export default PatientDietTab;
