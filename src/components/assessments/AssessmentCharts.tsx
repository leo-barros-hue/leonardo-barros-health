import React, { useState, useMemo, useEffect } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, AreaChart, Area, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  ComposedChart, ReferenceArea, ReferenceLine
} from 'recharts';
import { Assessment, Circumferences, Skinfolds, PROTOCOL_FOLDS } from './types';
import { format, parseISO } from 'date-fns';
import { 
  ChevronRight, Activity, Maximize2, Layers, Check,
  TrendingDown, TrendingUp, Minus, Dna, Info, X
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  assessments: Assessment[];
}

type ViewType = 'general' | 'region' | 'radar';
type CompositionKey = 'weight' | 'bodyFat' | 'leanMass' | 'fatMass' | 'ffmi';

const FFMI_RANGES = {
  Masculino: [
    { min: 0, max: 18, label: 'Baixo desenvolvimento muscular', color: '#fee2e2', textColor: '#991b1b' },
    { min: 18, max: 20, label: 'Média populacional', color: '#fef9c3', textColor: '#854d0e' },
    { min: 20, max: 22, label: 'Bom desenvolvimento muscular', color: '#dcfce7', textColor: '#166534' },
    { min: 22, max: 25, label: 'Alto desenvolvimento muscular', color: '#bbf7d0', textColor: '#15803d' },
    { min: 25, max: 35, label: 'Possível uso de esteroides', color: '#fecaca', textColor: '#b91c1c' },
  ],
  Feminino: [
    { min: 0, max: 15, label: 'Baixo desenvolvimento muscular', color: '#fee2e2', textColor: '#991b1b' },
    { min: 15, max: 17, label: 'Média populacional', color: '#fef9c3', textColor: '#854d0e' },
    { min: 17, max: 19, label: 'Bom desenvolvimento muscular', color: '#dcfce7', textColor: '#166534' },
    { min: 19, max: 21, label: 'Muito alto desenvolvimento muscular', color: '#bbf7d0', textColor: '#15803d' },
    { min: 21, max: 35, label: 'Possível uso de esteroides', color: '#fecaca', textColor: '#b91c1c' },
  ]
};

const BODY_FAT_RANGES = {
  Masculino: [
    { min: 0, max: 6, label: 'Gordura Essencial', color: '#dbeafe', textColor: '#1e40af' },
    { min: 6, max: 14, label: 'Atletas', color: '#d1fae5', textColor: '#065f46' },
    { min: 14, max: 18, label: 'Fitness/Saudável', color: '#ecfccb', textColor: '#3f6212' },
    { min: 18, max: 25, label: 'Aceitável', color: '#fef9c3', textColor: '#854d0e' },
    { min: 25, max: 30, label: 'Sobrepeso', color: '#ffedd5', textColor: '#9a3412' },
    { min: 30, max: 55, label: 'Obesidade', color: '#fecaca', textColor: '#991b1b' },
  ],
  Feminino: [
    { min: 0, max: 14, label: 'Gordura Essencial', color: '#dbeafe', textColor: '#1e40af' },
    { min: 14, max: 21, label: 'Atletas', color: '#d1fae5', textColor: '#065f46' },
    { min: 21, max: 25, label: 'Fitness/Saudável', color: '#ecfccb', textColor: '#3f6212' },
    { min: 25, max: 32, label: 'Aceitável', color: '#fef9c3', textColor: '#854d0e' },
    { min: 32, max: 39, label: 'Sobrepeso', color: '#ffedd5', textColor: '#9a3412' },
    { min: 39, max: 65, label: 'Obesidade', color: '#fecaca', textColor: '#991b1b' },
  ]
};

const CIRC_CONFIG: Record<keyof Circumferences, { label: string; color: string; group: 'tronco' | 'superior' | 'inferior' }> = {
  peitoral: { label: 'Peitoral', color: '#1e40af', group: 'tronco' },
  cintura: { label: 'Cintura', color: '#3b82f6', group: 'tronco' },
  abdomen: { label: 'Abdome', color: '#60a5fa', group: 'tronco' },
  quadril: { label: 'Quadril', color: '#93c5fd', group: 'tronco' },
  bracoDireitoContraido: { label: 'Braço D. Contraído', color: '#6b21a8', group: 'superior' },
  bracoEsquerdoContraido: { label: 'Braço E. Contraído', color: '#7e22ce', group: 'superior' },
  bracoDireitoRelaxado: { label: 'Braço D. Relaxado', color: '#9333ea', group: 'superior' },
  bracoEsquerdoRelaxado: { label: 'Braço E. Relaxado', color: '#a855f7', group: 'superior' },
  antebracoDireito: { label: 'Antebraço D.', color: '#c084fc', group: 'superior' },
  antebracoEsquerdo: { label: 'Antebraço E.', color: '#d8b4fe', group: 'superior' },
  coxaDireita: { label: 'Coxa Direita', color: '#166534', group: 'inferior' },
  coxaEsquerda: { label: 'Coxa Esquerda', color: '#15803d', group: 'inferior' },
  panturrilhaDireita: { label: 'Panturrilha D.', color: '#22c55e', group: 'inferior' },
  panturrilhaEsquerda: { label: 'Panturrilha E.', color: '#4ade80', group: 'inferior' },
};

