import React, { useState, useMemo } from 'react';
import { 
  AreaChart, 
  Area,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
} from 'recharts';
import { 
  Activity, 
  Clock, 
  Flame, 
  TrendingUp, 
  TrendingDown,
  Info,
  ChevronDown,
  Zap,
  Dumbbell,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface PhysicalActivity {
  id: string;
  name: string;
  intensity: string;
  description: string;
  met: number;
  classification: string;
  icon: React.ReactNode;
  color: string;
}

const ACTIVITIES: PhysicalActivity[] = [
  { id: 'walking_l_32', name: 'Caminhada', intensity: 'Leve', description: '3.2 km/h', met: 2.5, classification: 'Leve (1.6–2.9 METs)', icon: <Activity className="w-4 h-4" />, color: '#10b981' },
  { id: 'walking_l_40', name: 'Caminhada', intensity: 'Leve', description: '4.0 km/h', met: 2.9, classification: 'Leve (1.6–2.9 METs)', icon: <Activity className="w-4 h-4" />, color: '#10b981' },
  { id: 'walking_m_48', name: 'Caminhada', intensity: 'Moderado', description: '4.8 km/h', met: 3.3, classification: 'Moderado (3.0–5.9 METs)', icon: <Activity className="w-4 h-4" />, color: '#3b82f6' },
  { id: 'walking_m_60', name: 'Caminhada', intensity: 'Moderado', description: '6.0 km/h', met: 3.9, classification: 'Moderado (3.0–5.9 METs)', icon: <Activity className="w-4 h-4" />, color: '#3b82f6' },
  { id: 'running_m_65', name: 'Corrida', intensity: 'Moderado', description: '6.5 km/h', met: 6.0, classification: 'Vigoroso (≥6.0 METs)', icon: <Zap className="w-4 h-4" />, color: '#f59e0b' },
  { id: 'running_i_97', name: 'Corrida', intensity: 'Intenso', description: '9.7 km/h', met: 9.8, classification: 'Vigoroso (≥6.0 METs)', icon: <Zap className="w-4 h-4" />, color: '#ef4444' },
  { id: 'swimming_l', name: 'Natação', intensity: 'Leve', description: 'Lento', met: 4.5, classification: 'Moderado (3.0–5.9 METs)', icon: <Activity className="w-4 h-4" />, color: '#06b6d4' },
  { id: 'swimming_m', name: 'Natação', intensity: 'Moderado', description: 'Livre', met: 5.9, classification: 'Moderado (3.0–5.9 METs)', icon: <Activity className="w-4 h-4" />, color: '#3b82f6' },
  { id: 'swimming_i', name: 'Natação', intensity: 'Intenso', description: 'Competição', met: 11.0, classification: 'Vigoroso (≥6.0 METs)', icon: <Zap className="w-4 h-4" />, color: '#ef4444' },
  { id: 'cycling_l', name: 'Ciclismo', intensity: 'Leve', description: '16 km/h', met: 4.0, classification: 'Moderado (3.0–5.9 METs)', icon: <Activity className="w-4 h-4" />, color: '#10b981' },
  { id: 'cycling_m', name: 'Ciclismo', intensity: 'Moderado', description: '20 km/h', met: 6.0, classification: 'Vigoroso (≥6.0 METs)', icon: <Activity className="w-4 h-4" />, color: '#3b82f6' },
  { id: 'cycling_i', name: 'Ciclismo', intensity: 'Intenso', description: '25 km/h', met: 12.0, classification: 'Vigoroso (≥6.0 METs)', icon: <Zap className="w-4 h-4" />, color: '#ef4444' },
  { id: 'weight_l', name: 'Musculação', intensity: 'Leve', description: 'Baixo esforço', met: 3.0, classification: 'Moderado (3.0–5.9 METs)', icon: <Dumbbell className="w-4 h-4" />, color: '#8b5cf6' },
  { id: 'weight_m', name: 'Musculação', intensity: 'Moderado', description: 'Moderado esforço', met: 3.75, classification: 'Moderado (3.0–5.9 METs)', icon: <Dumbbell className="w-4 h-4" />, color: '#8b5cf6' },
  { id: 'weight_i', name: 'Musculação', intensity: 'Intenso', description: 'Vigoroso esforço', met: 6.0, classification: 'Vigoroso (≥6.0 METs)', icon: <Dumbbell className="w-4 h-4" />, color: '#8b5cf6' },
  { id: 'soccer_g', name: 'Futebol', intensity: 'Geral', description: 'Partida recreacional', met: 8.5, classification: 'Vigoroso (≥6.0 METs)', icon: <Activity className="w-4 h-4" />, color: '#10b981' },
  { id: 'jiujitsu_i', name: 'Jiu-Jitsu', intensity: 'Intenso', description: 'Competição', met: 10.0, classification: 'Vigoroso (≥6.0 METs)', icon: <Zap className="w-4 h-4" />, color: '#ef4444' },
  { id: 'tv_s', name: 'Assistir TV', intensity: 'Sedentário', description: 'Sentado', met: 1.1, classification: 'Sedentário (≤1.5 METs)', icon: <Clock className="w-4 h-4" />, color: '#94a3b8' },
  { id: 'sleep_r', name: 'Dormir', intensity: 'Descanso', description: 'Dormindo', met: 0.9, classification: 'Abaixo do descanso', icon: <Clock className="w-4 h-4" />, color: '#94a3b8' },
  { id: 'sex_v', name: 'Sexo', intensity: 'Variável', description: 'Relação sexual típica', met: 4.0, classification: 'Moderado (3.0–5.9 METs)', icon: <Flame className="w-4 h-4" />, color: '#f43f5e' },
];

interface PatientCardioTabProps {
  patientId: string;
}

const PatientCardioTab: React.FC<PatientCardioTabProps> = ({ patientId }) => {
  const [weight, setWeight] = useState<number>(70);
  const [duration, setDuration] = useState<number>(30);
  const [activityId, setActivityId] = useState<string>(ACTIVITIES[0].id);
  const [comparisonActivityId, setComparisonActivityId] = useState<string>(ACTIVITIES[4].id);
  const [showReferences, setShowReferences] = useState(false);
  const [showDetailedInfo, setShowDetailedInfo] = useState(false);

  const selectedActivity = useMemo(() => ACTIVITIES.find(a => a.id === activityId) || ACTIVITIES[0], [activityId]);
  const comparisonActivity = useMemo(() => ACTIVITIES.find(a => a.id === comparisonActivityId) || ACTIVITIES[4], [comparisonActivityId]);

  const calculateCalories = (w: number, d: number, met: number) => (met * 3.5 * w * d) / 200;

  const totalCalories = useMemo(() => calculateCalories(weight, duration, selectedActivity.met), [weight, duration, selectedActivity]);
  const caloriesPerMinute = useMemo(() => calculateCalories(weight, 1, selectedActivity.met), [weight, selectedActivity]);

  const chartData = useMemo(() => {
    const data = [];
    for (let i = 0; i <= duration; i++) {
      data.push({
        minute: i,
        calories: parseFloat(calculateCalories(weight, i, selectedActivity.met).toFixed(1)),
        comparisonCalories: parseFloat(calculateCalories(weight, i, comparisonActivity.met).toFixed(1)),
      });
    }
    return data;
  }, [weight, duration, selectedActivity, comparisonActivity]);

  return (
    <div className="space-y-6">
      {/* Header com gasto total */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-emerald-600 p-6 md:p-8 rounded-2xl shadow-lg text-white overflow-hidden relative"
      >
        <div className="absolute -right-8 -top-8 opacity-10">
          <Flame className="w-48 h-48" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <p className="text-emerald-100 text-xs font-bold uppercase tracking-widest">Gasto Calórico Total Estimado</p>
            <div className="flex items-baseline gap-3 mt-2">
              <span className="text-5xl md:text-6xl font-black tracking-tighter">
                {totalCalories.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </span>
              <span className="text-xl font-medium opacity-80 uppercase tracking-tight">kcal</span>
            </div>
          </div>
          <div className="flex gap-8 md:gap-12 border-t md:border-t-0 md:border-l border-emerald-500/50 pt-6 md:pt-0 md:pl-12">
            <div>
              <p className="text-[10px] uppercase font-bold opacity-70 tracking-widest mb-1">Intensidade</p>
              <p className="text-2xl font-black">
                {caloriesPerMinute.toFixed(1)} <span className="text-xs font-normal opacity-80">kcal/min</span>
              </p>
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold opacity-70 tracking-widest mb-1">MET</p>
              <p className="text-2xl font-black">{selectedActivity.met}</p>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Parâmetros */}
        <section className="lg:col-span-4 space-y-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card p-6 rounded-2xl shadow-sm border border-border space-y-6"
          >
            <h2 className="text-lg font-bold flex items-center gap-2 text-foreground">
              <Activity className="w-5 h-5 text-emerald-500" />
              Parâmetros
            </h2>

            {/* Weight */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex justify-between">
                Peso Corporal
                <span className="text-emerald-600">{weight} kg</span>
              </label>
              <div className="relative flex items-center">
                <Dumbbell className="absolute left-3 w-4 h-4 text-muted-foreground" />
                <input 
                  type="number" 
                  value={weight}
                  onChange={(e) => setWeight(Math.max(0, Number(e.target.value)))}
                  className="w-full pl-10 pr-4 py-3 bg-muted border border-border rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all font-medium"
                />
              </div>
              <input 
                type="range" min="30" max="200" step="0.5" value={weight}
                onChange={(e) => setWeight(Number(e.target.value))}
                className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
            </div>

            {/* Duration */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex justify-between">
                Meta semanal
                <span className="text-emerald-600">{duration} min</span>
              </label>
              <div className="relative flex items-center">
                <Clock className="absolute left-3 w-4 h-4 text-muted-foreground" />
                <input 
                  type="number" 
                  value={duration}
                  max="800"
                  onChange={(e) => setDuration(Math.min(800, Math.max(0, Number(e.target.value))))}
                  className="w-full pl-10 pr-4 py-3 bg-muted border border-border rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all font-medium"
                />
              </div>
              <input 
                type="range" min="1" max="800" value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
            </div>

            {/* Activity */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Tipo de Atividade</label>
              <div className="relative flex items-center">
                <Activity className="absolute left-3 w-4 h-4 text-muted-foreground" />
                <select 
                  value={activityId}
                  onChange={(e) => setActivityId(e.target.value)}
                  className="w-full appearance-none pl-10 pr-10 py-3 bg-muted border border-emerald-500 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all font-medium cursor-pointer"
                >
                  {ACTIVITIES.map(a => (
                    <option key={a.id} value={a.id}>{a.name} - {a.intensity} ({a.description})</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              </div>
              <div className={cn(
                "flex flex-col gap-2 p-3 rounded-lg border",
                selectedActivity.met < 3.0 ? 'bg-emerald-50 border-emerald-100' :
                selectedActivity.met < 6.0 ? 'bg-amber-50 border-amber-100' : 'bg-rose-50 border-rose-100'
              )}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={cn("w-3 h-3 rounded-sm shadow-sm",
                      selectedActivity.met < 3.0 ? 'bg-emerald-500' : selectedActivity.met < 6.0 ? 'bg-amber-500' : 'bg-rose-500'
                    )} />
                    <p className={cn("text-[10px] font-bold uppercase tracking-wider",
                      selectedActivity.met < 3.0 ? 'text-emerald-700' : selectedActivity.met < 6.0 ? 'text-amber-700' : 'text-rose-700'
                    )}>{selectedActivity.classification}</p>
                  </div>
                </div>
                <p className={cn("text-[10px] leading-tight",
                  selectedActivity.met < 3.0 ? 'text-emerald-700' : selectedActivity.met < 6.0 ? 'text-amber-700' : 'text-rose-700'
                )}>
                  MET para <strong>{selectedActivity.name} ({selectedActivity.intensity})</strong> é <strong>{selectedActivity.met}</strong>. 
                  Você está gastando <strong>{selectedActivity.met}</strong> vezes mais calorias do que ficar em repouso.
                </p>
              </div>
            </div>

            {/* Comparison */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Atividade para Comparação</label>
              <div className="relative flex items-center">
                <TrendingUp className="absolute left-3 w-4 h-4 text-muted-foreground" />
                <select 
                  value={comparisonActivityId}
                  onChange={(e) => setComparisonActivityId(e.target.value)}
                  className="w-full appearance-none pl-10 pr-10 py-3 bg-muted border border-purple-500 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all font-medium cursor-pointer"
                >
                  {ACTIVITIES.map(a => (
                    <option key={a.id} value={a.id}>{a.name} - {a.intensity} ({a.description})</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              </div>
              <div className={cn(
                "flex flex-col gap-2 p-3 rounded-lg border",
                comparisonActivity.met < 3.0 ? 'bg-blue-50 border-blue-100' :
                comparisonActivity.met < 6.0 ? 'bg-indigo-50 border-indigo-100' : 'bg-violet-50 border-violet-100'
              )}>
                <div className="flex items-center gap-2">
                  <div className={cn("w-3 h-3 rounded-sm shadow-sm",
                    comparisonActivity.met < 3.0 ? 'bg-blue-500' : comparisonActivity.met < 6.0 ? 'bg-indigo-500' : 'bg-violet-500'
                  )} />
                  <p className={cn("text-[10px] font-bold uppercase tracking-wider",
                    comparisonActivity.met < 3.0 ? 'text-blue-700' : comparisonActivity.met < 6.0 ? 'text-indigo-700' : 'text-violet-700'
                  )}>{comparisonActivity.classification}</p>
                </div>
                <p className={cn("text-[10px] leading-tight",
                  comparisonActivity.met < 3.0 ? 'text-blue-700' : comparisonActivity.met < 6.0 ? 'text-indigo-700' : 'text-violet-700'
                )}>
                  Comparando com <strong>{comparisonActivity.name}</strong> (MET: {comparisonActivity.met}).
                </p>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Gráfico */}
        <section className="lg:col-span-8 space-y-6">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-card p-6 rounded-2xl shadow-sm border border-border flex flex-col"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold flex items-center gap-2 text-foreground">
                <TrendingUp className="w-5 h-5 text-emerald-500" />
                Acúmulo Calórico
              </h2>
              <div className="flex gap-2">
                <div className="flex items-center gap-1.5 px-3 py-1 bg-muted rounded-full text-[10px] font-bold text-muted-foreground uppercase">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  {selectedActivity.name}
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 bg-muted rounded-full text-[10px] font-bold text-muted-foreground uppercase">
                  <div className="w-2 h-2 rounded-full bg-purple-500" />
                  {comparisonActivity.name}
                </div>
              </div>
            </div>

            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 10, bottom: 30 }}>
                  <defs>
                    <linearGradient id="colorKcalCardio" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorCompKcalCardio" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="minute" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} dy={10}
                    label={{ value: 'Tempo (min)', position: 'bottom', offset: 0, fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} dx={-5}
                    label={{ value: 'Calorias (kcal)', angle: -90, position: 'insideLeft', offset: 0, fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <Tooltip 
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length >= 2) {
                        const val1 = Number(payload[0].value);
                        const val2 = Number(payload[1].value);
                        const diff = val1 - val2;
                        const percent = val2 > 0 ? (diff / val2) * 100 : 0;
                        const isPositive = diff > 0;
                        return (
                          <div className="bg-card p-3 border border-border rounded-xl shadow-xl space-y-2 min-w-[200px]">
                            <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">{label} Minutos</p>
                            <div className="space-y-1">
                              <div className="flex justify-between items-center gap-4">
                                <div className="flex items-center gap-1.5">
                                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                  <span className="text-[10px] font-bold text-muted-foreground uppercase">{selectedActivity.name}</span>
                                </div>
                                <span className="text-sm font-black text-emerald-600">{val1.toFixed(1)} kcal</span>
                              </div>
                              <div className="flex justify-between items-center gap-4">
                                <div className="flex items-center gap-1.5">
                                  <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                                  <span className="text-[10px] font-bold text-muted-foreground uppercase">{comparisonActivity.name}</span>
                                </div>
                                <span className="text-sm font-black text-purple-600">{val2.toFixed(1)} kcal</span>
                              </div>
                            </div>
                            <div className={cn("mt-2 pt-2 border-t border-border flex items-center justify-between", isPositive ? 'text-emerald-600' : 'text-rose-600')}>
                              <span className="text-[10px] font-bold uppercase tracking-wider">Variação</span>
                              <div className="flex items-center gap-1 font-black text-xs">
                                {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                                <span>{isPositive ? '+' : ''}{diff.toFixed(1)} kcal ({isPositive ? '+' : ''}{percent.toFixed(1)}%)</span>
                              </div>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Area type="monotone" dataKey="calories" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorKcalCardio)" />
                  <Area type="monotone" dataKey="comparisonCalories" stroke="#a855f7" strokeWidth={3} fillOpacity={1} fill="url(#colorCompKcalCardio)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Insights */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
              {[15, 30, 45, 60].map(min => (
                <div key={min} className="p-4 bg-muted rounded-xl border border-border">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">{min} Min</p>
                  <p className="text-lg font-black text-foreground">
                    {calculateCalories(weight, min, selectedActivity.met).toFixed(0)}
                    <span className="text-xs font-normal ml-1 text-muted-foreground">kcal</span>
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        </section>
      </div>

      {/* Info expandível */}
      <div className="space-y-4">
        <button
          onClick={() => setShowDetailedInfo(!showDetailedInfo)}
          className="w-full bg-card p-6 rounded-2xl shadow-sm border border-border flex items-center justify-between hover:border-emerald-500 transition-all group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-50 rounded-lg group-hover:bg-emerald-100 transition-colors">
              <Info className="w-5 h-5 text-emerald-600" />
            </div>
            <h2 className="text-xl font-black tracking-tight text-foreground">Informações sobre a ferramenta</h2>
          </div>
          <ChevronDown className={cn("w-5 h-5 text-muted-foreground transition-transform duration-300", showDetailedInfo && 'rotate-180')} />
        </button>

        <AnimatePresence>
          {showDetailedInfo && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
              <div className="bg-card p-8 rounded-2xl shadow-sm border border-border space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div className="space-y-4">
                    <h2 className="text-2xl font-black tracking-tight text-foreground flex items-center gap-2">
                      <Info className="w-6 h-6 text-emerald-500" />
                      Sobre a calculadora
                    </h2>
                    <p className="text-muted-foreground leading-relaxed text-sm">
                      A fórmula para estimar o gasto calórico durante o exercício físico utiliza o conceito de <strong>MET (<em>Metabolic Equivalent of Task</em>)</strong>, que representa a intensidade da atividade em relação ao metabolismo de repouso. O cálculo é: <strong>kcal = MET × 3,5 × peso (kg) / 200 × duração (min)</strong>. Esta é uma <strong>estimativa</strong>, pois o gasto calórico real varia conforme fatores individuais.
                    </p>
                  </div>
                  <div className="space-y-4">
                    <h2 className="text-2xl font-black tracking-tight text-foreground flex items-center gap-2">
                      <Zap className="w-6 h-6 text-emerald-500" />
                      O que são METs?
                    </h2>
                    <p className="text-muted-foreground leading-relaxed text-sm">
                      O <strong>MET</strong> é uma unidade usada para medir a <strong>intensidade</strong> de uma atividade física. Ele compara o esforço de qualquer exercício com o esforço em repouso.
                    </p>
                    <div className="bg-muted p-4 rounded-xl space-y-2">
                      <h3 className="font-bold text-xs uppercase tracking-widest text-muted-foreground">Escala:</h3>
                      <ul className="text-sm space-y-1 text-foreground">
                        <li>• <strong>1 MET:</strong> Gasto basal (sentado calmamente).</li>
                        <li>• <strong>2 METs:</strong> Dobro da energia em repouso.</li>
                        <li>• <strong>5 METs:</strong> Cinco vezes mais energia.</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <h3 className="text-xl font-black tracking-tight text-foreground">Intensidade</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="border border-border p-4 rounded-xl hover:border-emerald-200 transition-colors">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                        <span className="font-bold text-sm text-foreground">2 a 2,9 METs: Leve</span>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">Atividades que exigem pouco esforço físico.</p>
                    </div>
                    <div className="border border-border p-4 rounded-xl hover:border-yellow-200 transition-colors">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
                        <span className="font-bold text-sm text-foreground">3 a 5,9 METs: Moderado</span>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">Elevação perceptível da frequência cardíaca.</p>
                    </div>
                    <div className="border border-border p-4 rounded-xl hover:border-red-200 transition-colors">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="w-3 h-3 rounded-full bg-red-500"></span>
                        <span className="font-bold text-sm text-foreground">≥ 6 METs: Intenso</span>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">Grande fadiga e exigência cardiovascular.</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-4 border-t border-border">
                  <div className="space-y-4">
                    <h3 className="text-xl font-black tracking-tight text-foreground">Limitações do método</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      A fórmula padrão de METs apresenta limitações significativas relacionadas ao gasto metabólico de repouso, variabilidade interindividual, e fatores como composição corporal, idade, sexo e nível de condicionamento físico.
                    </p>
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-xl font-black tracking-tight text-foreground">Variabilidade esperada</h3>
                    <ul className="text-sm space-y-2 text-muted-foreground">
                      <li className="flex justify-between border-b border-border pb-1"><span>Variabilidade média</span><span className="font-bold text-foreground">±15-25%</span></li>
                      <li className="flex justify-between border-b border-border pb-1"><span>Baixa intensidade</span><span className="font-bold text-foreground">±5-10%</span></li>
                      <li className="flex justify-between border-b border-border pb-1"><span>Intensidade moderada</span><span className="font-bold text-foreground">±10-20%</span></li>
                      <li className="flex justify-between border-b border-border pb-1"><span>Intensidade vigorosa</span><span className="font-bold text-foreground">±15-30%</span></li>
                      <li className="flex justify-between border-b border-border pb-1"><span>Populações específicas</span><span className="font-bold text-foreground">±25-35%</span></li>
                    </ul>
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    onClick={() => setShowReferences(!showReferences)}
                    className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-emerald-600 transition-colors"
                  >
                    Referências
                    <ChevronDown className={cn("w-4 h-4 transition-transform", showReferences && 'rotate-180')} />
                  </button>
                  <AnimatePresence>
                    {showReferences && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                        <ul className="mt-4 space-y-2 text-xs text-muted-foreground list-disc pl-4 leading-relaxed">
                          <li>Metabolic Equivalent: One Size Does Not Fit All. Journal of Applied Physiology. 2005.</li>
                          <li>The Physical Activity Guidelines for Americans. JAMA. 2018.</li>
                          <li>Metabolic Equivalents of Task Are Confounded by Adiposity. Frontiers in Physiology. 2015.</li>
                          <li>Using Metabolic Equivalents in Clinical. The American Journal of Cardiology. 2018.</li>
                          <li>A Comprehensive Evaluation of Commonly Used Accelerometer Energy Expenditure and MET Prediction Equations. EJAP. 2011.</li>
                          <li>Energetics Contribution During No-Gi Brazilian Jiu Jitsu Sparring. PloS One. 2021.</li>
                          <li>Evaluating the Accuracy of Using Fixed Ranges of METs. Sports Medicine. 2021.</li>
                          <li>Predicting walking METs and energy expenditure from speed or accelerometry. MSSE. 2005.</li>
                        </ul>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <footer className="pt-6 border-t border-border flex flex-col md:flex-row justify-between gap-4 items-center">
        <p className="text-xs text-muted-foreground text-center md:text-left">
          Cálculos baseados no Compêndio de Atividades Físicas. Os resultados individuais podem variar.
        </p>
      </footer>
    </div>
  );
};

export default PatientCardioTab;
