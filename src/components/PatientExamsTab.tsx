import { FlaskConical } from "lucide-react";

interface Props {
  patientId: string;
}

const PatientExamsTab = ({ patientId }: Props) => {
  return (
    <div className="space-y-6">
      <div className="glass-card p-8 text-center">
        <FlaskConical className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">Exames Laboratoriais</h3>
        <p className="text-sm text-muted-foreground">
          Módulo em construção.
        </p>
      </div>
    </div>
  );
};

export default PatientExamsTab;
