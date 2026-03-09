import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Plus, Trash2, FileText, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";

interface Prescription {
  id: string;
  title: string;
  content: string;
  prescribed_at: string;
  created_at: string;
}

interface Props {
  patientId: string;
}

const PatientPrescriptionsTab = ({ patientId }: Props) => {
  const [loading, setLoading] = useState(true);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [viewPrescription, setViewPrescription] = useState<Prescription | null>(null);

  useEffect(() => {
    fetchPrescriptions();
  }, [patientId]);

  const fetchPrescriptions = async () => {
    const { data } = await supabase
      .from("prescriptions")
      .select("*")
      .eq("patient_id", patientId)
      .order("prescribed_at", { ascending: false });
    
    setPrescriptions(data || []);
    setLoading(false);
  };

  const createPrescription = async () => {
    if (!newTitle.trim() || !newContent.trim()) {
      toast.error("Preencha título e conteúdo");
      return;
    }

    const { error } = await supabase
      .from("prescriptions")
      .insert({
        patient_id: patientId,
        title: newTitle,
        content: newContent
      });

    if (error) {
      toast.error("Erro ao criar prescrição");
      return;
    }

    toast.success("Prescrição criada!");
    setNewTitle("");
    setNewContent("");
    setIsCreating(false);
    fetchPrescriptions();
  };

  const deletePrescription = async (id: string) => {
    await supabase.from("prescriptions").delete().eq("id", id);
    toast.success("Prescrição removida");
    fetchPrescriptions();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-foreground">Prescrições</h2>
        <Button onClick={() => setIsCreating(true)} disabled={isCreating}>
          <Plus className="w-4 h-4 mr-2" /> Nova Prescrição
        </Button>
      </div>

      {/* Create Form */}
      {isCreating && (
        <div className="glass-card p-4 space-y-3">
          <Input
            placeholder="Título da prescrição"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
          />
          <Textarea
            placeholder="Conteúdo da prescrição..."
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            rows={6}
          />
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setIsCreating(false)}>Cancelar</Button>
            <Button onClick={createPrescription}>Salvar</Button>
          </div>
        </div>
      )}

      {/* List */}
      {prescriptions.length === 0 && !isCreating ? (
        <div className="glass-card p-6 text-center">
          <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
          <h3 className="text-lg font-bold text-foreground mb-2">Nenhuma prescrição</h3>
          <p className="text-sm text-muted-foreground">Crie a primeira prescrição para este paciente.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {prescriptions.map((prescription) => (
            <div key={prescription.id} className="glass-card p-4 flex items-center gap-4">
              <FileText className="w-8 h-8 text-primary" />
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-foreground truncate">{prescription.title}</h4>
                <p className="text-xs text-muted-foreground">
                  {new Date(prescription.prescribed_at).toLocaleDateString("pt-BR")}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" onClick={() => setViewPrescription(prescription)}>
                      <Eye className="w-4 h-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>{prescription.title}</DialogTitle>
                    </DialogHeader>
                    <div className="mt-4">
                      <p className="text-xs text-muted-foreground mb-2">
                        Data: {new Date(prescription.prescribed_at).toLocaleDateString("pt-BR")}
                      </p>
                      <div className="bg-secondary/30 rounded-xl p-4 whitespace-pre-wrap text-sm">
                        {prescription.content}
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
                <Button variant="ghost" size="sm" onClick={() => deletePrescription(prescription.id)}>
                  <Trash2 className="w-4 h-4 text-muted-foreground" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PatientPrescriptionsTab;
