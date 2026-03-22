import { useMemo, useState, useEffect } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceArea as RechartsReferenceArea
} from 'recharts';

const ReferenceArea = RechartsReferenceArea as any;

import { AlertTriangle, CheckCircle2, Calendar, User, TrendingUp, Info, ArrowRight, X, ChevronDown, ChevronUp, BookOpen, Activity, TrendingDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExamDefinition, ExamResult, Patient, CATEGORIES } from './types';
import { getStatusColor, getColorHex, getInterpretation, calculateDeviation, getDynamicColor, calculateMETSIR, getMETSIRInterpretation, getClinicalInsight } from './calculations';
import { ReferenceRangeDisplay } from './ReferenceRangeDisplay';

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}

interface DashboardProps {
  exams: ExamDefinition[];
  results: ExamResult[];
  patient: Patient;
}

export default function ExamDashboard({ exams, results, patient }: DashboardProps) {
  const [showMetsInfo, setShowMetsInfo] = useState(false);
  const [showAlertsDropdown, setShowAlertsDropdown] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => ({ ...prev, [category]: !prev[category] }));
  };
  
  const patientResults = useMemo(() => 
    results.filter(r => r.patientId === patient.id).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
    [results, patient.id]
  );

  const latestCollectionDateRaw = patientResults.length > 0 ? patientResults[patientResults.length - 1].date : null;
  const lastCollectionDate = latestCollectionDateRaw ? new Date(latestCollectionDateRaw).toLocaleDateString('pt-BR') : 'Nenhuma coleta registrada';

  const metsIRData = useMemo(() => {
    if (!patient.weight || !patient.height) return null;
    const bmi = patient.weight / (patient.height * patient.height);
    const resultsByDate: Record<string, Record<string, number>> = {};
    patientResults.forEach(r => {
      if (!resultsByDate[r.date]) resultsByDate[r.date] = {};
      resultsByDate[r.date][r.examId] = r.value;
    });
    const sortedDates = Object.keys(resultsByDate).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
    for (const date of sortedDates) {
      const dayResults = resultsByDate[date];
      const glucose = dayResults['glicemia-jejum'];
      const triglycerides = dayResults['triglicerideos'];
      const hdl = dayResults['hdl-colesterol'];
      if (glucose && triglycerides && hdl) {
        const score = calculateMETSIR(glucose, triglycerides, bmi, hdl);
        if (score) return { score, interpretation: getMETSIRInterpretation(score), date: new Date(date).toLocaleDateString('pt-BR') };
      }
    }
    return null;
  }, [patientResults, patient.weight, patient.height]);

  const abnormalResults = useMemo(() => {
    if (!latestCollectionDateRaw) return [];
    return patientResults
      .filter(r => r.date === latestCollectionDateRaw)
      .filter(r => {
        const exam = exams.find(e => e.id === r.examId);
        if (!exam) return false;
        const refRange = exam.referenceRange.unisex || (patient.gender === 'male' ? exam.referenceRange.male : exam.referenceRange.female);
        if (!refRange) return false;
        return getStatusColor(r.value, refRange.min, refRange.max) !== 'green';
      }).map(r => {
        const exam = exams.find(e => e.id === r.examId);
        const refRange = (exam?.referenceRange.unisex || (patient.gender === 'male' ? exam?.referenceRange.male : exam?.referenceRange.female))!;
        return {
          ...r, examName: exam?.name || 'Desconhecido', examUnit: exam?.unit || '',
          color: getStatusColor(r.value, refRange.min, refRange.max),
          dynamicColor: getDynamicColor(r.value, refRange.min, refRange.max),
          interpretation: getInterpretation(r.value, refRange.min, refRange.max),
          deviation: calculateDeviation(r.value, refRange.min, refRange.max)
        };
      });
  }, [patientResults, latestCollectionDateRaw, exams, patient.gender]);

  const autoSummary = useMemo(() => {
    let summary = abnormalResults.length === 0 
      ? "O paciente apresenta todos os marcadores dentro da normalidade."
      : `Foram detectadas ${abnormalResults.length} alterações nos exames. Destacam-se: ${abnormalResults.slice(0, 3).map(r => r.examName).join(', ')}${abnormalResults.length > 3 ? ' entre outros' : ''}.`;
    if (metsIRData && metsIRData.score > 40) summary += " O escore METS-IR elevado sugere atenção à resistência insulínica.";
    return summary;
  }, [abnormalResults, metsIRData]);

  const [clinicalSummary, setClinicalSummary] = useState(autoSummary);
  useEffect(() => { setClinicalSummary(autoSummary); }, [autoSummary]);

  return (
    <div className="space-y-8">
      {/* Clinical Dashboard Block */}
      <div className="glass-card rounded-[2rem] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-primary/5 -skew-x-12 translate-x-1/4 pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row">
          {/* Left: Patient & Status */}
          <div className="flex-1 p-8 lg:p-10 space-y-8 border-b lg:border-b-0 lg:border-r border-border">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 rounded-[2rem] bg-primary flex items-center justify-center text-primary-foreground shadow-xl shrink-0"><User className="w-8 h-8" /></div>
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-2xl font-black text-foreground tracking-tight">{patient.name}</h3>
                    <span className="px-2 py-0.5 bg-green-500/10 text-green-500 text-[9px] font-black uppercase rounded-md tracking-widest">Ativo</span>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                    <span>{patient.gender === 'male' ? 'Masculino' : 'Feminino'}</span>
                    {patient.weight && patient.height && (<><span className="w-1 h-1 rounded-full bg-muted-foreground/30" /><span>IMC: {(patient.weight / (patient.height * patient.height)).toFixed(1)} kg/m²</span></>)}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-8">
                <div className="space-y-1">
                  <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Última Coleta</p>
                  <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-primary" /><p className="text-sm font-black text-foreground">{lastCollectionDate}</p></div>
                </div>
                <div className="relative">
                  <button onClick={() => setShowAlertsDropdown(!showAlertsDropdown)} className="flex flex-col items-start gap-1 group">
                    <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1">Alertas Críticos {showAlertsDropdown ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}</p>
                    <div className="flex items-center gap-2">
                      <div className={cn("w-2 h-2 rounded-full animate-pulse", abnormalResults.length > 0 ? "bg-orange-500" : "bg-green-500")} />
                      <p className={cn("text-sm font-black", abnormalResults.length > 0 ? "text-orange-500" : "text-green-500")}>{abnormalResults.length} {abnormalResults.length === 1 ? 'Alteração' : 'Alterações'}</p>
                    </div>
                  </button>
                  <AnimatePresence>
                    {showAlertsDropdown && (
                      <motion.div initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }} className="absolute top-full left-0 mt-4 bg-card border border-border shadow-2xl rounded-[2rem] z-[100] p-5 min-w-[320px]">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Resumo de Alterações</h4>
                          <button onClick={() => setShowAlertsDropdown(false)} className="p-1 hover:bg-muted rounded-full"><X className="w-4 h-4 text-muted-foreground" /></button>
                        </div>
                        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                          {abnormalResults.length === 0 ? (
                            <div className="p-4 text-center"><p className="text-xs text-muted-foreground font-bold">Nenhuma alteração detectada.</p></div>
                          ) : (
                            abnormalResults.map(r => (
                              <div key={r.id} className="p-3 rounded-2xl bg-muted/50 border border-border flex items-center justify-between group hover:bg-card hover:border-primary/20 transition-all">
                                <div className="flex items-center gap-3">
                                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: r.dynamicColor }} />
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <p className="text-xs font-black text-foreground">{r.examName}</p>
                                      <span className="text-[9px] font-black" style={{ color: r.dynamicColor }}>{r.deviation > 0 ? '+' : ''}{Math.round(r.deviation * 100)}%</span>
                                    </div>
                                    <p className="text-[9px] font-bold text-muted-foreground uppercase">{r.value} {r.examUnit} • {r.interpretation}</p>
                                  </div>
                                </div>
                                <ArrowRight className="w-3 h-3 text-muted-foreground group-hover:text-primary" />
                              </div>
                            ))
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
            <div className="pt-8 border-t border-border/50">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center"><Info className="w-3.5 h-3.5 text-primary" /></div>
                <h4 className="font-black text-[10px] text-muted-foreground uppercase tracking-widest">Resumo Clínico Automatizado</h4>
              </div>
              <textarea className="w-full bg-transparent text-xs text-muted-foreground leading-relaxed resize-none focus:outline-none border-none p-0 min-h-[60px] font-medium" value={clinicalSummary} onChange={(e) => setClinicalSummary(e.target.value)} placeholder="Nenhuma observação clínica registrada..." />
            </div>
          </div>

          {/* Right: METS-IR Score */}
          <div className="lg:w-[320px] p-8 lg:p-10 bg-muted/30 flex flex-col justify-center items-center text-center relative">
            <div className="space-y-6 w-full">
              <div className="space-y-2">
                <div className="flex items-center justify-center gap-2">
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Escore METS-IR</p>
                  <button onClick={() => setShowMetsInfo(true)} className="p-1 hover:bg-card rounded-lg transition-all text-primary/60 hover:text-primary shadow-sm"><Info className="w-3.5 h-3.5" /></button>
                </div>
                <div className="relative inline-flex items-center justify-center">
                  <div className="absolute inset-0 scale-150 opacity-10 blur-2xl rounded-full" style={{ backgroundColor: metsIRData?.interpretation.color || 'hsl(var(--primary))' }} />
                  <div className="relative flex flex-col items-center">
                    <span className="text-6xl font-black text-foreground tracking-tighter leading-none">{metsIRData ? metsIRData.score.toFixed(1) : '—'}</span>
                    {metsIRData && (
                      <div className="mt-4 flex flex-col items-center gap-2">
                        <span className="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm" style={{ backgroundColor: `${metsIRData.interpretation.color}15`, color: metsIRData.interpretation.color, border: `1px solid ${metsIRData.interpretation.color}20` }}>{metsIRData.interpretation.label}</span>
                        <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-tighter opacity-60">Atualizado em {metsIRData.date}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="w-full space-y-2 px-4">
                <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden flex">
                  <div className="h-full bg-green-500" style={{ width: '50%' }} />
                  <div className="h-full bg-red-500" style={{ width: '50%' }} />
                </div>
                <div className="flex justify-between text-[8px] font-black text-muted-foreground uppercase tracking-widest"><span>Excelente</span><span>Resistência</span></div>
              </div>
              <div className="pt-4">
                <div className="p-4 bg-card rounded-2xl border border-border shadow-sm">
                  <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest mb-1">Fórmula de Cálculo</p>
                  <p className="text-[10px] font-bold text-foreground leading-tight">[Ln(2 × Glicose + TG) × IMC] ÷ Ln(HDL)</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>{showMetsInfo && <MetsIRInfoModal onClose={() => setShowMetsInfo(false)} />}</AnimatePresence>

      {/* Charts */}
      <div className="space-y-12">
        {CATEGORIES.map(category => {
          const categoryExams = exams.filter(e => e.category === category);
          const categoryResults = patientResults.filter(r => categoryExams.some(e => e.id === r.examId));
          if (categoryResults.length === 0) return null;
          const isExpanded = expandedCategories[category];
          return (
            <div key={category} className="space-y-6">
              <button onClick={() => toggleCategory(category)} className="w-full flex items-center justify-between group hover:bg-muted/50 p-4 rounded-2xl transition-all">
                <div className="flex items-center gap-4">
                  <div className={cn("h-1 w-12 rounded-full transition-all", isExpanded ? "bg-primary w-16" : "bg-muted-foreground/20")} />
                  <h4 className="text-2xl font-black text-foreground">{category}</h4>
                  <span className="px-3 py-1 bg-muted text-muted-foreground rounded-full text-[10px] font-black uppercase">{categoryExams.length} Exames</span>
                </div>
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center transition-all", isExpanded ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground")}>{isExpanded ? <ChevronUp className="w-6 h-6" /> : <ChevronDown className="w-6 h-6" />}</div>
              </button>
              <AnimatePresence>
                {isExpanded && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }} className="overflow-hidden">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-2 pb-8">
                      {categoryExams.map(exam => {
                        const examData = patientResults.filter(r => r.examId === exam.id).map((r, index, arr) => ({ date: new Date(r.date).toLocaleDateString('pt-BR'), fullDate: new Date(r.date).toLocaleDateString('pt-BR'), value: r.value, previousValue: index > 0 ? arr[index - 1].value : null, examId: r.examId }));
                        if (examData.length === 0) return null;
                        const refRange = exam.referenceRange.unisex || (patient.gender === 'male' ? exam.referenceRange.male : exam.referenceRange.female);
                        const values = examData.map(d => d.value);
                        const dataMin = Math.min(...values);
                        const dataMax = Math.max(...values);
                        const yMin = refRange ? Math.min(dataMin, refRange.min * 0.6) : dataMin * 0.8;
                        const yMax = refRange ? Math.max(dataMax, refRange.max * 1.4) : dataMax * 1.2;
                        const range = yMax - yMin;
                        const getOffset = (val: number) => Math.max(0, Math.min(100, ((yMax - val) / range) * 100));
                        return (
                          <div key={exam.id} className="glass-card p-8 rounded-[2rem] space-y-6">
                            <div className="flex items-center justify-between">
                              <div>
                                <h5 className="text-lg font-black text-foreground">{exam.name}</h5>
                                <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">{exam.unit}</p>
                              </div>
                              {refRange && <ReferenceRangeDisplay referenceRange={exam.referenceRange} labelClassName="text-[10px] font-bold text-muted-foreground uppercase tracking-widest" valueClassName="text-sm font-black text-primary" />}
                            </div>
                            <div className="h-64 w-full">
                              <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={examData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                  <defs>
                                    {refRange && (
                                      <linearGradient id={`gradient-${exam.id}`} x1="0" y1="0" x2="0" y2="1">
                                        <stop offset={`${getOffset(refRange.max * 1.5)}%`} stopColor="#ef4444" stopOpacity={0.15} />
                                        <stop offset={`${getOffset(refRange.max)}%`} stopColor="#eab308" stopOpacity={0.05} />
                                        <stop offset={`${getOffset(refRange.max)}%`} stopColor="#22c55e" stopOpacity={0.05} />
                                        <stop offset={`${getOffset(refRange.min)}%`} stopColor="#22c55e" stopOpacity={0.05} />
                                        <stop offset={`${getOffset(refRange.min)}%`} stopColor="#eab308" stopOpacity={0.05} />
                                        <stop offset={`${getOffset(refRange.min * 0.5)}%`} stopColor="#ef4444" stopOpacity={0.15} />
                                      </linearGradient>
                                    )}
                                  </defs>
                                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: 'hsl(var(--muted-foreground))' }} dy={10} />
                                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: 'hsl(var(--muted-foreground))' }} domain={[yMin, yMax]} />
                                  {refRange && <ReferenceArea y1={yMin} y2={yMax} fill={`url(#gradient-${exam.id})`} fillOpacity={1} isFront={false} />}
                                  <Tooltip content={<CustomTooltip refRange={refRange} unit={exam.unit} />} cursor={{ stroke: 'hsl(var(--primary))', strokeWidth: 1, strokeDasharray: '5 5' }} />
                                  <Line type="monotone" dataKey="value" stroke="hsl(var(--foreground))" strokeWidth={2.5} dot={<CustomDot refRange={refRange} />} activeDot={{ r: 8, strokeWidth: 4, stroke: 'hsl(var(--card))', className: "filter drop-shadow-md" }} animationDuration={2000} />
                                </LineChart>
                              </ResponsiveContainer>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const CustomDot = (props: any) => {
  const { cx, cy, payload, refRange } = props;
  if (!refRange) return <circle cx={cx} cy={cy} r={4} fill="hsl(var(--muted-foreground))" />;
  const dynamicColor = getDynamicColor(payload.value, refRange.min, refRange.max);
  return <circle cx={cx} cy={cy} r={5} fill="hsl(var(--card))" stroke={dynamicColor} strokeWidth={3} className="filter drop-shadow-sm" />;
};

const CustomTooltip = ({ active, payload, refRange, unit }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const dynamicColor = refRange ? getDynamicColor(data.value, refRange.min, refRange.max) : '#22c55e';
    const interpretation = refRange ? getInterpretation(data.value, refRange.min, refRange.max) : 'Normal';
    const insight = data.previousValue !== null ? getClinicalInsight(data.examId, data.value, data.previousValue, unit) : null;
    return (
      <div className="bg-card p-6 rounded-3xl shadow-2xl border border-border space-y-4 min-w-[260px]">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2"><Calendar className="w-3.5 h-3.5 text-muted-foreground" /><p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{data.fullDate}</p></div>
          <div className="flex items-center gap-2 px-3 py-1 rounded-full text-[9px] font-black uppercase" style={{ backgroundColor: `${dynamicColor}15`, color: dynamicColor }}><div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: dynamicColor }} />{interpretation}</div>
        </div>
        <div className="space-y-1">
          <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Valor Atual</p>
          <div className="flex items-baseline gap-2"><p className="text-4xl font-black text-foreground">{data.value}</p><p className="text-sm font-bold text-muted-foreground uppercase">{unit}</p></div>
        </div>
        {data.previousValue !== null && (
          <div className="grid grid-cols-2 gap-4 pt-2 border-t border-border">
            <div className="space-y-1"><p className="text-[9px] font-bold text-muted-foreground uppercase">Anterior</p><p className="text-sm font-black text-foreground">{data.previousValue} {unit}</p></div>
            <div className="space-y-1"><p className="text-[9px] font-bold text-muted-foreground uppercase">Variação</p><p className="text-sm font-black" style={{ color: insight?.color }}>{insight?.diff && insight.diff > 0 ? '+' : ''}{insight?.diff?.toFixed(1)} {unit}</p></div>
          </div>
        )}
        {insight && (
          <div className="p-4 rounded-2xl border flex items-center gap-3" style={{ backgroundColor: `${insight.color}05`, borderColor: `${insight.color}20` }}>
            <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center shadow-sm", insight.icon === 'up' ? "bg-green-50" : insight.icon === 'down' ? "bg-red-50" : "bg-yellow-50")}>
              {insight.icon === 'up' ? <TrendingUp className="w-4 h-4 text-green-600" /> : insight.icon === 'down' ? <TrendingDown className="w-4 h-4 text-red-600" /> : <Activity className="w-4 h-4 text-yellow-600" />}
            </div>
            <div className="flex-1">
              <p className="text-[11px] font-black leading-tight mb-0.5" style={{ color: insight.color }}>{insight.text}</p>
              <p className="text-[9px] font-bold text-muted-foreground uppercase">{insight.percent > 0 ? '+' : ''}{insight.percent.toFixed(1)}%</p>
            </div>
          </div>
        )}
      </div>
    );
  }
  return null;
};

function MetsIRInfoModal({ onClose }: { onClose: () => void }) {
  const [showReferences, setShowReferences] = useState(false);
  const references = [
    "Bello-Chavolla OY, et al. METS-IR, a Novel Score to Evaluate Insulin Sensitivity. European Journal of Endocrinology. 2018.",
    "Duan M, et al. METS-IR Predicts All-Cause and Cardiovascular Mortality. Cardiovascular Diabetology. 2024.",
    "Guo Z, et al. Association Between METS-IR and Hypertension. Lipids in Health and Disease. 2025.",
    "Li J, et al. METS-VF and METS-IR as Predictors of AMI. Medicine. 2025.",
    "Tunç Karaman S. Insulin Resistance in Non-Diabetic Hypothyroid Patients. Current Medical Research and Opinion. 2023.",
    "Yin H, et al. Association Between METS-IR and OSA. Scientific Reports. 2025.",
    "Cheng H, et al. Association Between METS-IR and Prediabetes in China. Int J Environ Res Public Health. 2023.",
    "He Y, et al. METS-IR and Cardiovascular Disease Incidence. Frontiers in Endocrinology. 2025."
  ];

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4 overflow-y-auto">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-card w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden my-8">
        <div className="p-8 border-b border-border flex items-center justify-between bg-muted/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground"><TrendingUp className="w-6 h-6" /></div>
            <div>
              <h3 className="text-xl font-black text-foreground">O que é o METS-IR?</h3>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Metabolic Score for Insulin Resistance</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-card rounded-full transition-colors"><X className="w-6 h-6 text-muted-foreground" /></button>
        </div>
        <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto">
          <p className="text-sm text-muted-foreground leading-relaxed">O METS-IR é um índice não dependente da dosagem de insulina, utilizado para estimar a sensibilidade à insulina a partir de glicemia, triglicerídeos, IMC e HDL-colesterol.</p>
          <div className="p-6 bg-primary/5 rounded-3xl border border-primary/10">
            <p className="text-[10px] font-black text-primary/60 uppercase tracking-widest mb-2">Fórmula</p>
            <p className="text-lg font-black text-foreground">[Ln(2 × Glicemia + TG) × IMC] ÷ Ln(HDL)</p>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 bg-orange-500/10 rounded-xl border border-orange-500/20">
              <span className="text-xs font-bold text-orange-600">Risco de diabetes tipo 2</span><span className="text-sm font-black text-orange-700">&gt; 50,39</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-orange-500/10 rounded-xl border border-orange-500/20">
              <span className="text-xs font-bold text-orange-600">Mortalidade cardiovascular</span><span className="text-sm font-black text-orange-700">&gt; 41,33</span>
            </div>
          </div>
          <section className="pt-4 border-t border-border">
            <button onClick={() => setShowReferences(!showReferences)} className="w-full flex items-center justify-between p-4 bg-muted rounded-2xl hover:bg-muted/80 transition-colors">
              <div className="flex items-center gap-3"><BookOpen className="w-5 h-5 text-muted-foreground" /><span className="text-sm font-bold text-foreground">📚 Referências</span></div>
              {showReferences ? <ChevronUp className="w-5 h-5 text-muted-foreground" /> : <ChevronDown className="w-5 h-5 text-muted-foreground" />}
            </button>
            <AnimatePresence>
              {showReferences && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                  <div className="p-4 space-y-4">
                    {references.map((ref, i) => (
                      <div key={i} className="flex gap-3 text-[11px] text-muted-foreground leading-relaxed"><span className="font-black text-primary">{i + 1}.</span><span>{ref}</span></div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </section>
        </div>
        <div className="p-8 bg-muted/50 border-t border-border flex justify-center">
          <button onClick={onClose} className="px-8 py-3 bg-card text-muted-foreground border border-border rounded-2xl font-bold hover:bg-muted transition-all">Fechar</button>
        </div>
      </motion.div>
    </div>
  );
}
