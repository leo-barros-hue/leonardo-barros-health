import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Users, UserX, AlertTriangle, CalendarClock, UserPlus,
  Search, ExternalLink, RefreshCw, TrendingUp,
  AlertCircle, ChevronRight
} from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

interface Patient {
  id: string;
  name: string;
  phone: string | null;
  birth_date: string | null;
  objective: string | null;
  created_at: string;
  updated_at: string;
}

interface PatientPlan {
  patient_id: string;
  plan_starts_at: string | null;
  plan_expires_at: string | null;
}

type StatusType = "active" | "upcoming" | "overdue" | "inactive";

const STATUS_CONFIG: Record<StatusType, { label: string; color: string; bg: string; border: string; dot: string }> = {
  active: { label: "Ativo", color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20", dot: "bg-emerald-500" },
  upcoming: { label: "Próximo", color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20", dot: "bg-amber-500" },
  overdue: { label: "Atrasado", color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20", dot: "bg-red-500" },
  inactive: { label: "Inativo", color: "text-muted-foreground", bg: "bg-muted/10", border: "border-muted/20", dot: "bg-muted-foreground" },
};

const getPatientStatus = (patient: Patient, plan?: PatientPlan): StatusType => {
  const now = new Date();
  if (plan?.plan_expires_at) {
    const expires = new Date(plan.plan_expires_at);
    const daysUntilExpiry = (expires.getTime() - now.getTime()) / 86400000;
    if (daysUntilExpiry < -30) return "inactive";
    if (daysUntilExpiry < 0) return "overdue";
    if (daysUntilExpiry <= 7) return "upcoming";
    return "active";
  }
  const daysSinceUpdate = (now.getTime() - new Date(patient.updated_at).getTime()) / 86400000;
  if (daysSinceUpdate > 90) return "inactive";
  if (daysSinceUpdate > 30) return "overdue";
  if (daysSinceUpdate > 21) return "upcoming";
  return "active";
};

const AdminDashboard = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [plans, setPlans] = useState<PatientPlan[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusType | "all">("all");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const [pRes, plRes] = await Promise.all([
        supabase.from("patients").select("id, name, phone, birth_date, objective, created_at, updated_at").order("name"),
        supabase.from("patient_plans").select("patient_id, plan_starts_at, plan_expires_at"),
      ]);
      setPatients((pRes.data as Patient[]) || []);
      setPlans((plRes.data as PatientPlan[]) || []);
    };
    fetchData();
  }, []);

  const planMap = useMemo(() => {
    const m = new Map<string, PatientPlan>();
    plans.forEach((p) => m.set(p.patient_id, p));
    return m;
  }, [plans]);

  const patientStatuses = useMemo(() => {
    const m = new Map<string, StatusType>();
    patients.forEach((p) => m.set(p.id, getPatientStatus(p, planMap.get(p.id))));
    return m;
  }, [patients, planMap]);

  const counts = useMemo(() => {
    const c = { active: 0, upcoming: 0, overdue: 0, inactive: 0, newLast30: 0 };
    const thirtyDaysAgo = Date.now() - 30 * 86400000;
    patients.forEach((p) => {
      const s = patientStatuses.get(p.id)!;
      c[s]++;
      if (new Date(p.created_at).getTime() > thirtyDaysAgo) c.newLast30++;
    });
    return c;
  }, [patients, patientStatuses]);

  const filteredPatients = useMemo(() => {
    return patients
      .filter((p) => {
        if (statusFilter !== "all" && patientStatuses.get(p.id) !== statusFilter) return false;
        if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
        return true;
      })
      .sort((a, b) => {
        const order: Record<StatusType, number> = { overdue: 0, upcoming: 1, active: 2, inactive: 3 };
        return order[patientStatuses.get(a.id)!] - order[patientStatuses.get(b.id)!];
      });
  }, [patients, patientStatuses, statusFilter, search]);

  const pieData = useMemo(() => [
    { name: "Ativos", value: counts.active, color: "hsl(152, 69%, 45%)" },
    { name: "Próximos", value: counts.upcoming, color: "hsl(38, 92%, 50%)" },
    { name: "Atrasados", value: counts.overdue, color: "hsl(0, 72%, 50%)" },
    { name: "Inativos", value: counts.inactive, color: "hsl(215, 20%, 65%)" },
  ].filter(d => d.value > 0), [counts]);

  const monthlyData = useMemo(() => {
    const months: { name: string; count: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const label = d.toLocaleDateString("pt-BR", { month: "short" }).replace(".", "");
      const start = new Date(d.getFullYear(), d.getMonth(), 1);
      const end = new Date(d.getFullYear(), d.getMonth() + 1, 0);
      const count = patients.filter((p) => {
        const c = new Date(p.created_at);
        return c >= start && c <= end;
      }).length;
      months.push({ name: label, count });
    }
    return months;
  }, [patients]);

  const alertPatients = useMemo(() => {
    return patients
      .filter((p) => {
        const s = patientStatuses.get(p.id);
        return s === "overdue" || s === "inactive";
      })
      .sort((a, b) => new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime())
      .slice(0, 5);
  }, [patients, patientStatuses]);

  const statCards = [
    { label: "Pacientes Ativos", value: counts.active, icon: Users, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
    { label: "Inativos", value: counts.inactive, icon: UserX, color: "text-muted-foreground", bg: "bg-muted/10", border: "border-muted/20" },
    { label: "Atrasados", value: counts.overdue, icon: AlertTriangle, color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20" },
    { label: "Próximos de Atualização", value: counts.upcoming, icon: CalendarClock, color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" },
    { label: "Novos (30 dias)", value: counts.newLast30, icon: UserPlus, color: "text-primary", bg: "bg-primary/10", border: "border-primary/20" },
  ];

  const filterButtons: { label: string; value: StatusType | "all" }[] = [
    { label: "Todos", value: "all" },
    { label: "Ativos", value: "active" },
    { label: "Próximos", value: "upcoming" },
    { label: "Atrasados", value: "overdue" },
    { label: "Inativos", value: "inactive" },
  ];

  const getNextUpdate = (p: Patient) => {
    const plan = planMap.get(p.id);
    if (plan?.plan_expires_at) return new Date(plan.plan_expires_at).toLocaleDateString("pt-BR");
    return "—";
  };

  return (
    <div className="space-y-6 stagger-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Painel estratégico de acompanhamento</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {statCards.map((stat) => (
          <div key={stat.label} className={`glass-card p-5 border ${stat.border}`}>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-[11px] text-muted-foreground leading-tight">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts + Alerts */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Pie Chart */}
        <div className="glass-card p-6">
          <h2 className="text-base font-semibold text-foreground mb-4">Distribuição por Status</h2>
          {pieData.length > 0 ? (
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={3} dataKey="value">
                    {pieData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} stroke="transparent" />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => [`${value} pacientes`, ""]} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">Nenhum dado disponível</p>
          )}
          <div className="flex flex-wrap gap-3 mt-3 justify-center">
            {pieData.map((d) => (
              <div key={d.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                {d.name} ({d.value})
              </div>
            ))}
          </div>
        </div>

        {/* Bar Chart */}
        <div className="glass-card p-6">
          <h2 className="text-base font-semibold text-foreground mb-4">Novos Pacientes (6 meses)</h2>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                <Tooltip formatter={(value: number) => [`${value}`, "Pacientes"]} />
                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Alerts */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="w-5 h-5 text-destructive" />
            <h2 className="text-base font-semibold text-foreground">Atenção Prioritária</h2>
          </div>
          {alertPatients.length > 0 ? (
            <div className="space-y-2">
              {alertPatients.map((p) => {
                const status = patientStatuses.get(p.id)!;
                const cfg = STATUS_CONFIG[status];
                return (
                  <button
                    key={p.id}
                    onClick={() => navigate(`/admin/patients/${p.id}`)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl ${cfg.bg} border ${cfg.border} hover:scale-[1.01] transition-transform text-left`}
                  >
                    <div className={`w-8 h-8 rounded-full ${cfg.bg} flex items-center justify-center text-xs font-bold ${cfg.color}`}>
                      {p.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{p.name}</p>
                      <p className="text-[11px] text-muted-foreground">
                        Última: {new Date(p.updated_at).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                    <span className={`text-[10px] font-semibold uppercase ${cfg.color}`}>{cfg.label}</span>
                  </button>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">Nenhum alerta no momento 🎉</p>
          )}
        </div>
      </div>

      {/* Patient List */}
      <div className="glass-card p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <h2 className="text-lg font-semibold text-foreground">Lista de Pacientes</h2>
          <div className="flex items-center gap-3">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar paciente..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 bg-secondary/50 border-glass-border h-9"
              />
            </div>
          </div>
        </div>

        {/* Filter chips */}
        <div className="flex flex-wrap gap-2 mb-4">
          {filterButtons.map((f) => (
            <button
              key={f.value}
              onClick={() => setStatusFilter(f.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                statusFilter === f.value
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary/50 text-muted-foreground hover:text-foreground hover:bg-secondary"
              }`}
            >
              {f.label}
              {f.value !== "all" && (
                <span className="ml-1 opacity-70">
                  ({counts[f.value as StatusType]})
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left text-xs font-medium text-muted-foreground pb-3 pl-2">Paciente</th>
                <th className="text-left text-xs font-medium text-muted-foreground pb-3">Status</th>
                <th className="text-left text-xs font-medium text-muted-foreground pb-3 hidden md:table-cell">Última Atualização</th>
                <th className="text-left text-xs font-medium text-muted-foreground pb-3 hidden lg:table-cell">Próxima Atualização</th>
                <th className="text-right text-xs font-medium text-muted-foreground pb-3 pr-2">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredPatients.map((p) => {
                const status = patientStatuses.get(p.id)!;
                const cfg = STATUS_CONFIG[status];
                return (
                  <tr key={p.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                    <td className="py-3 pl-2">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-sm font-bold text-primary">
                          {p.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">{p.name}</p>
                          <p className="text-[11px] text-muted-foreground">{p.objective || "—"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${cfg.bg} ${cfg.color} border ${cfg.border}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                        {cfg.label}
                      </span>
                    </td>
                    <td className="py-3 hidden md:table-cell">
                      <p className="text-sm text-foreground">{new Date(p.updated_at).toLocaleDateString("pt-BR")}</p>
                    </td>
                    <td className="py-3 hidden lg:table-cell">
                      <p className="text-sm text-foreground">{getNextUpdate(p)}</p>
                    </td>
                    <td className="py-3 pr-2">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/admin/patients/${p.id}`)}
                          className="h-8 px-2 text-xs"
                        >
                          <ExternalLink className="w-3.5 h-3.5 mr-1" />
                          Abrir
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredPatients.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-sm text-muted-foreground">
                    Nenhum paciente encontrado
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
