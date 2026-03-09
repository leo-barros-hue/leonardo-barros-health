import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Plus, Trash2, FileText, Eye, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import PrescriptionDialog from "@/components/prescriptions/PrescriptionDialog";

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
  const [viewPrescription, setViewPrescription] = useState<Prescription | null>(null);

  // Dialog states
  const [prescriptionDialogOpen, setPrescriptionDialogOpen] = useState(false);
  const [editingPrescription, setEditingPrescription] = useState<Prescription | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);

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

  const handleDeletePrescription = async (id: string) => {
    if (!confirm("Excluir esta prescrição?")) return;
    const { error } = await supabase.from("prescriptions").delete().eq("id", id);
    if (error) {
      toast.error("Erro ao excluir prescrição");
    } else {
      toast.success("Prescrição excluída");
      fetchPrescriptions();
    }
  };

  const openViewDialog = (prescription: Prescription) => {
    setViewPrescription(prescription);
    setViewDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-foreground">Prescrições</h2>
        <Button onClick={() => { setEditingPrescription(null); setPrescriptionDialogOpen(true); }} className="gap-2">
          <Plus className="w-4 h-4" />
          Nova Prescrição
        </Button>
      </div>

      {prescriptions.length === 0 ? (
        <div className="glass-card p-8 text-center">
          <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">Nenhuma prescrição</h3>
          <p className="text-sm text-muted-foreground">
            Clique em "Nova Prescrição" para começar.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {prescriptions.map((prescription) => (
            <div key={prescription.id} className="glass-card p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-foreground truncate">{prescription.title}</h4>
                <p className="text-xs text-muted-foreground">
                  {new Date(prescription.prescribed_at).toLocaleDateString("pt-BR")}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="outline" size="sm" onClick={() => openViewDialog(prescription)}>
                  <Eye className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => { setEditingPrescription(prescription); setPrescriptionDialogOpen(true); }}>
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => handleDeletePrescription(prescription.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* View Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{viewPrescription?.title}</DialogTitle>
          </DialogHeader>
          {viewPrescription && (
            <div className="mt-4">
              <p className="text-xs text-muted-foreground mb-3">
                Data: {new Date(viewPrescription.prescribed_at).toLocaleDateString("pt-BR")}
              </p>
              <div className="bg-secondary/30 rounded-xl p-4 whitespace-pre-wrap text-sm">
                {viewPrescription.content}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <PrescriptionDialog
        open={prescriptionDialogOpen}
        onOpenChange={setPrescriptionDialogOpen}
        patientId={patientId}
        prescription={editingPrescription}
        onSuccess={fetchPrescriptions}
      />
    </div>
  );
};

export default PatientPrescriptionsTab;
