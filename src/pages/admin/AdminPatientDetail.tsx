import { ArrowLeft, User, Utensils, Dumbbell, FlaskConical, FileText, TrendingUp } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

const tabs = [
  { id: "overview", label: "Visão Geral", icon: User },
  { id: "diet", label: "Dieta", icon: Utensils },
  { id: "workout", label: "Treino", icon: Dumbbell },
  { id: "evolution", label: "Evolução", icon: TrendingUp },
  { id: "exams", label: "Exames", icon: FlaskConical },
  { id: "prescriptions", label: "Prescrições", icon: FileText },
];

const mockPatient = {
  name: "Maria Silva",
  age: 32,
  sex: "Feminino",
  height: "1.65m",
  weight: "78.5 kg",
  objective: "Emagrecimento",
  medications: "Nenhuma",
  allergies: "Frutos do mar",
  familyHistory: "Diabetes tipo 2 (mãe), Hipertensão (pai)",
  previousDiseases: "Nenhuma",
};

import { useState } from "react";

const AdminPatientDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="space-y-6 stagger-fade-in">
      <button onClick={() => navigate("/admin/patients")} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm">
        <ArrowLeft className="w-4 h-4" /> Voltar
      </button>

      {/* Patient Header */}
      <div className="glass-card p-6 flex items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-2xl font-bold text-primary">
          {mockPatient.name.charAt(0)}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">{mockPatient.name}</h1>
          <p className="text-muted-foreground">{mockPatient.objective} · {mockPatient.age} anos · {mockPatient.sex}</p>
        </div>
      </div>

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
            {Object.entries({
              "Nome": mockPatient.name,
              "Idade": `${mockPatient.age} anos`,
              "Sexo": mockPatient.sex,
              "Altura": mockPatient.height,
              "Peso Inicial": mockPatient.weight,
              "Objetivo": mockPatient.objective,
              "Medicações": mockPatient.medications,
              "Alergias": mockPatient.allergies,
              "Histórico Familiar": mockPatient.familyHistory,
              "Doenças Prévias": mockPatient.previousDiseases,
            }).map(([key, value]) => (
              <div key={key} className="bg-secondary/30 rounded-xl p-4">
                <p className="text-xs text-muted-foreground mb-1">{key}</p>
                <p className="text-sm font-medium text-foreground">{value}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "diet" && (
        <div className="glass-card p-6">
          <h2 className="text-lg font-bold text-foreground mb-2">Dieta Atual</h2>
          <p className="text-muted-foreground text-sm">Dieta Hipercalórica - Fase 2</p>
          <p className="text-sm text-muted-foreground mt-4">Página completa de gerenciamento de dieta será conectada ao backend.</p>
        </div>
      )}

      {activeTab === "workout" && (
        <div className="glass-card p-6">
          <h2 className="text-lg font-bold text-foreground mb-2">Treino Atual</h2>
          <p className="text-muted-foreground text-sm">Divisão A/B/C/D — Fase Hipertrofia</p>
          <p className="text-sm text-muted-foreground mt-4">Página completa de gerenciamento de treinos será conectada ao backend.</p>
        </div>
      )}

      {activeTab === "evolution" && (
        <div className="glass-card p-6">
          <h2 className="text-lg font-bold text-foreground mb-2">Evolução Física</h2>
          <p className="text-sm text-muted-foreground">Gráficos e timeline de evolução serão conectados ao backend.</p>
        </div>
      )}

      {activeTab === "exams" && (
        <div className="glass-card p-6">
          <h2 className="text-lg font-bold text-foreground mb-2">Exames Laboratoriais</h2>
          <p className="text-sm text-muted-foreground">Exames e interpretações serão conectados ao backend.</p>
        </div>
      )}

      {activeTab === "prescriptions" && (
        <div className="glass-card p-6">
          <h2 className="text-lg font-bold text-foreground mb-2">Prescrições</h2>
          <p className="text-sm text-muted-foreground">Prescrições médicas serão conectadas ao backend.</p>
        </div>
      )}
    </div>
  );
};

export default AdminPatientDetail;
