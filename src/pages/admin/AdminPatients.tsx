import { Search, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const mockPatients = [
  { id: "1", name: "Maria Silva", age: 32, sex: "F", objective: "Emagrecimento", lastUpdate: "2026-03-05", status: "active" },
  { id: "2", name: "João Santos", age: 28, sex: "M", objective: "Hipertrofia", lastUpdate: "2026-03-01", status: "active" },
  { id: "3", name: "Ana Costa", age: 45, sex: "F", objective: "Saúde Metabólica", lastUpdate: "2026-02-20", status: "needs-update" },
  { id: "4", name: "Pedro Lima", age: 35, sex: "M", objective: "Performance", lastUpdate: "2026-03-06", status: "active" },
  { id: "5", name: "Carla Mendes", age: 29, sex: "F", objective: "Recomposição Corporal", lastUpdate: "2026-02-15", status: "needs-update" },
  { id: "6", name: "Lucas Oliveira", age: 40, sex: "M", objective: "Emagrecimento", lastUpdate: "2026-03-04", status: "active" },
  { id: "7", name: "Fernanda Reis", age: 33, sex: "F", objective: "Hipertrofia", lastUpdate: "2026-03-03", status: "active" },
  { id: "8", name: "Ricardo Alves", age: 50, sex: "M", objective: "Saúde Metabólica", lastUpdate: "2026-02-28", status: "active" },
];

const AdminPatients = () => {
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const filtered = mockPatients.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 stagger-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Pacientes</h1>
          <p className="text-muted-foreground mt-1">{mockPatients.length} pacientes cadastrados</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2">
          <Plus className="w-4 h-4" />
          Novo Paciente
        </Button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Buscar paciente..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 bg-secondary/50 border-glass-border h-11"
        />
      </div>

      <div className="grid gap-3">
        {filtered.map((patient) => (
          <button
            key={patient.id}
            onClick={() => navigate(`/admin/patients/${patient.id}`)}
            className="glass-card-hover w-full flex items-center justify-between p-5 text-left group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-lg font-bold text-primary">
                {patient.name.charAt(0)}
              </div>
              <div>
                <p className="font-semibold text-foreground group-hover:text-primary transition-colors">{patient.name}</p>
                <p className="text-sm text-muted-foreground">{patient.objective} · {patient.age} anos · {patient.sex}</p>
              </div>
            </div>
            <div className="text-right hidden sm:block">
              <p className="text-xs text-muted-foreground">Última atualização</p>
              <p className="text-sm text-foreground">{new Date(patient.lastUpdate).toLocaleDateString("pt-BR")}</p>
              {patient.status === "needs-update" && (
                <span className="inline-flex mt-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-warning/10 text-warning border border-warning/20">
                  Precisa atualização
                </span>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default AdminPatients;