const FOLDS_CONFIG: Record<keyof Skinfolds, { label: string; color: string; group: 'tronco' | 'superior' | 'inferior' }> = {
  peitoral: { label: 'Peitoral', color: '#0369a1', group: 'tronco' },
  axilarMedia: { label: 'Axilar Média', color: '#0ea5e9', group: 'tronco' },
  subescapular: { label: 'Subescapular', color: '#38bdf8', group: 'tronco' },
  abdominal: { label: 'Abdominal', color: '#7dd3fc', group: 'tronco' },
  supraIliaca: { label: 'Supra-ilíaca', color: '#bae6fd', group: 'tronco' },
  bicipital: { label: 'Bicipital', color: '#7c3aed', group: 'superior' },
  tricipital: { label: 'Tricipital', color: '#a78bfa', group: 'superior' },
  coxa: { label: 'Coxa', color: '#059669', group: 'inferior' },
  panturrilha: { label: 'Panturrilha', color: '#34d399', group: 'inferior' },
};

const DEFAULT_CIRC_VISIBLE: (keyof Circumferences)[] = ['cintura', 'abdomen', 'quadril', 'peitoral', 'coxaDireita', 'bracoDireitoContraido'];
const DEFAULT_FOLDS_VISIBLE: (keyof Skinfolds)[] = ['abdominal', 'supraIliaca', 'tricipital', 'subescapular'];

