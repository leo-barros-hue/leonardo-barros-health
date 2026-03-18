import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import PatientProfileHeader from "@/components/PatientProfileHeader";
import PatientEvolutionTab from "@/components/PatientEvolutionTab";
import PatientEnergyTab from "@/components/PatientEnergyTab";
import PatientDietTab from "@/components/PatientDietTab";
import PatientWorkoutTab from "@/components/PatientWorkoutTab";
import PatientExamsTab from "@/components/PatientExamsTab";
import PatientPrescriptionsTab from "@/components/PatientPrescriptionsTab";
import AnamnesisTab from "@/components/anamnesis/AnamnesisTab";

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

const AdminPatientDetail = () => {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState("evolution");
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
      <div className="text-center py-12 text-muted-foreground">Paciente não encontrado.</div>
    );
  }

  return (
    <div className="space-y-6 stagger-fade-in">
      <PatientProfileHeader
        patient={patient}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* Tab Content */}
      <div className="px-1">
        {activeTab === "evolution" && (
          <PatientEvolutionTab patientId={patient.id} />
        )}


        {activeTab === "anamnesis" && (
          <AnamnesisTab patientId={patient.id} />
        )}

        {activeTab === "assessments" && (
          <PatientEnergyTab patient={patient} />
        )}

        {activeTab === "diet" && (
          <PatientDietTab patientId={patient.id} />
        )}

        {activeTab === "workout" && (
          <PatientWorkoutTab patientId={patient.id} />
        )}

        {activeTab === "cardio" && (
          <PlaceholderTab title="Cardio" description="Módulo de cardio em desenvolvimento." />
        )}

        {activeTab === "exams" && (
          <PatientExamsTab patientId={patient.id} />
        )}

        {activeTab === "prescriptions" && (
          <PlaceholderTab title="Prescrições" description="Módulo de prescrições em desenvolvimento." />
        )}

        {activeTab === "photos" && (
          <PlaceholderTab title="Fotos" description="Módulo de fotos em desenvolvimento." />
        )}

        {activeTab === "notes" && (
          <PlaceholderTab title="Notas" description="Módulo de notas em desenvolvimento." />
        )}
      </div>
    </div>
  );
};

function PlaceholderTab({ title, description }: { title: string; description: string }) {
  return (
    <div className="glass-card p-8 text-center">
      <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

function ScheduleTabPlaceholder({ patientId }: { patientId: string }) {
  const [dates, setDates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from("patient_schedule_dates")
        .select("*")
        .eq("patient_id", patientId)
        .order("scheduled_date", { ascending: true });
      setDates(data || []);
      setLoading(false);
    };
    fetch();
  }, [patientId]);

  if (loading) return <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="glass-card p-6">
      <h3 className="text-lg font-semibold text-foreground mb-4">Próximas Atualizações</h3>
      {dates.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nenhuma data agendada.</p>
      ) : (
        <div className="space-y-2">
          {dates.map((d: any) => (
            <div key={d.id} className="flex items-center gap-3 p-3 rounded-xl bg-secondary/30">
              <span className="text-sm font-medium text-foreground">
                {new Date(d.scheduled_date).toLocaleDateString("pt-BR")}
              </span>
              <span className="text-xs text-muted-foreground">{d.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AdminPatientDetail;
