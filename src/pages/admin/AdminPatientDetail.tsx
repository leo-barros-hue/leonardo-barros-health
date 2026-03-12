import { ArrowLeft, User, Utensils, Dumbbell, FlaskConical, FileText, TrendingUp, Loader2, Calculator } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import PatientEvolutionTab from "@/components/PatientEvolutionTab";
import PatientEnergyTab from "@/components/PatientEnergyTab";
import PatientDietTab from "@/components/PatientDietTab";
import PatientWorkoutTab from "@/components/PatientWorkoutTab";
import PatientExamsTab from "@/components/PatientExamsTab";
import PatientPrescriptionsTab from "@/components/PatientPrescriptionsTab";
import PatientInfoHeader from "@/components/PatientInfoHeader";

const tabs = [
  { id: "overview", label: "Visão Geral", icon: User },
  { id: "energy", label: "Gasto Calórico", icon: Calculator },
  { id: "diet", label: "Dieta", icon: Utensils },
  { id: "workout", label: "Treino", icon: Dumbbell },
  { id: "evolution", label: "Evolução", icon: TrendingUp },
  { id: "exams", label: "Exames", icon: FlaskConical },
  { id: "prescriptions", label: "Prescrições", icon: FileText },
];

interface Patient {
  id: string;
  name: string;
  cpf: string | null;
  email: string | null;
  phone: string | null;
  birth_date: string | null;
  sex: string | null;
  objective: string | null;
  created_at: string;
  updated_at: string;
}

const calculateAge = (birthDate: string | null): string => {
  if (!birthDate) return "—";
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return `${age} anos`;
};

const formatCPF = (cpf: string | null) => {
  if (!cpf) return "—";
  const d = cpf.replace(/\D/g, "");
  if (d.length !== 11) return cpf;
  return `${d.slice(0,3)}.${d.slice(3,6)}.${d.slice(6,9)}-${d.slice(9)}`;
};

const formatPhone = (phone: string | null) => {
  if (!phone) return "—";
  const d = phone.replace(/\D/g, "");
  if (d.length === 11) return `(${d.slice(0,2)}) ${d.slice(2,7)}-${d.slice(7)}`;
  if (d.length === 10) return `(${d.slice(0,2)}) ${d.slice(2,6)}-${d.slice(6)}`;
  return phone;
};

const formatDate = (date: string | null) => {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("pt-BR");
};

const AdminPatientDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState("overview");
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPatient = async () => {
      if (!id) return;
      const { data } = await supabase
        .from("patients")
        .select("*")
        .eq("id", id)
        .single();
      setPatient(data as Patient | null);
      setLoading(false);
    };
    fetchPatient();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="space-y-4 stagger-fade-in">
        <button onClick={() => navigate("/admin/patients")} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm">
          <ArrowLeft className="w-4 h-4" /> Voltar
        </button>
        <div className="text-center py-12 text-muted-foreground">Paciente não encontrado.</div>
      </div>
    );
  }

  const sexLabel = patient.sex === "M" ? "Masculino" : patient.sex === "F" ? "Feminino" : "—";

  const overviewFields = [
    { label: "Nome", value: patient.name },
    { label: "CPF", value: formatCPF(patient.cpf) },
    { label: "E-mail", value: patient.email || "—" },
    { label: "Telefone", value: formatPhone(patient.phone) },
    { label: "Data de Nascimento", value: formatDate(patient.birth_date) },
    { label: "Idade", value: calculateAge(patient.birth_date) },
    { label: "Sexo", value: sexLabel },
    { label: "Objetivo", value: patient.objective || "Não definido" },
  ];

  return (
    <div className="space-y-6 stagger-fade-in">
      <button onClick={() => navigate("/admin/patients")} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm">
        <ArrowLeft className="w-4 h-4" /> Voltar
      </button>

      {/* Patient Header */}
      <PatientInfoHeader patient={patient} />

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? "bg-primary text-primary-foreground"
                : "bg-secondary/50 text-muted-foreground hover:text-foreground"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && (
        <div className="glass-card p-6">
          <h2 className="text-lg font-bold text-foreground mb-4">Dados Básicos</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {overviewFields.map(({ label, value }) => (
              <div key={label} className="bg-secondary/30 rounded-xl p-4">
                <p className="text-xs text-muted-foreground mb-1">{label}</p>
                <p className="text-sm font-medium text-foreground">{value}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "energy" && (
        <PatientEnergyTab patient={patient} />
      )}

      {activeTab === "diet" && (
        <PatientDietTab patientId={patient.id} />
      )}

      {activeTab === "workout" && (
        <PatientWorkoutTab patientId={patient.id} />
      )}

      {activeTab === "evolution" && (
        <PatientEvolutionTab patientId={patient.id} />
      )}

      {activeTab === "exams" && (
        <PatientExamsTab patientId={patient.id} />
      )}

      {activeTab === "prescriptions" && (
        <PatientPrescriptionsTab patientId={patient.id} />
      )}
    </div>
  );
};

export default AdminPatientDetail;
