import React, { useState } from 'react';
import { Protocol, Gender, Skinfolds, Circumferences, PROTOCOL_FOLDS } from './types';
import { Plus, Calculator, Activity, Layers, Scale, Info, X, TrendingUp } from 'lucide-react';
import { calculateAssessment } from './calculations';
import ResultSpectrum from './ResultSpectrum';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  onSubmit: (data: any) => void;
  onCancel?: () => void;
  initialData?: any;
}

export default function AssessmentForm({ onSubmit, onCancel, initialData }: Props) {
  const getDraft = () => {
    if (initialData) return null;
    const saved = localStorage.getItem('assessment_draft');
    return saved ? JSON.parse(saved) : null;
  };

  const draft = getDraft();

  const [protocol, setProtocol] = React.useState<Protocol>(initialData?.protocol || draft?.protocol || '3 dobras Guedes');
  const [gender, setGender] = React.useState<Gender>(initialData?.gender || draft?.gender || 'Masculino');
  const [date, setDate] = React.useState(initialData?.date || draft?.date || new Date().toISOString().split('T')[0]);
  const [age, setAge] = React.useState<number>(initialData?.age || draft?.age || 25);
  const [weight, setWeight] = React.useState<number>(initialData?.weight || draft?.weight || 70);
  const [height, setHeight] = React.useState<number>(initialData?.height || draft?.height || 175);

  const [skinfolds, setSkinfolds] = React.useState<Skinfolds>(initialData?.skinfolds || draft?.skinfolds || {});
  const [circumferences, setCircumferences] = React.useState<Circumferences>(initialData?.circumferences || draft?.circumferences || {});
  const [showFFMIInfo, setShowFFMIInfo] = useState(false);
  const [showBFInfo, setShowBFInfo] = useState(false);

  React.useEffect(() => {
    if (!initialData) {
      const currentDraft = { protocol, gender, date, age, weight, height, skinfolds, circumferences };
      localStorage.setItem('assessment_draft', JSON.stringify(currentDraft));
    }
  }, [protocol, gender, date, age, weight, height, skinfolds, circumferences, initialData]);

  React.useEffect(() => {
    if (initialData) {
      setProtocol(initialData.protocol);
      setGender(initialData.gender);
      setDate(initialData.date);
      setAge(initialData.age);
      setWeight(initialData.weight);
      setHeight(initialData.height);
      setSkinfolds(initialData.skinfolds || {});
      setCircumferences(initialData.circumferences || {});
    }
  }, [initialData]);

  const realTimeResults = React.useMemo(() => {
    return calculateAssessment(protocol, gender, age, weight, height, skinfolds);
  }, [protocol, gender, age, weight, height, skinfolds]);

  const handleFoldChange = (name: keyof Skinfolds, value: string) => {
    setSkinfolds(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
  };

  const handleCircChange = (name: keyof Circumferences, value: string) => {
    setCircumferences(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ date, gender, age, weight, height, protocol, skinfolds, circumferences });
    if (!initialData) {
      localStorage.removeItem('assessment_draft');
    }
  };

  const activeFolds = PROTOCOL_FOLDS[protocol];

  return (
    <form onSubmit={handleSubmit} className="space-y-8 bg-white p-6 rounded-2xl shadow-sm border border-black/5">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">Data da Avaliação</label>
          <input type="date" value={date} onChange={e => setDate(e.target.value)}
            className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all" required />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">Sexo</label>
          <select value={gender} onChange={e => setGender(e.target.value as Gender)}
            className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all">
            <option value="Masculino">Masculino</option>
            <option value="Feminino">Feminino</option>
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">Altura (cm)</label>
          <input type="number" value={height || ''} onChange={e => setHeight(parseFloat(e.target.value) || 0)}
            onFocus={e => e.target.select()}
            className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all" required />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">Peso (kg)</label>
          <input type="number" step="0.1" value={weight || ''} onChange={e => setWeight(parseFloat(e.target.value) || 0)}
            onFocus={e => e.target.select()}
            className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all" required />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">Idade</label>
          <input type="number" value={age || ''} onChange={e => setAge(parseInt(e.target.value) || 0)}
            onFocus={e => e.target.select()}
            className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all" required />
        </div>
        <div className="space-y-2 md:col-span-3">
          <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">Protocolo de Dobras Cutâneas</label>
          <select value={protocol} onChange={e => setProtocol(e.target.value as Protocol)}
            className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all">
            {Object.keys(PROTOCOL_FOLDS).map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-widest text-indigo-600 border-b pb-2">Dobras Cutâneas (mm)</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[
            { id: 'bicipital', label: 'Bicipital' },
            { id: 'peitoral', label: 'Peitoral' },
            { id: 'supraIliaca', label: 'Supra Ilíaca' },
            { id: 'tricipital', label: 'Tricipital' },
            { id: 'axilarMedia', label: 'Axilar Média' },
            { id: 'coxa', label: 'Coxa' },
            { id: 'subescapular', label: 'Subescapular' },
            { id: 'abdominal', label: 'Abdominal' },
            { id: 'panturrilha', label: 'Panturrilha' },
          ].map(fold => {
            const isActive = activeFolds.includes(fold.id as keyof Skinfolds);
            return (
              <div key={fold.id} className={`space-y-1 transition-opacity ${isActive ? 'opacity-100' : 'opacity-30 pointer-events-none'}`}>
                <label className="text-[10px] font-bold uppercase text-gray-400">{fold.label}</label>
                <input type="number" step="0.1" placeholder="0.0"
                  value={skinfolds[fold.id as keyof Skinfolds] || ''}
                  disabled={!isActive}
                  onChange={e => handleFoldChange(fold.id as keyof Skinfolds, e.target.value)}
                  onFocus={e => e.target.select()}
                  className="w-full p-2 text-sm rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none" />
              </div>
            );
          })}
        </div>
      </div>

      <div className="space-y-6">
        <h3 className="text-sm font-bold uppercase tracking-widest text-indigo-600 border-b pb-2">Circunferências (cm)</h3>
        
        <div className="space-y-4">
          <h4 className="text-[10px] font-bold uppercase text-indigo-400 tracking-wider px-1">Membros Superiores</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-slate-50/50 p-3 rounded-xl border border-slate-100">
            {[
              { id: 'bracoDireitoRelaxado', label: 'Braço Dir. Relaxado' },
              { id: 'bracoDireitoContraido', label: 'Braço Dir. Contraído' },
              { id: 'bracoEsquerdoRelaxado', label: 'Braço Esq. Relaxado' },
              { id: 'bracoEsquerdoContraido', label: 'Braço Esq. Contraído' },
              { id: 'antebracoDireito', label: 'Antebraço Dir.' },
              { id: 'antebracoEsquerdo', label: 'Antebraço Esq.' },
            ].map(circ => (
              <div key={circ.id} className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-gray-400 block truncate" title={circ.label}>{circ.label}</label>
                <input type="number" step="0.1" placeholder="0.0"
                  value={circumferences[circ.id as keyof Circumferences] || ''}
                  onChange={e => handleCircChange(circ.id as keyof Circumferences, e.target.value)}
                  onFocus={e => e.target.select()}
                  className="w-full p-2 text-sm rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none bg-white" />
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="text-[10px] font-bold uppercase text-indigo-400 tracking-wider px-1">Tronco</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-slate-50/50 p-3 rounded-xl border border-slate-100">
            {[
              { id: 'peitoral', label: 'Peitoral' },
              { id: 'cintura', label: 'Cintura' },
              { id: 'abdomen', label: 'Abdome' },
              { id: 'quadril', label: 'Quadril' },
            ].map(circ => (
              <div key={circ.id} className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-gray-400 block truncate" title={circ.label}>{circ.label}</label>
                <input type="number" step="0.1" placeholder="0.0"
                  value={circumferences[circ.id as keyof Circumferences] || ''}
                  onChange={e => handleCircChange(circ.id as keyof Circumferences, e.target.value)}
                  onFocus={e => e.target.select()}
                  className="w-full p-2 text-sm rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none bg-white" />
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="text-[10px] font-bold uppercase text-indigo-400 tracking-wider px-1">Membros Inferiores</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-slate-50/50 p-3 rounded-xl border border-slate-100">
            {[
              { id: 'coxaEsquerda', label: 'Coxa Esquerda' },
              { id: 'coxaDireita', label: 'Coxa Direita' },
              { id: 'panturrilhaDireita', label: 'Panturrilha Dir.' },
              { id: 'panturrilhaEsquerda', label: 'Panturrilha Esq.' },
            ].map(circ => (
              <div key={circ.id} className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-gray-400 block truncate" title={circ.label}>{circ.label}</label>
                <input type="number" step="0.1" placeholder="0.0"
                  value={circumferences[circ.id as keyof Circumferences] || ''}
                  onChange={e => handleCircChange(circ.id as keyof Circumferences, e.target.value)}
                  onFocus={e => e.target.select()}
                  className="w-full p-2 text-sm rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none bg-white" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Real-time Results Preview */}
      <div className="space-y-6 bg-slate-50 p-6 rounded-2xl border border-slate-200">
        <div className="flex items-center gap-2 mb-4 text-slate-600">
          <Activity size={18} />
          <h3 className="text-sm font-bold uppercase tracking-widest">Análise Prévia dos Resultados</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center min-h-[120px]">
            <div className="flex items-center gap-1 mb-2">
              <span className="text-[10px] font-bold uppercase text-gray-400">Massa Gorda (%)</span>
              <button type="button" onClick={() => setShowBFInfo(true)}
                className="p-1 rounded-full hover:bg-indigo-50 text-gray-400 hover:text-indigo-600 transition-colors">
                <Info size={12} />
              </button>
            </div>
            <span className="text-3xl font-black font-mono text-rose-600 leading-none mb-1">{realTimeResults.bodyFat}%</span>
            <ResultSpectrum value={realTimeResults.bodyFat} type="bodyFat" gender={gender === 'Masculino' ? 'male' : 'female'} />
          </div>
          
          <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center min-h-[120px]">
            <span className="text-[10px] font-bold uppercase text-gray-400 mb-2">Massa Magra (%)</span>
            <span className="text-3xl font-black font-mono text-emerald-600 leading-none">{(100 - realTimeResults.bodyFat).toFixed(2)}%</span>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center min-h-[120px]">
            <div className="flex items-center gap-1 mb-2">
              <span className="text-[10px] font-bold uppercase text-gray-400">IMC</span>
              <span className="text-[8px] font-medium text-gray-400 lowercase">(índice de massa corporal)</span>
            </div>
            <span className="text-3xl font-black font-mono text-indigo-700 leading-none">{realTimeResults.imc}</span>
            <ResultSpectrum value={realTimeResults.imc} type="bmi" />
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center min-h-[120px]">
            <span className="text-[10px] font-bold uppercase text-gray-400 mb-2">Massa Gorda (kg)</span>
            <span className="text-3xl font-black font-mono text-rose-700 leading-none">{realTimeResults.fatMass} kg</span>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center min-h-[120px]">
            <span className="text-[10px] font-bold uppercase text-gray-400 mb-2">Massa Magra (kg)</span>
            <span className="text-3xl font-black font-mono text-emerald-700 leading-none">{realTimeResults.leanMass} kg</span>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center min-h-[120px]">
            <div className="flex items-center gap-1 mb-2">
              <span className="text-[10px] font-bold uppercase text-gray-400">FFMI</span>
              <span className="text-[8px] font-medium text-gray-400 lowercase">(Fat-Free Mass Index)</span>
              <button type="button" onClick={() => setShowFFMIInfo(true)}
                className="p-1 rounded-full hover:bg-indigo-50 text-gray-400 hover:text-indigo-600 transition-colors">
                <Info size={12} />
              </button>
            </div>
            <span className="text-3xl font-black font-mono text-indigo-600 leading-none">{realTimeResults.ffmi}</span>
            <ResultSpectrum value={realTimeResults.ffmi} type="ffmi" gender={gender === 'Masculino' ? 'male' : 'female'} />
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        {initialData && onCancel && (
          <button type="button" onClick={onCancel}
            className="flex-1 py-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-all">
            Cancelar
          </button>
        )}
        <button type="submit"
          className={`${initialData ? 'flex-1' : 'w-full'} py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-200`}>
          <Calculator size={20} />
          {initialData ? 'Atualizar Avaliação' : 'Salvar e Calcular Avaliação'}
        </button>
      </div>

      {/* FFMI Info Modal */}
      <AnimatePresence>
        {showFFMIInfo && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden">
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
                <button type="button" onClick={() => setShowFFMIInfo(false)}
                  className="p-2 rounded-xl hover:bg-white text-gray-400 hover:text-gray-600 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-8 space-y-8">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-indigo-600">
                    <Activity className="w-4 h-4" />
                    <h4 className="text-xs font-bold uppercase tracking-widest">O que é?</h4>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    <span className="font-bold text-gray-900">FFMI (Fat-Free Mass Index)</span> é uma medida que mostra quanta massa muscular você tem em relação à sua altura. 🏋️‍♂️
                  </p>
                  <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                    <p className="text-[11px] text-gray-500 font-mono text-center">Massa Livre de Gordura (kg) / Altura² (m²)</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-emerald-600">
                    <TrendingUp className="w-4 h-4" />
                    <h4 className="text-xs font-bold uppercase tracking-widest">Por que é útil?</h4>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    O FFMI foca especificamente no <span className="font-bold text-gray-900">tecido magro</span>, sendo mais preciso que o IMC. 🎯
                  </p>
                </div>
              </div>
              <div className="p-6 bg-gray-50 border-t border-gray-100">
                <button type="button" onClick={() => setShowFFMIInfo(false)}
                  className="w-full py-3 bg-white border border-gray-200 rounded-2xl text-sm font-bold text-gray-700 hover:bg-gray-100 transition-all shadow-sm">
                  Entendi
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Body Fat Info Modal */}
      <AnimatePresence>
        {showBFInfo && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden">
              <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-rose-50/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-rose-600 flex items-center justify-center shadow-lg shadow-rose-200">
                    <Info className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">Interpretação das Categorias</h3>
                    <p className="text-[10px] text-rose-600 font-medium uppercase tracking-wider">Composição Corporal</p>
                  </div>
                </div>
                <button type="button" onClick={() => setShowBFInfo(false)}
                  className="p-2 rounded-xl hover:bg-white text-gray-400 hover:text-gray-600 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-8 space-y-6 max-h-[60vh] overflow-y-auto">
                {[
                  { title: 'Gordura Essencial', color: 'text-blue-600', desc: 'Mínimo necessário para funções vitais.' },
                  { title: 'Atletas', color: 'text-emerald-600', desc: 'Típico de indivíduos com treinamento intenso.' },
                  { title: 'Fitness/Saudável', color: 'text-lime-600', desc: 'Faixa ideal para população ativa.' },
                  { title: 'Aceitável', color: 'text-amber-600', desc: 'Valores dentro de limites saudáveis.' },
                  { title: 'Sobrepeso', color: 'text-orange-600', desc: 'Adiposidade elevada com riscos à saúde.' },
                  { title: 'Obesidade', color: 'text-rose-600', desc: 'Risco significativo de complicações.' },
                ].map(cat => (
                  <div key={cat.title} className="space-y-2">
                    <h4 className={`text-xs font-bold uppercase tracking-widest ${cat.color}`}>{cat.title}</h4>
                    <p className="text-sm text-gray-600 leading-relaxed">{cat.desc}</p>
                  </div>
                ))}
              </div>
              <div className="p-6 bg-gray-50 border-t border-gray-100">
                <button type="button" onClick={() => setShowBFInfo(false)}
                  className="w-full py-3 bg-white border border-gray-200 rounded-2xl text-sm font-bold text-gray-700 hover:bg-gray-100 transition-all shadow-sm">
                  Entendi
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </form>
  );
}
