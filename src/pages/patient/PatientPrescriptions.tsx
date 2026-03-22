import { useState, useEffect } from "react";
import { ArrowLeft, Download, FileText, File, Eye, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface Prescription {
  id: string;
  title: string;
  content: string;
  prescribed_at: string;
  type: string;
  pdf_url: string | null;
  pdf_file_name: string | null;
}

const PatientPrescriptions = () => {
  const navigate = useNavigate();
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewPdfUrl, setViewPdfUrl] = useState<string | null>(null);
  const [viewManual, setViewManual] = useState<Prescription | null>(null);

  useEffect(() => {
    const fetchPrescriptions = async () => {
      // Get patient ID from current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: patient } = await supabase
        .from("patients")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (!patient) return;

      const { data } = await supabase
        .from("prescriptions")
        .select("*")
        .eq("patient_id", patient.id)
        .order("prescribed_at", { ascending: false });

      setPrescriptions((data as Prescription[]) || []);
      setLoading(false);
    };
    fetchPrescriptions();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6 stagger-fade-in">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm">
        <ArrowLeft className="w-4 h-4" /> Voltar
      </button>

      <h1 className="text-2xl font-bold text-foreground">Prescrições Médicas</h1>

      {prescriptions.length === 0 ? (
        <div className="glass-card p-8 text-center">
          <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">Nenhuma prescrição</h3>
          <p className="text-sm text-muted-foreground">Você ainda não possui prescrições registradas.</p>
        </div>
      ) : (
        prescriptions.map((rx) => (
          <div key={rx.id} className="glass-card p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  rx.type === "pdf" ? "bg-red-500/10 border border-red-500/20" : "bg-primary/10 border border-primary/20"
                }`}>
                  {rx.type === "pdf" ? (
                    <File className="w-5 h-5 text-red-500" />
                  ) : (
                    <FileText className="w-5 h-5 text-primary" />
                  )}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-foreground">{rx.title}</h2>
                  <p className="text-sm text-muted-foreground">
                    {new Date(rx.prescribed_at + "T12:00:00").toLocaleDateString("pt-BR")}
                    {rx.type === "pdf" && " • Receita PDF"}
                  </p>
                </div>
              </div>
              {rx.type === "pdf" && rx.pdf_url && (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="gap-2" onClick={() => setViewPdfUrl(rx.pdf_url)}>
                    <Eye className="w-4 h-4" />
                    Ver
                  </Button>
                  <Button variant="outline" size="sm" className="gap-2" asChild>
                    <a href={rx.pdf_url} target="_blank" rel="noopener noreferrer" download>
                      <Download className="w-4 h-4" />
                      PDF
                    </a>
                  </Button>
                </div>
              )}
              {rx.type === "manual" && (
                <Button variant="outline" size="sm" className="gap-2" onClick={() => setViewManual(rx)}>
                  <Eye className="w-4 h-4" />
                  Ver completo
                </Button>
              )}
            </div>

            {rx.type === "manual" && rx.content && (
              <div className="bg-secondary/30 rounded-xl p-4">
                <div
                  className="text-sm text-foreground prose prose-sm max-w-none line-clamp-4"
                  dangerouslySetInnerHTML={{ __html: rx.content }}
                />
              </div>
            )}

            {rx.type === "pdf" && rx.pdf_file_name && (
              <div className="bg-secondary/30 rounded-xl p-4 flex items-center gap-3">
                <File className="w-5 h-5 text-red-500 shrink-0" />
                <span className="text-sm text-foreground">{rx.pdf_file_name}</span>
              </div>
            )}
          </div>
        ))
      )}

      {/* PDF Viewer Dialog */}
      <Dialog open={!!viewPdfUrl} onOpenChange={() => setViewPdfUrl(null)}>
        <DialogContent className="max-w-4xl h-[80vh]">
          <DialogHeader>
            <DialogTitle>Receita Médica</DialogTitle>
          </DialogHeader>
          {viewPdfUrl && (
            <iframe src={viewPdfUrl} className="w-full flex-1 rounded-lg" title="PDF Viewer" />
          )}
        </DialogContent>
      </Dialog>

      {/* Manual Prescription Viewer */}
      <Dialog open={!!viewManual} onOpenChange={() => setViewManual(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{viewManual?.title}</DialogTitle>
          </DialogHeader>
          {viewManual && (
            <div className="mt-2">
              <p className="text-xs text-muted-foreground mb-3">
                {new Date(viewManual.prescribed_at + "T12:00:00").toLocaleDateString("pt-BR")}
              </p>
              <div
                className="prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: viewManual.content }}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PatientPrescriptions;
