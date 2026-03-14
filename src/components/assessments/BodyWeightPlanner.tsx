import { useState, useEffect, useMemo } from "react";
import {
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Calculator,
  Target,
  Calendar,
  Activity,
  Info,
  TrendingDown,
  Scale,
  Flame,
  ArrowRight,
  Download,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";

interface BodyWeightPlannerProps {
  patientWeight?: number;
  patientHeight?: number;
  patientAge?: number;
  patientSex?: string;
  activityFactor?: number;
  currentMaintenance?: number;
}

interface UserData {
  gender: "male" | "female";
  age: number;
  height: number;
  weight: number;
  goalWeight: number;
  days: number;
  pal: number;
}

const calculateBMR = (gender: "male" | "female", weight: number, height: number, age: number) => {
  if (gender === "male") {
    return 10 * weight + 6.25 * height - 5 * age + 5;
  }
  return 10 * weight + 6.25 * height - 5 * age - 161;
};

const calculateHallTrajectory = (data: UserData) => {
  const { gender, age, height, weight, goalWeight, days, pal } = data;

  const initialBMR = calculateBMR(gender, weight, height, age);
  const initialMaintenance = initialBMR * pal;

  const goalBMR = calculateBMR(gender, goalWeight, height, age + days / 365);
  const goalMaintenance = goalBMR * pal;

  const weightDiff = weight - goalWeight;
  const totalEnergyDeficitNeeded = weightDiff * 7700;
  const adaptationFactor = 0.15;
  const adjustedDeficit = totalEnergyDeficitNeeded / (1 - adaptationFactor);
  const dailyIntakeToReachGoal = initialMaintenance - adjustedDeficit / days;

  const chartData = [];
  const step = Math.max(1, Math.floor(days / 20));

  for (let i = 0; i <= days; i += step) {
    const t = i / days;
    const currentWeight = weight - (weight - goalWeight) * (1 - Math.pow(1 - t, 1.2));
    chartData.push({
      day: i,
      weight: parseFloat(currentWeight.toFixed(1)),
      target: goalWeight,
    });
  }

  return {
    initialMaintenance: Math.round(initialMaintenance),
    goalMaintenance: Math.round(goalMaintenance),
    dailyIntakeToReachGoal: Math.round(dailyIntakeToReachGoal),
    chartData,
  };
};

export default function BodyWeightPlanner({
  patientWeight,
  patientHeight,
  patientAge,
  patientSex,
  activityFactor,
}: BodyWeightPlannerProps) {
  const [userData, setUserData] = useState<UserData>({
    gender: patientSex === "F" ? "female" : "male",
    age: patientAge || 30,
    height: patientHeight || 175,
    weight: patientWeight || 90,
    goalWeight: (patientWeight || 90) - 10,
    days: 90,
    pal: activityFactor || 1.4,
  });

  const results = useMemo(() => calculateHallTrajectory(userData), [userData]);

  const handleChange = (field: keyof UserData, value: string | number) => {
    setUserData((prev) => ({
      ...prev,
      [field]: typeof value === "string" && field !== "gender" ? parseFloat(value) || 0 : value,
    }));
  };

  const exportToCSV = () => {
    const headers = ["Dia", "Peso Estimado (kg)", "Meta (kg)"];
    const rows = results.chartData.map((d) => [
      d.day,
      d.weight.toString().replace(".", ","),
      d.target.toString().replace(".", ","),
    ]);
    const metadata = [
      [""],
      ["DADOS DO PACIENTE"],
      ["Gênero", userData.gender === "male" ? "Masculino" : "Feminino"],
      ["Idade", userData.age],
      ["Altura (cm)", userData.height],
      ["Peso Atual (kg)", userData.weight],
      ["Peso Meta (kg)", userData.goalWeight],
      ["Prazo (Dias)", userData.days],
      ["Atividade (PAL)", userData.pal],
      [""],
      ["RESULTADOS ESTIMADOS"],
      ["Manutenção Atual (kcal)", results.initialMaintenance],
      ["Meta Diária (kcal)", results.dailyIntakeToReachGoal],
    ];
    const csvContent = [...[headers], ...rows, ...metadata]
      .map((e) => e.join(";"))
      .join("\n");
    const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `planejamento_peso_${userData.weight}kg_para_${userData.goalWeight}kg.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const palLabels: Record<string, string> = {
    "1.2": "Sedentário",
    "1.35": "Levemente ativo",
    "1.55": "Moderadamente ativo",
    "1.7": "Muito ativo",
    "1.9": "Extremamente ativo",
  };

  const closestPalLabel = () => {
    const keys = Object.keys(palLabels).map(Number);
    const closest = keys.reduce((prev, curr) =>
      Math.abs(curr - userData.pal) < Math.abs(prev - userData.pal) ? curr : prev
    );
    return palLabels[closest.toString()] || `PAL ${userData.pal.toFixed(2)}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-2 mb-2">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Calculator className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-lg font-bold text-foreground">Body Weight Planner</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Estimativa calórica para atingir o peso meta. Adaptado do Body Weight Planner (NIH) — Modelo de Hall et al.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Input Panel */}
        <div className="lg:col-span-4 space-y-4">
          <div className="glass-card p-6 space-y-5">
            <div className="flex items-center gap-2 font-semibold text-sm border-b border-border pb-3">
              <Activity className="w-4 h-4 text-primary" />
              <span>Dados do Paciente</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs">Gênero</Label>
                <Select
                  value={userData.gender}
                  onValueChange={(v) => handleChange("gender", v)}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Masculino</SelectItem>
                    <SelectItem value="female">Feminino</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Idade</Label>
                <Input
                  type="number"
                  value={userData.age}
                  onChange={(e) => handleChange("age", e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs">Altura (cm)</Label>
                <Input
                  type="number"
                  value={userData.height}
                  onChange={(e) => handleChange("height", e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Peso Atual (kg)</Label>
                <Input
                  type="number"
                  value={userData.weight}
                  onChange={(e) => handleChange("weight", e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs flex items-center gap-1">
                <Target className="w-3 h-3" /> Peso Meta (kg)
              </Label>
              <Input
                type="number"
                value={userData.goalWeight}
                onChange={(e) => handleChange("goalWeight", e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs flex items-center gap-1">
                <Calendar className="w-3 h-3" /> Prazo (Dias)
              </Label>
              <Input
                type="number"
                value={userData.days}
                onChange={(e) => handleChange("days", e.target.value)}
              />
            </div>

            <div className="space-y-3 pt-2 border-t border-border">
              <div className="flex justify-between items-center">
                <Label className="text-xs">Atividade (PAL)</Label>
                <span className="text-xs font-mono bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                  {userData.pal.toFixed(2)} — {closestPalLabel()}
                </span>
              </div>
              <Slider
                min={1.2}
                max={2.5}
                step={0.05}
                value={[userData.pal]}
                onValueChange={([v]) => handleChange("pal", v)}
              />
            </div>

            {/* PAL Reference Table */}
            <div className="pt-3 border-t border-border space-y-3">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                <Info className="w-3.5 h-3.5 text-primary" />
                O que é PAL?
              </div>
              <p className="text-[10px] text-muted-foreground leading-relaxed">
                Physical Activity Level (PAL) estima o gasto energético diário considerando o nível de atividade física.
              </p>
              <table className="w-full text-[10px] text-left">
                <thead>
                  <tr className="border-b border-border">
                    <th className="py-1 font-bold text-muted-foreground">Nível</th>
                    <th className="py-1 px-1 font-bold text-muted-foreground">PAL</th>
                    <th className="py-1 font-bold text-muted-foreground">Exemplo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  <tr><td className="py-1 font-medium">Sedentário</td><td className="py-1 px-1">1,2</td><td className="py-1 text-muted-foreground">Trabalho sentado</td></tr>
                  <tr><td className="py-1 font-medium">Levemente ativo</td><td className="py-1 px-1">1,35</td><td className="py-1 text-muted-foreground">Atividade leve</td></tr>
                  <tr><td className="py-1 font-medium">Moderadamente ativo</td><td className="py-1 px-1">1,55</td><td className="py-1 text-muted-foreground">Atividade moderada</td></tr>
                  <tr><td className="py-1 font-medium">Muito ativo</td><td className="py-1 px-1">1,7</td><td className="py-1 text-muted-foreground">Atividade intensa</td></tr>
                  <tr><td className="py-1 font-medium">Extremamente ativo</td><td className="py-1 px-1">1,9</td><td className="py-1 text-muted-foreground">Atletas</td></tr>
                </tbody>
              </table>
              <div className="flex gap-2 pt-2 border-t border-border">
                <Info className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                <p className="text-[9px] text-muted-foreground leading-relaxed italic">
                  O modelo de Hall considera a adaptação metabólica durante a perda de peso, tornando os cálculos mais realistas.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-8 space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="glass-card p-5 space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Scale className="w-4 h-4" />
                <span className="text-xs font-semibold uppercase tracking-wider">Manutenção Atual</span>
              </div>
              <p className="text-[10px] text-muted-foreground">
                Para manter o peso de {userData.weight} kg:
              </p>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold text-foreground">{results.initialMaintenance}</span>
                <span className="text-sm text-muted-foreground">kcal/dia</span>
              </div>
            </div>

            <div className="bg-primary p-5 rounded-2xl shadow-lg space-y-2 text-primary-foreground">
              <div className="flex items-center gap-2 opacity-80">
                <Flame className="w-4 h-4" />
                <span className="text-xs font-semibold uppercase tracking-wider">Meta Diária</span>
              </div>
              <p className="text-[10px] opacity-80">
                Para atingir {userData.goalWeight} kg em {userData.days} dias:
              </p>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold">{results.dailyIntakeToReachGoal}</span>
                <span className="text-sm opacity-80">kcal/dia</span>
              </div>
            </div>
          </div>

          {/* Chart */}
          <div className="glass-card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-foreground">Projeção de Perda de Peso</h3>
                <p className="text-xs text-muted-foreground">
                  Trajetória estimada para {userData.goalWeight}kg em {userData.days} dias.
                </p>
              </div>
              <div className="flex items-center gap-4 text-xs font-semibold">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                  <span className="text-muted-foreground">Estimado</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-muted-foreground/30" />
                  <span className="text-muted-foreground">Meta</span>
                </div>
              </div>
            </div>

            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={results.chartData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                  <defs>
                    <linearGradient id="colorWeightPlanner" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="day"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                    label={{ value: "Dias", position: "insideBottom", offset: -10, fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                  />
                  <YAxis
                    domain={["dataMin - 5", "dataMax + 5"]}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "12px",
                      border: "none",
                      boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                      background: "hsl(var(--card))",
                      color: "hsl(var(--card-foreground))",
                    }}
                    formatter={(value: number, name: string) => [`${value} kg`, name]}
                    labelFormatter={(label) => `Dia ${label}`}
                  />
                  <Area
                    name="Peso Estimado"
                    type="monotone"
                    dataKey="weight"
                    stroke="hsl(var(--primary))"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorWeightPlanner)"
                  />
                  <Line
                    name="Peso Meta"
                    type="monotone"
                    dataKey="target"
                    stroke="hsl(var(--muted-foreground))"
                    strokeWidth={1}
                    strokeDasharray="5 5"
                    dot={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Action Plan + Export */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="glass-card p-5 space-y-4">
              <h4 className="font-bold flex items-center gap-2 text-foreground text-sm">
                <TrendingDown className="w-4 h-4 text-primary" />
                Plano de Ação
              </h4>
              <ul className="space-y-3">
                <li className="flex items-start gap-3 text-sm">
                  <div className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">1</div>
                  <p className="text-muted-foreground">Consuma <strong className="text-foreground">{results.dailyIntakeToReachGoal} kcal</strong> por dia para atingir a meta.</p>
                </li>
                <li className="flex items-start gap-3 text-sm">
                  <div className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">2</div>
                  <p className="text-muted-foreground">Manter atividade física consistente para otimizar resultados.</p>
                </li>
                <li className="flex items-start gap-3 text-sm">
                  <div className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">3</div>
                  <p className="text-muted-foreground">Monitorar peso semanalmente e ajustar conforme necessário.</p>
                </li>
              </ul>
            </div>

            <div className="glass-card p-5 space-y-4">
              <h4 className="font-bold flex items-center gap-2 text-foreground text-sm">
                <ArrowRight className="w-4 h-4 text-primary" />
                Sobre o Modelo
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                A perda de peso sustentável considera a adaptação metabólica. Pequenas mudanças consistentes são mais eficazes que restrições extremas.
              </p>
              <Button onClick={exportToCSV} variant="outline" className="w-full gap-2">
                <Download className="w-4 h-4" />
                Exportar para Planilha
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
