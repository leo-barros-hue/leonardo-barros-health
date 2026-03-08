import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { toast } from "sonner";
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";

interface Measurement {
  id: string;
  measured_at: string;
  weight: number | null;
  body_fat_pct: number | null;
  muscle_mass_pct: number | null;
}

interface Props {
  patientId: string;
}

const PatientEvolutionTab = ({ patientId }: Props) => {
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  // Form fields
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [weight, setWeight] = useState("");
  const [bodyFat, setBodyFat] = useState("");
  const [muscleMass, setMuscleMass] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchMeasurements = async () => {
    const { data } = await supabase
      .from("body_measurements")
      .select("*")
      .eq("patient_id", patientId)
      .order("measured_at", { ascending: true });
    setMeasurements((data as Measurement[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchMeasurements(); }, [patientId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!weight && !bodyFat && !muscleMass) {
      toast.error("Preencha pelo menos um campo");
      return;
    }
    setSaving(true);
    const { error } = await supabase.from("body_measurements").insert({
      patient_id: patientId,
      measured_at: date,
      weight: weight ? parseFloat(weight.replace(",", ".")) : null,
      body_fat_pct: bodyFat ? parseFloat(bodyFat.replace(",", ".")) : null,
      muscle_mass_pct: muscleMass ? parseFloat(muscleMass.replace(",", ".")) : null,
    });
    setSaving(false);
    if (error) {
      toast.error("Erro ao salvar", { description: error.message });
      return;
    }
    toast.success("Registro adicionado!");
    setShowForm(false);
    setWeight(""); setBodyFat(""); setMuscleMass("");
    setDate(new Date().toISOString().split("T")[0]);
    fetchMeasurements();
  };

  const handleDelete = async (id: string) => {
    await supabase.from("body_measurements").delete().eq("id", id);
    toast.success("Registro removido");
    fetchMeasurements();
  };

  const chartData = measurements.map((m) => ({
    date: new Date(m.measured_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" }),
    Peso: m.weight,
    "% Gordura": m.body_fat_pct,
    "% Massa Muscular": m.muscle_mass_pct,
  }));

  const getTrend = (key: "weight" | "body_fat_pct" | "muscle_mass_pct") => {
    if (measurements.length < 2) return null;
    const last = measurements[measurements.length - 1][key];
    const prev = measurements[measurements.length - 2][key];
    if (last == null || prev == null) return null;
    const diff = Number(last) - Number(prev);
    if (Math.abs(diff) < 0.1) return { icon: Minus, text: "Estável", color: "text-muted-foreground" };
    if (diff > 0) return { icon: TrendingUp, text: `+${diff.toFixed(1)}`, color: key === "muscle_mass_pct" ? "text-success" : "text-destructive" };
    return { icon: TrendingDown, text: diff.toFixed(1), color: key === "muscle_mass_pct" ? "text-destructive" : "text-success" };
  };

  const latest = measurements.length > 0 ? measurements[measurements.length - 1] : null;

  if (loading) return <div className="text-center py-8 text-muted-foreground">Carregando...</div>;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      {latest && (
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Peso", value: latest.weight != null ? `${latest.weight} kg` : "—", trend: getTrend("weight") },
            { label: "% Gordura", value: latest.body_fat_pct != null ? `${latest.body_fat_pct}%` : "—", trend: getTrend("body_fat_pct") },
            { label: "% Massa Muscular", value: latest.muscle_mass_pct != null ? `${latest.muscle_mass_pct}%` : "—", trend: getTrend("muscle_mass_pct") },
          ].map((card) => (
            <div key={card.label} className="glass-card p-4">
              <p className="text-xs text-muted-foreground mb-1">{card.label}</p>
              <p className="text-xl font-bold text-foreground">{card.value}</p>
              {card.trend && (
                <div className={`flex items-center gap-1 mt-1 text-xs ${card.trend.color}`}>
                  <card.trend.icon className="w-3 h-3" />
                  <span>{card.trend.text}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Chart */}
      {measurements.length >= 2 && (
        <div className="glass-card p-6">
          <h3 className="text-sm font-semibold text-foreground mb-4">Gráfico de Evolução</h3>
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={chartData} barCategoryGap="30%">
              <defs>
                <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.85} />
                  <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis yAxisId="left" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" unit=" kg" />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" unit="%" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "12px",
                  fontSize: 12,
                  boxShadow: "0 8px 24px -8px hsl(var(--primary) / 0.15)",
                }}
              />
              <Legend iconType="circle" />
              <Bar yAxisId="left" dataKey="Peso" fill="url(#barGrad)" radius={[6, 6, 0, 0]} barSize={28} />
              <Line yAxisId="right" type="monotone" dataKey="% Gordura" stroke="hsl(var(--destructive))" strokeWidth={2.5} dot={{ r: 5, strokeWidth: 2, fill: "hsl(var(--card))" }} activeDot={{ r: 7 }} />
              <Line yAxisId="right" type="monotone" dataKey="% Massa Muscular" stroke="hsl(var(--success))" strokeWidth={2.5} dot={{ r: 5, strokeWidth: 2, fill: "hsl(var(--card))" }} activeDot={{ r: 7 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Add Button / Form */}
      {!showForm ? (
        <Button onClick={() => setShowForm(true)} className="gap-2">
          <Plus className="w-4 h-4" /> Novo Registro
        </Button>
      ) : (
        <div className="glass-card p-6">
          <h3 className="text-sm font-semibold text-foreground mb-4">Adicionar Registro</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="space-y-1.5">
                <Label>Data</Label>
                <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="bg-secondary/50 border-glass-border" required />
              </div>
              <div className="space-y-1.5">
                <Label>Peso (kg)</Label>
                <Input value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="80.5" className="bg-secondary/50 border-glass-border" />
              </div>
              <div className="space-y-1.5">
                <Label>% Gordura</Label>
                <Input value={bodyFat} onChange={(e) => setBodyFat(e.target.value)} placeholder="18.0" className="bg-secondary/50 border-glass-border" />
              </div>
              <div className="space-y-1.5">
                <Label>% Massa Muscular</Label>
                <Input value={muscleMass} onChange={(e) => setMuscleMass(e.target.value)} placeholder="42.0" className="bg-secondary/50 border-glass-border" />
              </div>
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={saving}>{saving ? "Salvando..." : "Salvar"}</Button>
              <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>Cancelar</Button>
            </div>
          </form>
        </div>
      )}

      {/* Timeline */}
      {measurements.length > 0 && (
        <div className="glass-card p-6">
          <h3 className="text-sm font-semibold text-foreground mb-4">Histórico</h3>
          <div className="space-y-3">
            {[...measurements].reverse().map((m, i) => {
              const prev = measurements.length > 1 && i < measurements.length - 1
                ? [...measurements].reverse()[i + 1]
                : null;
              const weightDiff = prev && m.weight != null && prev.weight != null
                ? (Number(m.weight) - Number(prev.weight)).toFixed(1)
                : null;

              return (
                <div key={m.id} className="flex items-start gap-3 group">
                  <div className="flex flex-col items-center">
                    <div className="w-3 h-3 rounded-full bg-primary mt-1.5 shrink-0" />
                    {i < measurements.length - 1 && <div className="w-0.5 flex-1 bg-border mt-1" />}
                  </div>
                  <div className="flex-1 bg-secondary/30 rounded-xl p-3">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-medium text-muted-foreground">
                        {new Date(m.measured_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}
                      </p>
                      <button
                        onClick={() => handleDelete(m.id)}
                        className="opacity-0 group-hover:opacity-100 text-destructive hover:text-destructive/80 transition-opacity"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="flex gap-4 mt-1 text-sm">
                      {m.weight != null && (
                        <span className="text-foreground">
                          <strong>{m.weight}</strong> kg
                          {weightDiff && Number(weightDiff) !== 0 && (
                            <span className={`ml-1 text-xs ${Number(weightDiff) > 0 ? "text-destructive" : "text-success"}`}>
                              ({Number(weightDiff) > 0 ? "+" : ""}{weightDiff})
                            </span>
                          )}
                        </span>
                      )}
                      {m.body_fat_pct != null && <span className="text-foreground"><strong>{m.body_fat_pct}</strong>% gordura</span>}
                      {m.muscle_mass_pct != null && <span className="text-foreground"><strong>{m.muscle_mass_pct}</strong>% massa</span>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {measurements.length === 0 && !showForm && (
        <div className="text-center py-8 text-muted-foreground">
          Nenhum registro de evolução ainda. Clique em "Novo Registro" para começar.
        </div>
      )}
    </div>
  );
};

export default PatientEvolutionTab;
