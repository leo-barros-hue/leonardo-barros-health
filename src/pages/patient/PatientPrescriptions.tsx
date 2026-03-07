import { ArrowLeft, Download, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const mockPrescriptions = [
  {
    id: "1",
    date: "2026-03-01",
    title: "Suplementação Geral",
    content: "1. Vitamina D3 — 10.000 UI/dia por 8 semanas, depois 5.000 UI/dia manutenção\n2. Ômega 3 — 2g/dia (EPA + DHA)\n3. Magnésio Dimalato — 300mg antes de dormir\n4. Creatina monohidratada — 5g/dia",
    hasPdf: true,
  },
  {
    id: "2",
    date: "2026-02-15",
    title: "Ajuste Hormonal",
    content: "1. Manter acompanhamento laboratorial a cada 3 meses\n2. Vitamina D abaixo do ideal — suplementar conforme prescrição\n3. Perfil lipídico melhorou — manter conduta alimentar",
    hasPdf: false,
  },
  {
    id: "3",
    date: "2026-01-10",
    title: "Orientações Terapêuticas",
    content: "1. Priorizar sono de 7-9h por noite\n2. Reduzir cafeína após 14h\n3. Manter hidratação de 35ml/kg/dia\n4. Incluir alimentos ricos em fibras (>30g/dia)",
    hasPdf: true,
  },
];

const PatientPrescriptions = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6 stagger-fade-in">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm">
        <ArrowLeft className="w-4 h-4" /> Voltar
      </button>

      <h1 className="text-2xl font-bold text-foreground">Prescrições Médicas</h1>

      {mockPrescriptions.map((rx) => (
        <div key={rx.id} className="glass-card p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-foreground">{rx.title}</h2>
                <p className="text-sm text-muted-foreground">{new Date(rx.date).toLocaleDateString("pt-BR")}</p>
              </div>
            </div>
            {rx.hasPdf && (
              <Button variant="outline" size="sm" className="gap-2 border-glass-border text-muted-foreground hover:text-foreground">
                <Download className="w-4 h-4" />
                PDF
              </Button>
            )}
          </div>

          <div className="bg-secondary/30 rounded-xl p-4">
            <pre className="text-sm text-foreground whitespace-pre-wrap font-sans leading-relaxed">{rx.content}</pre>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PatientPrescriptions;