export default function AssessmentCharts({ assessments }: Props) {
  const [visibleCircs, setVisibleCircs] = useState<Set<keyof Circumferences>>(new Set(DEFAULT_CIRC_VISIBLE));
  const [visibleFolds, setVisibleFolds] = useState<Set<keyof Skinfolds>>(new Set(DEFAULT_FOLDS_VISIBLE));
  const [activeCircView, setActiveCircView] = useState<ViewType>('general');
  const [activeFoldView, setActiveFoldView] = useState<ViewType>('general');
  const [compositionView, setCompositionView] = useState<'dynamic' | 'stack'>('dynamic');
  const [visibleComposition, setVisibleComposition] = useState<Set<CompositionKey>>(new Set(['weight', 'bodyFat', 'leanMass', 'fatMass']));
  const [selectedRadarIndices, setSelectedRadarIndices] = useState<Set<number>>(new Set());
  const [showFFMIInfo, setShowFFMIInfo] = useState(false);

  const selectAllCircs = () => {
    const allKeys = Object.keys(CIRC_CONFIG) as (keyof Circumferences)[];
    setVisibleCircs(allKeys.every(k => visibleCircs.has(k)) ? new Set() : new Set(allKeys));
  };

  const selectAllFolds = () => {
    const allKeys = Object.keys(FOLDS_CONFIG) as (keyof Skinfolds)[];
    setVisibleFolds(allKeys.every(k => visibleFolds.has(k)) ? new Set() : new Set(allKeys));
  };

  const sortedData = useMemo(() => [...assessments].sort((a, b) => a.date.localeCompare(b.date)), [assessments]);

  useEffect(() => {
    if (selectedRadarIndices.size === 0 && sortedData.length > 0) {
      const initial = new Set<number>();
      initial.add(0);
      if (sortedData.length > 1) initial.add(sortedData.length - 1);
      setSelectedRadarIndices(initial);
    }
  }, [sortedData.length]);
  
  const chartData = useMemo(() => sortedData.map((item, index) => {
    const prev = index > 0 ? sortedData[index - 1] : null;
    const variations: Record<string, number> = {};
    
    variations['weight'] = prev ? item.weight - prev.weight : 0;
    variations['bodyFat'] = prev ? item.results.bodyFat - prev.results.bodyFat : 0;
    variations['leanMass'] = prev ? item.results.leanMass - prev.results.leanMass : 0;
    variations['fatMass'] = prev ? item.results.fatMass - prev.results.fatMass : 0;
    
    const heightInMeters = item.height / 100;
    const ffmi = item.results.leanMass / (heightInMeters * heightInMeters);
    const prevHeightInMeters = prev ? prev.height / 100 : 0;
    const prevFfmi = prev ? prev.results.leanMass / (prevHeightInMeters * prevHeightInMeters) : 0;
    variations['ffmi'] = prev ? ffmi - prevFfmi : 0;

    Object.keys(item.circumferences).forEach(key => {
      const k = key as keyof Circumferences;
      variations[k] = prev ? (item.circumferences[k] || 0) - (prev.circumferences[k] || 0) : 0;
    });

    Object.keys(item.skinfolds).forEach(key => {
      const k = key as keyof Skinfolds;
      variations[`fold_${k}`] = prev ? (item.skinfolds[k] || 0) - (prev.skinfolds[k] || 0) : 0;
    });

    return {
      date: format(parseISO(item.date), 'dd/MM'),
      fullDate: format(parseISO(item.date), 'dd/MM/yyyy'),
      weight: item.weight,
      bodyFat: item.results.bodyFat,
      leanMass: item.results.leanMass,
      fatMass: item.results.fatMass,
      ffmi: Number(ffmi.toFixed(2)),
      height: item.height / 100,
      gender: item.gender,
      sumFolds: item.results.sumFolds,
      ...item.circumferences,
      ...Object.fromEntries(Object.entries(item.skinfolds).map(([k, v]) => [`fold_${k}`, v])),
      variations
    };
  }), [sortedData]);

  const fatDiff = useMemo(() => {
    if (sortedData.length < 2) return null;
    return sortedData[sortedData.length - 1].results.bodyFat - sortedData[sortedData.length - 2].results.bodyFat;
  }, [sortedData]);

  const radarData = useMemo(() => {
    if (sortedData.length === 0) return [];
    const first = sortedData[0];
    const last = sortedData[sortedData.length - 1];
    return Object.keys(CIRC_CONFIG).map(key => {
      const k = key as keyof Circumferences;
      const valA = first.circumferences[k] || 0;
      const valB = last.circumferences[k] || 0;
      return { subject: CIRC_CONFIG[k].label, key: k, A: valA, B: valB, fullMark: 120, variations: { A: 0, B: valB - valA } };
    });
  }, [sortedData]);

  const radarFoldsData = useMemo(() => {
    if (sortedData.length === 0) return [];
    const latestAssessment = sortedData[sortedData.length - 1];
    const protocolFolds = PROTOCOL_FOLDS[latestAssessment.protocol] || [];
    return protocolFolds.map(k => {
      const result: any = { subject: FOLDS_CONFIG[k].label, key: k, fullMark: 40, variations: {} };
      sortedData.forEach((assessment, idx) => {
        const currentVal = assessment.skinfolds[k] || 0;
        result[`val_${idx}`] = currentVal;
        result.variations[`val_${idx}`] = idx > 0 ? currentVal - (sortedData[idx - 1].skinfolds[k] || 0) : 0;
      });
      return result;
    });
  }, [sortedData]);

  if (assessments.length < 1) {
    return (
      <div className="bg-white p-12 rounded-2xl border border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400">
        <Activity className="w-12 h-12 mb-4 opacity-20" />
        <p className="text-sm font-medium">Dados insuficientes para gerar gráficos.</p>
      </div>
    );
  }

  const toggleComposition = (key: CompositionKey) => {
    const next = new Set(visibleComposition);
    if (next.has(key)) next.delete(key); else next.add(key);
    setVisibleComposition(next);
  };

  const selectAllComposition = () => {
    const allKeys: CompositionKey[] = ['weight', 'bodyFat', 'leanMass', 'fatMass', 'ffmi'];
    setVisibleComposition(allKeys.every(k => visibleComposition.has(k)) ? new Set() : new Set(allKeys));
  };

  const toggleCirc = (key: keyof Circumferences) => {
    const next = new Set(visibleCircs);
    if (next.has(key)) next.delete(key); else next.add(key);
    setVisibleCircs(next);
  };

  const toggleFold = (key: keyof Skinfolds) => {
    const next = new Set(visibleFolds);
    if (next.has(key)) next.delete(key); else next.add(key);
    setVisibleFolds(next);
  };

  const CustomTooltip = ({ active, payload, label, mode = 'circ' }: any) => {
    if (active && payload && payload.length) {
      const unit = mode === 'fold' ? 'mm' : mode === 'percent' ? '%' : mode === 'weight' ? 'kg' : mode === 'composition' ? '' : 'cm';
      const firstPayload = payload[0].payload;
      const isFFMIOnly = payload.length === 1 && payload[0].dataKey === 'ffmi';

      return (
        <div className="bg-white p-4 rounded-xl shadow-2xl border border-black/5 min-w-[220px] relative z-[9999]">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">{label}</p>
          <div className="space-y-3">
            {payload.map((entry: any) => {
              const dataKey = entry.dataKey as string;
              const isPercent = dataKey === 'bodyFat';
              const isFFMI = dataKey === 'ffmi';
              const isSkinfold = dataKey.startsWith('fold_') || mode === 'fold';
              const currentUnit = mode === 'composition' ? (isPercent ? '%' : isFFMI ? '' : 'kg') : unit;
              const variation = entry.payload.variations?.[dataKey] || 0;
              
              let classification = '';
              if (isFFMI) {
                const gender = firstPayload.gender as 'Masculino' | 'Feminino';
                const ranges = FFMI_RANGES[gender];
                const range = ranges.find((r: any) => entry.value >= r.min && entry.value < r.max);
                classification = range ? range.label : '';
              }

              let variationColor = 'text-gray-400';
              if (isSkinfold) {
                variationColor = variation < 0 ? 'text-emerald-500' : variation > 0 ? 'text-rose-500' : 'text-gray-400';
              } else if (dataKey === 'bodyFat' || dataKey === 'fatMass') {
                variationColor = variation < 0 ? 'text-emerald-500' : 'text-rose-500';
              } else {
                variationColor = variation > 0 ? 'text-emerald-500' : 'text-rose-500';
              }

              return (
                <div key={entry.name} className="flex flex-col">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                      <span className="text-xs font-medium text-gray-600">{entry.name}</span>
                    </div>
                    <span className="text-xs font-bold text-gray-900">
                      {typeof entry.value === 'number' ? entry.value.toFixed(isFFMI ? 2 : 1) : entry.value} {currentUnit}
                    </span>
                  </div>
                  {classification && <div className="ml-4 text-[9px] font-bold text-indigo-600">{classification}</div>}
                  {variation !== 0 && (
                    <div className={cn("flex items-center gap-1 text-[9px] font-bold ml-4", variationColor)}>
                      {variation < 0 ? <TrendingDown className="w-3 h-3" /> : <TrendingUp className="w-3 h-3" />}
                      <span>{variation > 0 ? `+${variation.toFixed(isFFMI ? 2 : 1)}` : variation.toFixed(isFFMI ? 2 : 1)} {currentUnit}</span>
                    </div>
                  )}
                </div>
              );
            })}

            {isFFMIOnly && (
              <div className="pt-2 mt-2 border-t border-gray-100 space-y-1">
                <div className="flex justify-between text-[10px]">
                  <span className="text-gray-400">Sexo:</span>
                  <span className="font-bold text-gray-600">{firstPayload.gender}</span>
                </div>
                <div className="flex justify-between text-[10px]">
                  <span className="text-gray-400">Massa Magra:</span>
                  <span className="font-bold text-gray-600">{firstPayload.leanMass.toFixed(1)} kg</span>
                </div>
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  const FilterGroup = ({ title, group, type = 'circ' }: { title: string, group: 'tronco' | 'superior' | 'inferior', type?: 'circ' | 'fold' }) => {
    const config = type === 'circ' ? CIRC_CONFIG : FOLDS_CONFIG;
    const visible = type === 'circ' ? visibleCircs : visibleFolds;
    const toggle = type === 'circ' ? toggleCirc : toggleFold;

    return (
      <div className="space-y-3">
        <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2">{title}</h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-2 gap-2">
          {Object.entries(config)
            .filter(([_, c]) => c.group === group)
            .map(([key, c]) => {
              const k = key as any;
              const isActive = visible.has(k);
              return (
                <button key={key} onClick={() => toggle(k)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-lg text-[11px] font-medium transition-all border",
                    isActive ? "bg-white border-indigo-100 text-indigo-600 shadow-sm" : "bg-gray-50/50 border-transparent text-gray-400 hover:bg-gray-100"
                  )}>
                  <div className={cn("w-3 h-3 rounded flex items-center justify-center transition-colors", isActive ? "bg-indigo-600" : "bg-gray-200")}>
                    {isActive && <Check className="w-2 h-2 text-white" />}
                  </div>
                  <span className="truncate">{c.label}</span>
                </button>
              );
            })}
        </div>
      </div>
    );
  };

  const hasKg = visibleComposition.has('weight') || visibleComposition.has('leanMass') || visibleComposition.has('fatMass');
  const hasOther = visibleComposition.has('bodyFat') || visibleComposition.has('ffmi');
  const useDualAxes = hasKg && hasOther;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-8">
        {/* Composição Corporal */}
        <div className="bg-white rounded-3xl shadow-sm border border-black/5">
          <div className="p-6 border-b border-gray-50 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Dna className="w-4 h-4 text-indigo-600" />
                <h3 className="text-sm font-bold text-gray-900">Painel Dinâmico de Composição Corporal</h3>
              </div>
              <p className="text-xs text-gray-400">Análise integrada de peso, gordura e massa magra</p>
            </div>
            <div className="flex items-center gap-4">
              {fatDiff !== null && (
                <div className={cn("flex items-center gap-2 px-3 py-1.5 rounded-xl text-[11px] font-bold",
                  fatDiff > 0 ? "bg-rose-50 text-rose-600" : fatDiff < 0 ? "bg-emerald-50 text-emerald-600" : "bg-gray-50 text-gray-600")}>
                  <span className="text-gray-400 font-medium mr-1 uppercase tracking-wider">Evolução %:</span>
                  {fatDiff > 0 ? <TrendingUp className="w-3.5 h-3.5" /> : fatDiff < 0 ? <TrendingDown className="w-3.5 h-3.5" /> : <Minus className="w-3.5 h-3.5" />}
                  <span>{fatDiff > 0 ? `+${fatDiff.toFixed(1)}` : fatDiff.toFixed(1)}%</span>
                </div>
              )}
              <div className="flex items-center bg-gray-50 p-1 rounded-xl">
                <button onClick={() => setCompositionView('dynamic')}
                  className={cn("px-4 py-1.5 rounded-lg text-[10px] font-bold transition-all",
                    compositionView === 'dynamic' ? "bg-white text-indigo-600 shadow-sm" : "text-gray-400 hover:text-gray-600")}>
                  Dinâmico
                </button>
                <button onClick={() => setCompositionView('stack')}
                  className={cn("px-4 py-1.5 rounded-lg text-[10px] font-bold transition-all",
                    compositionView === 'stack' ? "bg-white text-indigo-600 shadow-sm" : "text-gray-400 hover:text-gray-600")}>
                  Stack
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4">
            <div className="lg:col-span-1 p-6 bg-gray-50/30 border-r border-gray-50 space-y-8">
              <button onClick={selectAllComposition}
                className={cn("w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-widest transition-all border",
                  ['weight', 'bodyFat', 'leanMass', 'fatMass', 'ffmi'].every(k => visibleComposition.has(k as any))
                    ? "bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-100"
                    : "bg-white border-gray-200 text-gray-500 hover:border-indigo-200 hover:text-indigo-600")}>
                <Check className="w-3.5 h-3.5" />
                {['weight', 'bodyFat', 'leanMass', 'fatMass', 'ffmi'].every(k => visibleComposition.has(k as any)) ? 'Desmarcar Todos' : 'Selecionar Todos'}
              </button>

              <div className="space-y-3">
                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2">Variáveis</h4>
                <div className="flex flex-col gap-2">
                  {[
                    { key: 'bodyFat', label: '% Gordura', color: '#4f46e5' },
                    { key: 'weight', label: 'Peso Corporal', color: '#1e293b' },
                    { key: 'fatMass', label: 'Massa Gorda', color: '#f43f5e' },
                    { key: 'leanMass', label: 'Massa Magra', color: '#10b981' },
                    { key: 'ffmi', label: 'FFMI', color: '#7c3aed' },
                  ].map((item) => {
                    const isActive = visibleComposition.has(item.key as CompositionKey);
                    return (
                      <div key={item.key} onClick={() => toggleComposition(item.key as CompositionKey)}
                        className={cn("flex items-center justify-between px-3 py-2.5 rounded-lg text-[11px] font-medium transition-all border group cursor-pointer",
                          isActive ? "bg-white border-indigo-100 text-indigo-600 shadow-sm" : "bg-gray-50/50 border-transparent text-gray-400 hover:bg-gray-100")}>
                        <div className="flex items-center gap-2 overflow-hidden">
                          <div className={cn("w-3 h-3 rounded flex-shrink-0 flex items-center justify-center transition-colors", isActive ? "" : "bg-gray-200")}
                            style={isActive ? { backgroundColor: item.color } : {}}>
                            {isActive && <Check className="w-2 h-2 text-white" />}
                          </div>
                          <span className="truncate">{item.label}</span>
                        </div>
                        {item.key === 'ffmi' && (
                          <button onClick={(e) => { e.stopPropagation(); setShowFFMIInfo(true); }}
                            className="p-1 rounded-full hover:bg-indigo-50 text-gray-400 hover:text-indigo-600 transition-colors">
                            <Info className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="lg:col-span-3 p-6">
              <div className="h-[450px]">
                <ResponsiveContainer width="100%" height="100%">
                  {compositionView === 'dynamic' ? (
                    <ComposedChart data={chartData} margin={{ top: 10, right: 30, left: 30, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f8fafc" />
                      <XAxis dataKey="fullDate" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} interval={0} minTickGap={0} padding={{ left: 20, right: 20 }} dy={10} />
                      {(hasKg || hasOther) && (
                        <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9ca3af' }}
                          unit={hasKg ? "kg" : visibleComposition.has('bodyFat') ? "%" : ""}
                          domain={visibleComposition.size === 1 && visibleComposition.has('ffmi') ? [12, 35] : visibleComposition.size === 1 && visibleComposition.has('bodyFat') ? [0, assessments[0].gender === 'Masculino' ? 55 : 65] : ['auto', 'auto']} />
                      )}
                      {useDualAxes && (
                        <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9ca3af' }}
                          unit={visibleComposition.has('bodyFat') ? "%" : ""} domain={['auto', 'auto']} />
                      )}
                      <Tooltip content={<CustomTooltip mode="composition" />} wrapperStyle={{ zIndex: 9999 }} allowEscapeViewBox={{ x: true, y: true }} />
                      <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ paddingBottom: '30px', fontSize: '11px' }} />
                      
                      {visibleComposition.has('fatMass') && <Area yAxisId="left" type="monotone" dataKey="fatMass" name="Massa Gorda" fill="#f43f5e" stroke="#f43f5e" fillOpacity={0.1} strokeWidth={1} />}
                      {visibleComposition.has('weight') && <Line yAxisId="left" type="monotone" dataKey="weight" name="Peso Total" stroke="#1e293b" strokeWidth={3} dot={{ r: 4, fill: '#1e293b', strokeWidth: 2, stroke: '#fff' }} />}
                      {visibleComposition.has('leanMass') && <Line yAxisId="left" type="monotone" dataKey="leanMass" name="Massa Magra" stroke="#10b981" strokeWidth={2} dot={{ r: 3, fill: '#10b981' }} />}
                      {visibleComposition.has('bodyFat') && <Line yAxisId={useDualAxes ? "right" : "left"} type="monotone" dataKey="bodyFat" name="% Gordura" stroke="#4f46e5" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 3, fill: '#4f46e5' }} unit="%" />}

                      {visibleComposition.has('bodyFat') && visibleComposition.size === 1 && BODY_FAT_RANGES[assessments[0].gender].map((range, i) => (
                        <ReferenceArea key={`bf-${i}`} yAxisId={useDualAxes ? "right" : "left"} y1={range.min} y2={range.max} fill={range.color} fillOpacity={0.4}
                          label={{ value: range.label, position: 'insideRight', fill: range.textColor, fontSize: 8, fontWeight: 'bold' }} />
                      ))}

                      {visibleComposition.has('ffmi') && visibleComposition.size === 1 && FFMI_RANGES[assessments[0].gender].map((range, i) => (
                        <ReferenceArea key={`ffmi-${i}`} yAxisId={useDualAxes ? "right" : "left"} y1={range.min} y2={range.max} fill={range.color} fillOpacity={0.4}
                          label={{ value: range.label, position: 'insideRight', fill: range.textColor, fontSize: 8, fontWeight: 'bold' }} />
                      ))}

                      {visibleComposition.has('ffmi') && visibleComposition.size === 1 && assessments[0].gender === 'Masculino' && (
                        <ReferenceLine y={25} yAxisId="left" stroke="#94a3b8" strokeDasharray="3 3"
                          label={{ value: 'Limite Natural (Casey Butt)', position: 'top', fill: '#64748b', fontSize: 10, fontWeight: 'bold' }} />
                      )}

                      {visibleComposition.has('ffmi') && <Line yAxisId={useDualAxes ? "right" : "left"} type="monotone" dataKey="ffmi" name="FFMI" stroke="#7c3aed" strokeWidth={3} dot={{ r: 4, fill: '#7c3aed', strokeWidth: 2, stroke: '#fff' }} animationDuration={1500} />}
                    </ComposedChart>
                  ) : (
                    <BarChart data={chartData} margin={{ top: 10, right: 30, left: 30, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f8fafc" />
                      <XAxis dataKey="fullDate" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} interval={0} minTickGap={0} padding={{ left: 20, right: 20 }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9ca3af' }} unit="kg" />
                      <Tooltip content={<CustomTooltip mode="composition" />} wrapperStyle={{ zIndex: 9999 }} allowEscapeViewBox={{ x: true, y: true }} />
                      <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ paddingBottom: '30px', fontSize: '11px' }} />
                      <Bar dataKey="leanMass" name="Massa Magra" stackId="a" fill="#10b981" radius={[0, 0, 0, 0]} />
                      <Bar dataKey="fatMass" name="Massa Gorda" stackId="a" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  )}
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dobras Cutâneas */}
      <div className="bg-white rounded-3xl shadow-sm border border-black/5">
        <div className="p-6 border-b border-gray-50 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <h3 className="text-sm font-bold text-gray-900">Distribuição de Dobras Cutâneas</h3>
            <p className="text-xs text-gray-400 mt-1">Evolução detalhada de cada ponto de medição</p>
          </div>
          <div className="flex items-center bg-gray-50 p-1 rounded-xl">
            {(['general', 'region', 'radar'] as const).map(view => (
              <button key={view} onClick={() => setActiveFoldView(view)}
                className={cn("px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2",
                  activeFoldView === view ? "bg-white text-indigo-600 shadow-sm" : "text-gray-400 hover:text-gray-600")}>
                {view === 'general' ? <><Activity className="w-4 h-4" />Geral</> : view === 'region' ? <><Layers className="w-4 h-4" />Por Região</> : <><Maximize2 className="w-4 h-4" />Radar</>}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4">
          <div className="lg:col-span-1 p-6 bg-gray-50/30 border-r border-gray-50 space-y-8">
            <button onClick={selectAllFolds}
              className={cn("w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-widest transition-all border",
                Object.keys(FOLDS_CONFIG).every(k => visibleFolds.has(k as any))
                  ? "bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-100"
                  : "bg-white border-gray-200 text-gray-500 hover:border-indigo-200 hover:text-indigo-600")}>
              <Check className="w-3.5 h-3.5" />
              {Object.keys(FOLDS_CONFIG).every(k => visibleFolds.has(k as any)) ? 'Desmarcar Todos' : 'Selecionar Todos'}
            </button>
            <FilterGroup title="Tronco" group="tronco" type="fold" />
            <FilterGroup title="Membros Superiores" group="superior" type="fold" />
            <FilterGroup title="Membros Inferiores" group="inferior" type="fold" />
          </div>

          <div className="lg:col-span-3 p-6">
            <div className={cn("transition-all duration-300", activeFoldView === 'region' ? "h-[750px]" : "h-[450px]")}>
              {activeFoldView === 'radar' ? (
                <div className="h-full flex flex-col">
                  <div className="flex flex-wrap gap-2 mb-6 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <p className="w-full text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Comparar Avaliações:</p>
                    {sortedData.map((assessment, idx) => (
                      <button key={assessment.id} onClick={() => {
                        const next = new Set(selectedRadarIndices);
                        if (next.has(idx)) { if (next.size > 1) next.delete(idx); } else { next.add(idx); }
                        setSelectedRadarIndices(next);
                      }}
                        className={cn("px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all border",
                          selectedRadarIndices.has(idx) ? "bg-white border-indigo-200 text-indigo-600 shadow-sm" : "bg-transparent border-transparent text-gray-400 hover:text-gray-600")}>
                        {format(parseISO(assessment.date), 'dd/MM/yy')}
                      </button>
                    ))}
                  </div>
                  <div className="flex-1">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarFoldsData}>
                        <PolarGrid stroke="#f0f0f0" />
                        <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: '#9ca3af' }} />
                        <PolarRadiusAxis angle={30} domain={[0, 40]} tick={false} axisLine={false} />
                        {sortedData.map((assessment, idx) => {
                          if (!selectedRadarIndices.has(idx)) return null;
                          const isLatest = idx === sortedData.length - 1;
                          return <Radar key={assessment.id} name={format(parseISO(assessment.date), 'dd/MM/yy')} dataKey={`val_${idx}`} stroke={isLatest ? "#4f46e5" : "#94a3b8"} fill={isLatest ? "#4f46e5" : "#94a3b8"} fillOpacity={isLatest ? 0.5 : 0.2} />;
                        })}
                        <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '11px' }} />
                        <Tooltip content={<CustomTooltip mode="fold" />} wrapperStyle={{ zIndex: 9999 }} allowEscapeViewBox={{ x: true, y: true }} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              ) : activeFoldView === 'region' ? (
                <div className="h-full grid grid-rows-3 gap-6">
                  {(['tronco', 'superior', 'inferior'] as const).map(group => (
                    <div key={group} className="relative pt-4">
                      <div className="absolute top-0 left-0 text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                        {group === 'tronco' ? 'Tronco' : group === 'superior' ? 'Membros Superiores' : 'Membros Inferiores'}
                      </div>
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 25 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f8fafc" />
                          <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#9ca3af' }} />
                          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#9ca3af' }} domain={['auto', 'auto']} />
                          <Tooltip content={<CustomTooltip mode="fold" />} wrapperStyle={{ zIndex: 9999 }} allowEscapeViewBox={{ x: true, y: true }} />
                          <Legend iconType="circle" wrapperStyle={{ paddingTop: '10px', fontSize: '9px' }} formatter={(value) => <span className="text-gray-600 font-medium">{value}</span>} />
                          {Object.entries(FOLDS_CONFIG).filter(([k, config]) => config.group === group && visibleFolds.has(k as keyof Skinfolds)).map(([key, config]) => (
                            <Line key={key} type="monotone" dataKey={`fold_${key}`} name={config.label} stroke={config.color} strokeWidth={2} dot={{ r: 3, fill: config.color }} animationDuration={1000} />
                          ))}
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  ))}
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis dataKey="fullDate" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9ca3af' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9ca3af' }} domain={['auto', 'auto']} />
                    <Tooltip content={<CustomTooltip mode="fold" />} wrapperStyle={{ zIndex: 9999 }} allowEscapeViewBox={{ x: true, y: true }} />
                    <Legend iconType="circle" wrapperStyle={{ paddingTop: '30px', fontSize: '11px' }} formatter={(value) => <span className="text-gray-600 font-medium">{value}</span>} />
                    {Object.entries(FOLDS_CONFIG).map(([key, config]) => {
                      if (!visibleFolds.has(key as keyof Skinfolds)) return null;
                      return <Line key={key} type="monotone" dataKey={`fold_${key}`} name={config.label} stroke={config.color} strokeWidth={2.5} dot={{ r: 4, fill: config.color, strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6, strokeWidth: 0 }} animationDuration={1000} />;
                    })}
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Circunferências */}
      <div className="bg-white rounded-3xl shadow-sm border border-black/5">
        <div className="p-6 border-b border-gray-50 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <h3 className="text-sm font-bold text-gray-900">Painel de Circunferências</h3>
            <p className="text-xs text-gray-400 mt-1">Acompanhe a evolução das medidas corporais</p>
          </div>
          <div className="flex items-center bg-gray-50 p-1 rounded-xl self-start">
            {(['general', 'region', 'radar'] as const).map(view => (
              <button key={view} onClick={() => setActiveCircView(view)}
                className={cn("px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2",
                  activeCircView === view ? "bg-white text-indigo-600 shadow-sm" : "text-gray-400 hover:text-gray-600")}>
                {view === 'general' ? <><Activity className="w-4 h-4" />Geral</> : view === 'region' ? <><Layers className="w-4 h-4" />Por Região</> : <><Maximize2 className="w-4 h-4" />Radar</>}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4">
          <div className="lg:col-span-1 p-6 bg-gray-50/30 border-r border-gray-50 space-y-8">
            <button onClick={selectAllCircs}
              className={cn("w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-widest transition-all border",
                Object.keys(CIRC_CONFIG).every(k => visibleCircs.has(k as any))
                  ? "bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-100"
                  : "bg-white border-gray-200 text-gray-500 hover:border-indigo-200 hover:text-indigo-600")}>
              <Check className="w-3.5 h-3.5" />
              {Object.keys(CIRC_CONFIG).every(k => visibleCircs.has(k as any)) ? 'Desmarcar Todos' : 'Selecionar Todos'}
            </button>
            <FilterGroup title="Tronco" group="tronco" />
            <FilterGroup title="Membros Superiores" group="superior" />
            <FilterGroup title="Membros Inferiores" group="inferior" />
          </div>

          <div className="lg:col-span-3 p-6">
            <div className={cn("transition-all duration-300", activeCircView === 'region' ? "h-[750px]" : "h-[450px]")}>
              {activeCircView === 'radar' ? (
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                    <PolarGrid stroke="#f0f0f0" />
                    <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: '#9ca3af' }} />
                    <PolarRadiusAxis angle={30} domain={[0, 120]} tick={false} axisLine={false} />
                    <Radar name="Primeira Avaliação" dataKey="A" stroke="#94a3b8" fill="#94a3b8" fillOpacity={0.3} />
                    <Radar name="Última Avaliação" dataKey="B" stroke="#4f46e5" fill="#4f46e5" fillOpacity={0.5} />
                    <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '11px' }} />
                    <Tooltip content={<CustomTooltip mode="circ" />} wrapperStyle={{ zIndex: 9999 }} allowEscapeViewBox={{ x: true, y: true }} />
                  </RadarChart>
                </ResponsiveContainer>
              ) : activeCircView === 'region' ? (
                <div className="h-full grid grid-rows-3 gap-6">
                  {(['tronco', 'superior', 'inferior'] as const).map(group => (
                    <div key={group} className="relative pt-4">
                      <div className="absolute top-0 left-0 text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                        {group === 'tronco' ? 'Tronco' : group === 'superior' ? 'Membros Superiores' : 'Membros Inferiores'}
                      </div>
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 25 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f8fafc" />
                          <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#9ca3af' }} />
                          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#9ca3af' }} domain={['auto', 'auto']} />
                          <Tooltip content={<CustomTooltip mode="circ" />} wrapperStyle={{ zIndex: 9999 }} allowEscapeViewBox={{ x: true, y: true }} />
                          <Legend iconType="circle" wrapperStyle={{ paddingTop: '10px', fontSize: '9px' }} formatter={(value) => <span className="text-gray-600 font-medium">{value}</span>} />
                          {Object.entries(CIRC_CONFIG).filter(([k, config]) => config.group === group && visibleCircs.has(k as keyof Circumferences)).map(([key, config]) => (
                            <Line key={key} type="monotone" dataKey={key} name={config.label} stroke={config.color} strokeWidth={2} dot={{ r: 3, fill: config.color }} animationDuration={1000} />
                          ))}
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  ))}
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis dataKey="fullDate" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9ca3af' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9ca3af' }} domain={['auto', 'auto']} />
                    <Tooltip content={<CustomTooltip mode="circ" />} wrapperStyle={{ zIndex: 9999 }} allowEscapeViewBox={{ x: true, y: true }} />
                    <Legend iconType="circle" wrapperStyle={{ paddingTop: '30px', fontSize: '11px' }} formatter={(value) => <span className="text-gray-600 font-medium">{value}</span>} />
                    {Object.entries(CIRC_CONFIG).map(([key, config]) => {
                      if (!visibleCircs.has(key as keyof Circumferences)) return null;
                      return <Line key={key} type="monotone" dataKey={key} name={config.label} stroke={config.color} strokeWidth={2.5} dot={{ r: 4, fill: config.color, strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6, strokeWidth: 0 }} animationDuration={1000} />;
                    })}
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* FFMI Info Modal */}
      {showFFMIInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-indigo-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-200">
                  <Info className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900">O que é FFMI?</h3>
                  <p className="text-[10px] text-indigo-600 font-medium uppercase tracking-wider">Educação e Saúde</p>
                </div>
              </div>
              <button onClick={() => setShowFFMIInfo(false)} className="p-2 rounded-xl hover:bg-white text-gray-400 hover:text-gray-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-8 space-y-8">
              <p className="text-sm text-gray-600 leading-relaxed">
                <span className="font-bold text-gray-900">FFMI (Fat-Free Mass Index)</span> é uma medida que mostra quanta massa muscular você tem em relação à sua altura. 🏋️‍♂️
              </p>
              <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                <p className="text-[11px] text-gray-500 font-mono text-center">Massa Livre de Gordura (kg) / Altura² (m²)</p>
              </div>
            </div>
            <div className="p-6 bg-gray-50 border-t border-gray-100">
              <button onClick={() => setShowFFMIInfo(false)} className="w-full py-3 bg-white border border-gray-200 rounded-2xl text-sm font-bold text-gray-700 hover:bg-gray-100 transition-all shadow-sm">
                Entendi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
