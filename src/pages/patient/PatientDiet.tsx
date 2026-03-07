import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const mockDiet = {
  name: "Dieta Hipercalórica - Fase 2",
  createdAt: "2026-03-01",
  status: "active" as const,
  totals: { calories: 2450, protein: 180, carbs: 290, fat: 75 },
  meals: [
    {
      name: "Café da Manhã",
      time: "07:00",
      foods: [
        { food: "Ovos inteiros", qty: "3 unidades", sub: "Claras (6 un)", obs: "" },
        { food: "Pão integral", qty: "2 fatias", sub: "Tapioca (2 un)", obs: "" },
        { food: "Abacate", qty: "50g", sub: "Pasta de amendoim (20g)", obs: "Gorduras boas" },
        { food: "Banana", qty: "1 unidade", sub: "Mamão (1 fatia)", obs: "" },
      ],
    },
    {
      name: "Almoço",
      time: "12:00",
      foods: [
        { food: "Arroz branco", qty: "150g", sub: "Batata doce (200g)", obs: "" },
        { food: "Feijão", qty: "100g", sub: "Lentilha (100g)", obs: "" },
        { food: "Frango grelhado", qty: "200g", sub: "Patinho (200g)", obs: "Proteína magra" },
        { food: "Salada verde", qty: "À vontade", sub: "", obs: "Temperar com azeite" },
      ],
    },
    {
      name: "Lanche da Tarde",
      time: "16:00",
      foods: [
        { food: "Whey Protein", qty: "30g", sub: "Frango desfiado (100g)", obs: "" },
        { food: "Aveia", qty: "40g", sub: "Granola (40g)", obs: "" },
        { food: "Morango", qty: "100g", sub: "Blueberry (80g)", obs: "" },
      ],
    },
    {
      name: "Jantar",
      time: "20:00",
      foods: [
        { food: "Salmão", qty: "180g", sub: "Tilápia (200g)", obs: "Rico em ômega 3" },
        { food: "Batata doce", qty: "200g", sub: "Inhame (200g)", obs: "" },
        { food: "Brócolis", qty: "100g", sub: "Couve-flor (100g)", obs: "" },
      ],
    },
  ],
};

const PatientDiet = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6 stagger-fade-in">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm">
        <ArrowLeft className="w-4 h-4" /> Voltar
      </button>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{mockDiet.name}</h1>
          <p className="text-muted-foreground text-sm mt-1">Criada em {new Date(mockDiet.createdAt).toLocaleDateString("pt-BR")}</p>
        </div>
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-success/10 text-success border border-success/20 w-fit">
          Dieta Ativa
        </span>
      </div>

      {/* Macros */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Calorias", value: `${mockDiet.totals.calories} kcal`, color: "text-primary" },
          { label: "Proteína", value: `${mockDiet.totals.protein}g`, color: "text-success" },
          { label: "Carboidrato", value: `${mockDiet.totals.carbs}g`, color: "text-warning" },
          { label: "Gordura", value: `${mockDiet.totals.fat}g`, color: "text-destructive" },
        ].map((macro) => (
          <div key={macro.label} className="glass-card p-4 text-center">
            <p className={`text-xl font-bold ${macro.color}`}>{macro.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{macro.label}</p>
          </div>
        ))}
      </div>

      {/* Meals */}
      {mockDiet.meals.map((meal) => (
        <div key={meal.name} className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-foreground">{meal.name}</h2>
            <span className="text-sm text-muted-foreground">{meal.time}</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 text-muted-foreground font-medium">Alimento</th>
                  <th className="text-left py-2 text-muted-foreground font-medium">Quantidade</th>
                  <th className="text-left py-2 text-muted-foreground font-medium hidden sm:table-cell">Substituição</th>
                  <th className="text-left py-2 text-muted-foreground font-medium hidden md:table-cell">Obs</th>
                </tr>
              </thead>
              <tbody>
                {meal.foods.map((food, i) => (
                  <tr key={i} className="border-b border-border/50 last:border-0">
                    <td className="py-3 text-foreground font-medium">{food.food}</td>
                    <td className="py-3 text-foreground">{food.qty}</td>
                    <td className="py-3 text-muted-foreground hidden sm:table-cell">{food.sub || "—"}</td>
                    <td className="py-3 text-muted-foreground hidden md:table-cell">{food.obs || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PatientDiet;
