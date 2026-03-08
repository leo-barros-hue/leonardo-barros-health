import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import NewPatientDialog from "@/components/NewPatientDialog";

interface Patient {
  id: string;
  name: string;
  birth_date: string | null;
  sex: string | null;
  objective: string | null;
  cpf: string | null;
  email: string | null;
  phone: string | null;
  updated_at: string;
}

const AdminPatients = () => {
  const [search, setSearch] = useState("");
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchPatients = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("patients")
      .select("id, name, age, sex, objective, cpf, email, phone, updated_at")
      .order("created_at", { ascending: false });
    setPatients((data as Patient[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchPatients(); }, []);

  const filtered = patients.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.cpf && p.cpf.includes(search.replace(/\D/g, "")))
  );

  return (
    <div className="space-y-6 stagger-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Pacientes</h1>
          <p className="text-muted-foreground mt-1">{patients.length} pacientes cadastrados</p>
        </div>
        <NewPatientDialog onPatientCreated={fetchPatients} />
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome ou CPF..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 bg-secondary/50 border-glass-border h-11"
        />
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Carregando pacientes...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          {search ? "Nenhum paciente encontrado" : "Nenhum paciente cadastrado ainda"}
        </div>
      ) : (
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
                  <p className="text-sm text-muted-foreground">
                    {patient.objective || "Sem objetivo"} · {patient.age ? `${patient.age} anos` : "—"} · {patient.sex || "—"}
                  </p>
                </div>
              </div>
              <div className="text-right hidden sm:block">
                <p className="text-xs text-muted-foreground">Última atualização</p>
                <p className="text-sm text-foreground">{new Date(patient.updated_at).toLocaleDateString("pt-BR")}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminPatients;
