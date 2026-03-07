import { Users, Utensils, Dumbbell, FlaskConical, FileText, Search, Plus, TrendingUp, Clock, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const mockPatients = [
  { id: "1", name: "Maria Silva", age: 32, objective: "Emagrecimento", lastUpdate: "2026-03-05", status: "active", planEnd: "2026-04-15" },
  { id: "2", name: "João Santos", age: 28, objective: "Hipertrofia", lastUpdate: "2026-03-01", status: "active", planEnd: "2026-03-20" },
  { id: "3", name: "Ana Costa", age: 45, objective: "Saúde Metabólica", lastUpdate: "2026-02-20", status: "needs-update", planEnd: "2026-05-01" },
  { id: "4", name: "Pedro Lima", age: 35, objective: "Performance", lastUpdate: "2026-03-06", status: "active", planEnd: "2026-06-10" },
  { id: "5", name: "Carla Mendes", age: 29, objective: "Recomposição Corporal", lastUpdate: "2026-02-15", status: "needs-update", planEnd: "2026-03-30" },
  { id: "6", name: "Lucas Oliveira", age: 40, objective: "Emagrecimento", lastUpdate: "2026-03-04", status: "active", planEnd: "2026-04-20" },
];

const stats = [
  { label: "Pacientes Ativos", value: "47", icon: Users, color: "text-primary" },
  { label: "Dietas Ativas", value: "42", icon: Utensils, color: "text-success" },
  { label: "Treinos Ativos", value: "38", icon: Dumbbell, color: "text-warning" },
  { label: "Exames Pendentes", value: "5", icon: FlaskConical, color: "text-destructive" },
];

const AdminDashboard = () => {
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const filteredPatients = mockPatients.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const needsUpdate = mockPatients.filter((p) => p.status === "needs-update");

  return (
    <div className="space-y-8 stagger-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Visão geral dos seus pacientes</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2">
          <Plus className="w-4 h-4" />
          Novo Paciente
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="glass-card p-5">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl bg-secondary flex items-center justify-center ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="glass-card p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Ações Rápidas</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { icon: Utensils, label: "Criar Dieta", color: "bg-success/10 text-success border-success/20" },
            { icon: Dumbbell, label: "Criar Treino", color: "bg-warning/10 text-warning border-warning/20" },
            { icon: FlaskConical, label: "Adicionar Exame", color: "bg-primary/10 text-primary border-primary/20" },
            { icon: FileText, label: "Nova Prescrição", color: "bg-destructive/10 text-destructive border-destructive/20" },
          ].map((action) => (
            <button
              key={action.label}
              className={`flex items-center gap-3 p-4 rounded-xl border transition-all duration-200 hover:scale-[1.02] ${action.color}`}
            >
              <action.icon className="w-5 h-5" />
              <span className="text-sm font-medium">{action.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Patient List */}
        <div className="lg:col-span-2 glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">Pacientes</h2>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar paciente..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 bg-secondary/50 border-glass-border h-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            {filteredPatients.map((patient) => (
              <button
                key={patient.id}
                onClick={() => navigate(`/admin/patients/${patient.id}`)}
                className="w-full flex items-center justify-between p-4 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-all duration-200 group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-sm font-bold text-primary">
                    {patient.name.charAt(0)}
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">{patient.name}</p>
                    <p className="text-xs text-muted-foreground">{patient.objective} · {patient.age} anos</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Plano até</p>
                  <p className="text-xs font-medium text-foreground">{new Date(patient.planEnd).toLocaleDateString("pt-BR")}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Sidebar: Needs Update */}
        <div className="space-y-6">
          <div className="glass-card p-6">
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle className="w-5 h-5 text-warning" />
              <h2 className="text-lg font-semibold text-foreground">Precisam Atualização</h2>
            </div>
            <div className="space-y-3">
              {needsUpdate.map((p) => (
                <div key={p.id} className="flex items-center gap-3 p-3 rounded-xl bg-warning/5 border border-warning/10">
                  <div className="w-8 h-8 rounded-full bg-warning/10 flex items-center justify-center text-xs font-bold text-warning">
                    {p.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{p.name}</p>
                    <p className="text-xs text-muted-foreground">Última: {new Date(p.lastUpdate).toLocaleDateString("pt-BR")}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card p-6">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">Atividade Recente</h2>
            </div>
            <div className="space-y-3">
              {[
                { text: "Dieta atualizada - Maria Silva", time: "2h atrás" },
                { text: "Exame adicionado - Pedro Lima", time: "5h atrás" },
                { text: "Treino criado - João Santos", time: "1 dia atrás" },
              ].map((activity, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0" />
                  <div>
                    <p className="text-sm text-foreground">{activity.text}</p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
