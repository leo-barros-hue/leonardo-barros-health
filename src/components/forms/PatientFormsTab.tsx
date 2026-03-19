import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, ChevronRight, ExternalLink } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import FormResponsesDialog from "./FormResponsesDialog";

interface PatientFormsTabProps {
  patientId: string;
}

interface Assignment {
  id: string;
  form_template_id: string;
  form_name: string;
  assigned_at: string;
  completed_at: string | null;
  access_token: string | null;
}

const PatientFormsTab = ({ patientId }: PatientFormsTabProps) => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewTemplate, setViewTemplate] = useState<{ id: string; name: string } | null>(null);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("form_assignments")
        .select("id, form_template_id, assigned_at, completed_at, access_token, form_templates(name)")
        .eq("patient_id", patientId)
        .order("assigned_at", { ascending: false });

      if (data) {
        setAssignments(
          data.map((a: any) => ({
            id: a.id,
            form_template_id: a.form_template_id,
            form_name: a.form_templates?.name || "Formulário",
            assigned_at: a.assigned_at,
            completed_at: a.completed_at,
            access_token: a.access_token,
          }))
        );
      }
      setLoading(false);
    };
    load();
  }, [patientId]);

  if (loading) return <p className="text-muted-foreground text-center py-8">Carregando...</p>;

  if (assignments.length === 0) {
    return (
      <div className="glass-card p-12 text-center">
        <FileText className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
        <p className="text-muted-foreground">Nenhum formulário enviado para este paciente</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {assignments.map((a) => (
          <div key={a.id} className="glass-card p-4 flex items-center gap-3">
            <FileText className="w-5 h-5 text-muted-foreground shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{a.form_name}</p>
              <p className="text-xs text-muted-foreground">
                Enviado em {format(new Date(a.assigned_at), "dd/MM/yyyy", { locale: ptBR })}
              </p>
            </div>
            {a.completed_at ? (
              <>
                <Badge variant="secondary" className="text-xs bg-green-500/10 text-green-600 border-green-500/20">Respondido</Badge>
                <Button variant="ghost" size="sm" className="text-xs gap-1" onClick={() => setViewTemplate({ id: a.form_template_id, name: a.form_name })}>
                  Ver <ChevronRight className="w-3 h-3" />
                </Button>
              </>
            ) : (
              <>
                <Badge variant="secondary" className="text-xs">Pendente</Badge>
                {a.access_token && (
                  <Button variant="ghost" size="sm" className="text-xs gap-1" onClick={() => window.open(`/form/${a.access_token}`, "_blank")}>
                    <ExternalLink className="w-3 h-3" /> Link
                  </Button>
                )}
              </>
            )}
          </div>
        ))}
      </div>
      <FormResponsesDialog
        open={!!viewTemplate}
        onOpenChange={() => setViewTemplate(null)}
        templateId={viewTemplate?.id || null}
        templateName={viewTemplate?.name || ""}
      />
    </>
  );
};

export default PatientFormsTab;
