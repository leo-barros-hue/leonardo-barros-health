import { ArrowLeft, TrendingDown, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

const evolutionData = [
  { date: "Jan", peso: 85, gordura: 22, massa: 38 },
  { date: "Fev", peso: 83, gordura: 20, massa: 39 },
  { date: "Mar", peso: 81, gordura: 18, massa: 40 },
  { date: "Abr", peso: 80, gordura: 17, massa: 41 },
  { date: "Mai", peso: 79, gordura: 16, massa: 41.5 },
  { date: "Jun", peso: 78.5, gordura: 15.2, massa: 42.1 },
];

const PatientEvolution = () => {
  const navigate = useNavigate();

  const latest = evolutionData[evolutionData.length - 1];
  const previous = evolutionData[evolutionData.length - 2];

  const stats = [
    { label: "Peso", value: `${latest.peso} kg`, change: latest.peso - previous.peso, unit: "kg", down: true },
    { label: "% Gordura", value: `${latest.gordura}%`, change: latest.gordura - previous.gordura, unit: "%", down: true },
    { label: "% Massa", value: `${latest.massa}%`, change: latest.massa - previous.massa, unit: "%", down: false },
  ];

  return (
    <div className="space-y-6 stagger-fade-in">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm">
        <ArrowLeft className="w-4 h-4" /> Voltar
      </button>

      <h1 className="text-2xl font-bold text-foreground">Evolução Física</h1>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {stats.map((stat) => {
          const isPositive = stat.down ? stat.change < 0 : stat.change > 0;
          return (
            <div key={stat.label} className="glass-card p-4 text-center">
              <p className="text-xl font-bold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
              <div className={`flex items-center justify-center gap-1 mt-2 text-xs font-medium ${isPositive ? "text-success" : "text-destructive"}`}>
                {isPositive ? <TrendingDown className="w-3 h-3" /> : <TrendingUp className="w-3 h-3" />}
                {Math.abs(stat.change).toFixed(1)}{stat.unit}
              </div>
            </div>
          );
        })}
      </div>

      {/* Chart */}
      <div className="glass-card p-6">
        <h2 className="text-lg font-bold text-foreground mb-4">Gráfico de Evolução</h2>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={evolutionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(222 20% 18%)" />
              <XAxis dataKey="date" stroke="hsl(215 20% 55%)" fontSize={12} />
              <YAxis stroke="hsl(215 20% 55%)" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(222 40% 10%)",
                  border: "1px solid hsl(222 20% 22%)",
                  borderRadius: "12px",
                  color: "hsl(210 40% 96%)",
                }}
              />
              <Line type="monotone" dataKey="peso" stroke="hsl(213 94% 55%)" strokeWidth={2} dot={{ fill: "hsl(213 94% 55%)" }} name="Peso (kg)" />
              <Line type="monotone" dataKey="gordura" stroke="hsl(0 72% 51%)" strokeWidth={2} dot={{ fill: "hsl(0 72% 51%)" }} name="Gordura (%)" />
              <Line type="monotone" dataKey="massa" stroke="hsl(152 69% 45%)" strokeWidth={2} dot={{ fill: "hsl(152 69% 45%)" }} name="Massa (%)" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Timeline */}
      <div className="glass-card p-6">
        <h2 className="text-lg font-bold text-foreground mb-4">Histórico</h2>
        <div className="space-y-4">
          {[...evolutionData].reverse().map((entry, i) => (
            <div key={i} className="flex items-center gap-4 p-3 rounded-xl bg-secondary/30">
              <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                <span className="text-sm font-bold text-primary">{entry.date}</span>
              </div>
              <div className="flex gap-6 text-sm">
                <span className="text-foreground">{entry.peso} kg</span>
                <span className="text-muted-foreground">{entry.gordura}% gordura</span>
                <span className="text-muted-foreground">{entry.massa}% massa</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PatientEvolution;
