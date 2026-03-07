import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Input } from "@/components/ui/input";

type WorkoutDay = {
  label: string;
  name: string;
  exercises: { name: string; sets: number; reps: string; obs: string; weights: string[] }[];
};

const mockWorkout: WorkoutDay[] = [
  {
    label: "A",
    name: "Peito e Tríceps",
    exercises: [
      { name: "Supino Reto", sets: 4, reps: "8-12", obs: "Controlar descida", weights: ["80", "85", "85", "80"] },
      { name: "Supino Inclinado Halteres", sets: 4, reps: "10-12", obs: "", weights: ["30", "30", "28", "28"] },
      { name: "Crucifixo", sets: 3, reps: "12-15", obs: "Squeeze no topo", weights: ["18", "18", "16"] },
      { name: "Tríceps Pulley", sets: 4, reps: "10-12", obs: "", weights: ["35", "35", "30", "30"] },
      { name: "Tríceps Francês", sets: 3, reps: "10-12", obs: "", weights: ["20", "20", "18"] },
    ],
  },
  {
    label: "B",
    name: "Costas e Bíceps",
    exercises: [
      { name: "Puxada Frontal", sets: 4, reps: "8-12", obs: "", weights: ["65", "70", "70", "65"] },
      { name: "Remada Curvada", sets: 4, reps: "8-10", obs: "Manter lombar neutra", weights: ["60", "60", "55", "55"] },
      { name: "Remada Unilateral", sets: 3, reps: "10-12", obs: "", weights: ["28", "28", "26"] },
      { name: "Rosca Direta", sets: 4, reps: "10-12", obs: "", weights: ["24", "24", "22", "22"] },
      { name: "Rosca Martelo", sets: 3, reps: "10-12", obs: "", weights: ["16", "16", "14"] },
    ],
  },
  {
    label: "C",
    name: "Pernas (Quadríceps)",
    exercises: [
      { name: "Agachamento Livre", sets: 4, reps: "6-10", obs: "Profundidade total", weights: ["100", "110", "110", "100"] },
      { name: "Leg Press 45°", sets: 4, reps: "10-12", obs: "", weights: ["200", "220", "220", "200"] },
      { name: "Cadeira Extensora", sets: 3, reps: "12-15", obs: "Isometria 2s", weights: ["50", "50", "45"] },
      { name: "Afundo", sets: 3, reps: "10 cada", obs: "", weights: ["20", "20", "18"] },
    ],
  },
  {
    label: "D",
    name: "Ombros e Posterior",
    exercises: [
      { name: "Desenvolvimento Militar", sets: 4, reps: "8-10", obs: "", weights: ["50", "55", "55", "50"] },
      { name: "Elevação Lateral", sets: 4, reps: "12-15", obs: "Controlar", weights: ["10", "10", "10", "10"] },
      { name: "Face Pull", sets: 3, reps: "15-20", obs: "", weights: ["20", "20", "18"] },
      { name: "Cadeira Flexora", sets: 4, reps: "10-12", obs: "", weights: ["45", "45", "40", "40"] },
      { name: "Stiff", sets: 3, reps: "8-10", obs: "Manter joelhos semi-flexionados", weights: ["50", "50", "45"] },
    ],
  },
];

const PatientWorkout = () => {
  const navigate = useNavigate();
  const [activeDay, setActiveDay] = useState("A");
  const [workoutData, setWorkoutData] = useState(mockWorkout);

  const currentWorkout = workoutData.find((w) => w.label === activeDay)!;

  const updateWeight = (exerciseIdx: number, setIdx: number, value: string) => {
    setWorkoutData((prev) =>
      prev.map((day) => {
        if (day.label !== activeDay) return day;
        return {
          ...day,
          exercises: day.exercises.map((ex, i) => {
            if (i !== exerciseIdx) return ex;
            const newWeights = [...ex.weights];
            newWeights[setIdx] = value;
            return { ...ex, weights: newWeights };
          }),
        };
      })
    );
  };

  return (
    <div className="space-y-6 stagger-fade-in">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm">
        <ArrowLeft className="w-4 h-4" /> Voltar
      </button>

      <div>
        <h1 className="text-2xl font-bold text-foreground">Programa de Treinamento</h1>
        <p className="text-muted-foreground text-sm mt-1">Fase: Hipertrofia · Divisão A/B/C/D</p>
      </div>

      {/* Day Tabs */}
      <div className="flex gap-2">
        {mockWorkout.map((day) => (
          <button
            key={day.label}
            onClick={() => setActiveDay(day.label)}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
              activeDay === day.label
                ? "bg-primary text-primary-foreground"
                : "bg-secondary/50 text-muted-foreground hover:text-foreground"
            }`}
          >
            Treino {day.label}
          </button>
        ))}
      </div>

      {/* Workout Card */}
      <div className="glass-card p-6">
        <h2 className="text-lg font-bold text-foreground mb-1">Treino {currentWorkout.label} – {currentWorkout.name}</h2>
        <p className="text-sm text-muted-foreground mb-6">Preencha o peso utilizado em cada série</p>

        <div className="space-y-4">
          {currentWorkout.exercises.map((exercise, exIdx) => (
            <div key={exIdx} className="bg-secondary/30 rounded-xl p-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                <div>
                  <p className="font-semibold text-foreground">{exercise.name}</p>
                  <p className="text-xs text-muted-foreground">{exercise.sets} séries × {exercise.reps} reps {exercise.obs && `· ${exercise.obs}`}</p>
                </div>
              </div>
              <div className="flex gap-2 flex-wrap">
                {exercise.weights.map((weight, setIdx) => (
                  <div key={setIdx} className="flex flex-col items-center gap-1">
                    <span className="text-[10px] text-muted-foreground">S{setIdx + 1}</span>
                    <Input
                      value={weight}
                      onChange={(e) => updateWeight(exIdx, setIdx, e.target.value)}
                      className="w-16 h-9 text-center text-sm bg-background border-glass-border"
                      placeholder="kg"
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PatientWorkout;
