import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

const mockExams = [
  {
    id: "1",
    date: "2026-03-05",
    type: "Painel Completo",
    analysis: "Perfil lipídico dentro da normalidade. Vitamina D abaixo do ideal — iniciar suplementação.",
    results: [
      { marker: "Colesterol Total", value: "185", unit: "mg/dL", ref: "< 200", status: "normal" },
      { marker: "LDL", value: "110", unit: "mg/dL", ref: "< 130", status: "normal" },
      { marker: "HDL", value: "52", unit: "mg/dL", ref: "> 40", status: "normal" },
      { marker: "Triglicerídeos", value: "120", unit: "mg/dL", ref: "< 150", status: "normal" },
      { marker: "Glicemia", value: "88", unit: "mg/dL", ref: "70-99", status: "normal" },
      { marker: "Insulina", value: "7.2", unit: "µU/mL", ref: "2.6-24.9", status: "normal" },
      { marker: "TSH", value: "2.1", unit: "mUI/L", ref: "0.4-4.0", status: "normal" },
      { marker: "Testosterona Total", value: "650", unit: "ng/dL", ref: "300-1000", status: "normal" },
      { marker: "Vitamina D", value: "22", unit: "ng/mL", ref: "30-100", status: "low" },
    ],
  },
  {
    id: "2",
    date: "2025-12-10",
    type: "Painel Completo",
    analysis: "Resultados anteriores para comparação.",
    results: [
      { marker: "Colesterol Total", value: "210", unit: "mg/dL", ref: "< 200", status: "high" },
      { marker: "LDL", value: "140", unit: "mg/dL", ref: "< 130", status: "high" },
      { marker: "HDL", value: "45", unit: "mg/dL", ref: "> 40", status: "normal" },
      { marker: "Triglicerídeos", value: "165", unit: "mg/dL", ref: "< 150", status: "high" },
      { marker: "Glicemia", value: "95", unit: "mg/dL", ref: "70-99", status: "normal" },
      { marker: "Vitamina D", value: "18", unit: "ng/mL", ref: "30-100", status: "low" },
    ],
  },
];

const comparisonData = [
  { marker: "Col. Total", anterior: 210, atual: 185 },
  { marker: "LDL", anterior: 140, atual: 110 },
  { marker: "HDL", anterior: 45, atual: 52 },
  { marker: "Triglicerídeos", anterior: 165, atual: 120 },
  { marker: "Glicemia", anterior: 95, atual: 88 },
];

const PatientExams = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6 stagger-fade-in">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm">
        <ArrowLeft className="w-4 h-4" /> Voltar
      </button>

      <h1 className="text-2xl font-bold text-foreground">Exames Laboratoriais</h1>

      {/* Comparison Chart */}
      <div className="glass-card p-6">
        <h2 className="text-lg font-bold text-foreground mb-4">Comparação entre Exames</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={comparisonData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(222 20% 18%)" />
              <XAxis dataKey="marker" stroke="hsl(215 20% 55%)" fontSize={11} />
              <YAxis stroke="hsl(215 20% 55%)" fontSize={11} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(222 40% 10%)",
                  border: "1px solid hsl(222 20% 22%)",
                  borderRadius: "12px",
                  color: "hsl(210 40% 96%)",
                }}
              />
              <Bar dataKey="anterior" fill="hsl(215 20% 55%)" radius={[4, 4, 0, 0]} name="Dez/2025" />
              <Bar dataKey="atual" fill="hsl(213 94% 55%)" radius={[4, 4, 0, 0]} name="Mar/2026" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Exam Details */}
      {mockExams.map((exam) => (
        <div key={exam.id} className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-foreground">{exam.type}</h2>
              <p className="text-sm text-muted-foreground">{new Date(exam.date).toLocaleDateString("pt-BR")}</p>
            </div>
          </div>

          {/* Analysis */}
          <div className="bg-primary/5 border border-primary/10 rounded-xl p-4 mb-4">
            <p className="text-sm font-medium text-primary mb-1">Análise Clínica</p>
            <p className="text-sm text-foreground">{exam.analysis}</p>
          </div>

          {/* Results Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 text-muted-foreground font-medium">Marcador</th>
                  <th className="text-left py-2 text-muted-foreground font-medium">Resultado</th>
                  <th className="text-left py-2 text-muted-foreground font-medium hidden sm:table-cell">Referência</th>
                  <th className="text-left py-2 text-muted-foreground font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {exam.results.map((result, i) => (
                  <tr key={i} className="border-b border-border/50 last:border-0">
                    <td className="py-3 text-foreground font-medium">{result.marker}</td>
                    <td className="py-3 text-foreground">{result.value} {result.unit}</td>
                    <td className="py-3 text-muted-foreground hidden sm:table-cell">{result.ref}</td>
                    <td className="py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                        result.status === "normal" ? "bg-success/10 text-success" :
                        result.status === "high" ? "bg-destructive/10 text-destructive" :
                        "bg-warning/10 text-warning"
                      }`}>
                        {result.status === "normal" ? "Normal" : result.status === "high" ? "Alto" : "Baixo"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PatientExams;
