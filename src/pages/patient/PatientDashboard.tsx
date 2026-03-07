import { Utensils, Dumbbell, TrendingUp, FlaskConical, FileText, Camera, Scale } from "lucide-react";
import { useNavigate } from "react-router-dom";

const bentoBlocks = [
  {
    id: "evolution",
    title: "Evolução Física",
    description: "Acompanhe seu progresso",
    icon: TrendingUp,
    to: "/patient/evolution",
    color: "from-primary/20 to-primary/5",
    borderColor: "border-primary/20",
    iconColor: "text-primary",
    wide: true,
    stats: { peso: "78.5 kg", gordura: "15.2%", massa: "42.1%" },
  },
  {
    id: "diet",
    title: "Dieta Atual",
    description: "Plano alimentar personalizado",
    icon: Utensils,
    to: "/patient/diet",
    color: "from-success/20 to-success/5",
    borderColor: "border-success/20",
    iconColor: "text-success",
    wide: false,
    stats: { calorias: "2.450 kcal", proteina: "180g" },
  },
  {
    id: "workout",
    title: "Treino",
    description: "Programa de treinamento",
    icon: Dumbbell,
    to: "/patient/workout",
    color: "from-warning/20 to-warning/5",
    borderColor: "border-warning/20",
    iconColor: "text-warning",
    wide: false,
    stats: { divisao: "A/B/C/D", fase: "Hipertrofia" },
  },
  {
    id: "exams",
    title: "Exames Laboratoriais",
    description: "Resultados e interpretações",
    icon: FlaskConical,
    to: "/patient/exams",
    color: "from-primary/20 to-primary/5",
    borderColor: "border-primary/20",
    iconColor: "text-primary",
    wide: false,
    stats: { ultimo: "05/03/2026" },
  },
  {
    id: "prescriptions",
    title: "Prescrições Médicas",
    description: "Medicamentos e suplementos",
    icon: FileText,
    to: "/patient/prescriptions",
    color: "from-destructive/20 to-destructive/5",
    borderColor: "border-destructive/20",
    iconColor: "text-destructive",
    wide: false,
    stats: { ativas: "3 prescrições" },
  },
];

const PatientDashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-8 stagger-fade-in">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Olá, Maria! 👋</h1>
        <p className="text-muted-foreground mt-1">Confira seu painel de acompanhamento</p>
      </div>

      {/* Quick actions */}
      <div className="flex gap-3">
        <button className="glass-card-hover flex items-center gap-2 px-4 py-3 text-sm font-medium text-foreground">
          <Scale className="w-4 h-4 text-primary" />
          Atualizar Peso
        </button>
        <button className="glass-card-hover flex items-center gap-2 px-4 py-3 text-sm font-medium text-foreground">
          <Camera className="w-4 h-4 text-success" />
          Enviar Foto
        </button>
      </div>

      {/* Bento Grid */}
      <div className="bento-grid">
        {bentoBlocks.map((block) => (
          <button
            key={block.id}
            onClick={() => navigate(block.to)}
            className={`glass-card-hover p-6 text-left ${block.wide ? "bento-item-wide" : ""} group`}
          >
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${block.color} border ${block.borderColor} flex items-center justify-center mb-4`}>
              <block.icon className={`w-6 h-6 ${block.iconColor}`} />
            </div>
            <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">{block.title}</h3>
            <p className="text-sm text-muted-foreground mt-1">{block.description}</p>
            
            <div className="mt-4 flex flex-wrap gap-3">
              {Object.entries(block.stats).map(([key, value]) => (
                <div key={key} className="bg-secondary/50 rounded-lg px-3 py-1.5">
                  <p className="text-xs text-muted-foreground capitalize">{key}</p>
                  <p className="text-sm font-semibold text-foreground">{value}</p>
                </div>
              ))}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default PatientDashboard;
