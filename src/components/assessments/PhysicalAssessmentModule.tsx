import React from 'react';
import { Assessment, Gender, Protocol, Skinfolds, Circumferences } from './types';
import { calculateAssessment } from './calculations';
import AssessmentForm from './AssessmentForm';
import AssessmentHistory from './AssessmentHistory';
import AssessmentCharts from './AssessmentCharts';
import ResultsCard from './ResultsCard';
import { Activity, History, BarChart3, PlusCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getBMIInfo } from './BMIDisplay';
import { cn } from '@/lib/utils';

const CIRC_LABELS: Record<keyof Circumferences, string> = {
  bracoDireitoRelaxado: 'Braço Dir. Relaxado',
  bracoDireitoContraido: 'Braço Dir. Contraído',
  bracoEsquerdoRelaxado: 'Braço Esq. Relaxado',
  bracoEsquerdoContraido: 'Braço Esq. Contraído',
  antebracoDireito: 'Antebraço Dir.',
  antebracoEsquerdo: 'Antebraço Esq.',
  peitoral: 'Peitoral',
  cintura: 'Cintura',
  abdomen: 'Abdome',
  quadril: 'Quadril',
  coxaEsquerda: 'Coxa Esquerda',
  coxaDireita: 'Coxa Direita',
  panturrilhaDireita: 'Panturrilha Dir.',
  panturrilhaEsquerda: 'Panturrilha Esq.',
};

const FOLD_LABELS: Record<keyof Skinfolds, string> = {
  bicipital: 'Bicipital',
  peitoral: 'Peitoral',
  supraIliaca: 'Supra Ilíaca',
  tricipital: 'Tricipital',
  axilarMedia: 'Axilar Média',
  coxa: 'Coxa',
  subescapular: 'Subescapular',
  abdominal: 'Abdominal',
  panturrilha: 'Panturrilha',
};

interface Props {
  patientId: string;
}

export default function PhysicalAssessmentModule({ patientId }: Props) {
  const storageKey = `assessments_${patientId}`;

  const [assessments, setAssessments] = React.useState<Assessment[]>(() => {
    const saved = localStorage.getItem(storageKey);
    return saved ? JSON.parse(saved) : [];
  });

  const [activeTab, setActiveTab] = React.useState<'dashboard' | 'new' | 'history'>('dashboard');
  const [selectedAssessment, setSelectedAssessment] = React.useState<Assessment | null>(null);
  const [assessmentToEdit, setAssessmentToEdit] = React.useState<Assessment | null>(null);
  const [assessmentToDelete, setAssessmentToDelete] = React.useState<string | null>(null);

  React.useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(assessments));
  }, [assessments, storageKey]);

  const handleAddAssessment = (data: {
    date: string;
    gender: Gender;
    age: number;
    weight: number;
    height: number;
    protocol: Protocol;
    skinfolds: Skinfolds;
    circumferences: Circumferences;
  }) => {
    const results = calculateAssessment(data.protocol, data.gender, data.age, data.weight, data.height, data.skinfolds);

    if (assessmentToEdit) {
      setAssessments(prev => prev.map(a => a.id === assessmentToEdit.id ? { ...a, ...data, results } : a));
      setAssessmentToEdit(null);
    } else {
      const newAssessment: Assessment = { id: crypto.randomUUID(), ...data, results };
      setAssessments(prev => [newAssessment, ...prev]);
    }
    setActiveTab('dashboard');
  };

  const handleEdit = (assessment: Assessment) => {
    setAssessmentToEdit(assessment);
    setActiveTab('new');
  };

  const confirmDelete = () => {
    if (assessmentToDelete) {
      setAssessments(prev => prev.filter(a => a.id !== assessmentToDelete));
      setAssessmentToDelete(null);
    }
  };

  const latest = assessments[0];
  const previous = assessments[1];

  return (
    <div className="space-y-6">
      {/* Header + Navigation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
            <Activity size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-gray-900">Avaliação Física</h2>
            <p className="text-xs text-gray-500 font-medium">Acompanhamento Antropométrico e Composição Corporal</p>
          </div>
        </div>

        <div className="flex items-center bg-gray-50 p-1 rounded-xl border border-gray-100">
          <button onClick={() => setActiveTab('dashboard')}
            className={cn("flex items-center gap-2 px-4 py-2 rounded-lg transition-all text-sm font-bold",
              activeTab === 'dashboard' ? "bg-white text-indigo-600 shadow-sm" : "text-gray-400 hover:text-gray-600")}>
            <BarChart3 size={16} />
            Painel
          </button>
          <button onClick={() => { setAssessmentToEdit(null); setActiveTab('new'); }}
            className={cn("flex items-center gap-2 px-4 py-2 rounded-lg transition-all text-sm font-bold",
              activeTab === 'new' ? "bg-white text-indigo-600 shadow-sm" : "text-gray-400 hover:text-gray-600")}>
            <PlusCircle size={16} />
            Nova
          </button>
          <button onClick={() => setActiveTab('history')}
            className={cn("flex items-center gap-2 px-4 py-2 rounded-lg transition-all text-sm font-bold",
              activeTab === 'history' ? "bg-white text-indigo-600 shadow-sm" : "text-gray-400 hover:text-gray-600")}>
            <History size={16} />
            Histórico
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'dashboard' && (
          <motion.div key="dashboard" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-8">
            {latest ? (
              <>
                <ResultsCard current={latest} previous={previous} />
                <AssessmentCharts assessments={assessments} />
              </>
            ) : (
              <div className="bg-white p-20 rounded-3xl border border-dashed border-gray-300 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-300 mb-4">
                  <PlusCircle size={32} />
                </div>
                <h2 className="text-xl font-bold text-gray-700 mb-2">Comece agora</h2>
                <p className="text-gray-500 max-w-xs mb-8">Registre a primeira avaliação para acompanhar a evolução corporal.</p>
                <button onClick={() => setActiveTab('new')}
                  className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200">
                  Nova Avaliação
                </button>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'new' && (
          <motion.div key="new" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
            <div className="max-w-4xl mx-auto">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <PlusCircle className="text-indigo-600" />
                {assessmentToEdit ? 'Editar Avaliação' : 'Registrar Nova Avaliação'}
              </h2>
              <AssessmentForm
                onSubmit={handleAddAssessment}
                onCancel={() => { setAssessmentToEdit(null); setActiveTab('history'); }}
                initialData={assessmentToEdit}
              />
            </div>
          </motion.div>
        )}

        {activeTab === 'history' && (
          <motion.div key="history" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <History className="text-indigo-600" />
              Histórico de Avaliações
            </h2>
            <AssessmentHistory
              assessments={assessments}
              onDelete={setAssessmentToDelete}
              onView={setSelectedAssessment}
              onEdit={handleEdit}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedAssessment && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedAssessment(null)} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
              <div className="p-8">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-2xl font-bold">Detalhes da Avaliação</h2>
                    <p className="text-gray-500 font-medium">{selectedAssessment.date}</p>
                  </div>
                  <button onClick={() => setSelectedAssessment(null)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                    <X size={24} />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-8 mb-8">
                  <div className="space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-indigo-600 border-b pb-2">Resultados</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm"><span className="text-gray-500">Gordura Corporal:</span> <span className="font-bold font-mono text-rose-600">{selectedAssessment.results.bodyFat}%</span></div>
                      <div className="flex justify-between text-sm"><span className="text-gray-500">Massa Magra:</span> <span className="font-bold font-mono text-emerald-600">{selectedAssessment.results.leanMass} kg</span></div>
                      <div className="flex justify-between text-sm"><span className="text-gray-500">Massa Gorda:</span> <span className="font-bold font-mono text-rose-600">{selectedAssessment.results.fatMass} kg</span></div>
                      <div className="flex justify-between text-sm"><span className="text-gray-500">Somatório Dobras:</span> <span className="font-bold font-mono text-amber-600">{selectedAssessment.results.sumFolds} mm</span></div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">IMC:</span>
                        <div className="flex flex-col items-end">
                          <span className={`font-bold font-mono ${getBMIInfo(selectedAssessment.results.imc).color}`}>{selectedAssessment.results.imc}</span>
                          <span className={`text-[10px] font-bold uppercase ${getBMIInfo(selectedAssessment.results.imc).color}`}>{getBMIInfo(selectedAssessment.results.imc).label}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-indigo-600 border-b pb-2">Informações</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm"><span className="text-gray-500">Peso:</span> <span className="font-bold font-mono">{selectedAssessment.weight} kg</span></div>
                      <div className="flex justify-between text-sm"><span className="text-gray-500">Altura:</span> <span className="font-bold font-mono">{selectedAssessment.height} cm</span></div>
                      <div className="flex justify-between text-sm"><span className="text-gray-500">Idade:</span> <span className="font-bold font-mono">{selectedAssessment.age} anos</span></div>
                      <div className="flex justify-between text-sm"><span className="text-gray-500">Sexo:</span> <span className="font-bold">{selectedAssessment.gender}</span></div>
                      <div className="flex justify-between text-sm"><span className="text-gray-500">Protocolo:</span> <span className="font-bold">{selectedAssessment.protocol}</span></div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 mb-8">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-indigo-600 border-b pb-2">Dobras Cutâneas (mm)</h3>
                  <div className="grid grid-cols-3 gap-4">
                    {Object.entries(selectedAssessment.skinfolds).map(([key, val]) => (
                      <div key={key} className="flex flex-col">
                        <span className="text-[10px] uppercase text-gray-400 font-bold">{FOLD_LABELS[key as keyof Skinfolds] || key}</span>
                        <span className="text-sm font-mono font-medium">{val} mm</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-6">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-indigo-600 border-b pb-2">Circunferências (cm)</h3>
                  {[
                    { title: 'Membros Superiores', keys: ['bracoDireitoRelaxado', 'bracoDireitoContraido', 'bracoEsquerdoRelaxado', 'bracoEsquerdoContraido', 'antebracoDireito', 'antebracoEsquerdo'] },
                    { title: 'Tronco', keys: ['peitoral', 'cintura', 'abdomen', 'quadril'] },
                    { title: 'Membros Inferiores', keys: ['coxaEsquerda', 'coxaDireita', 'panturrilhaDireita', 'panturrilhaEsquerda'] },
                  ].map(section => (
                    <div key={section.title} className="space-y-4">
                      <h4 className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">{section.title}</h4>
                      <div className="grid grid-cols-3 gap-4">
                        {section.keys.map(key => (
                          <div key={key} className="flex flex-col">
                            <span className="text-[10px] uppercase text-gray-400 font-bold">{CIRC_LABELS[key as keyof Circumferences]}</span>
                            <span className="text-sm font-mono font-medium">{selectedAssessment.circumferences[key as keyof Circumferences] || 0} cm</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {assessmentToDelete && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setAssessmentToDelete(null)} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl p-8 text-center">
              <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <X size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Excluir Avaliação?</h3>
              <p className="text-gray-500 mb-8">Esta ação não pode ser desfeita.</p>
              <div className="flex gap-3">
                <button onClick={() => setAssessmentToDelete(null)}
                  className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors">
                  Cancelar
                </button>
                <button onClick={confirmDelete}
                  className="flex-1 px-6 py-3 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition-colors shadow-lg shadow-red-200">
                  Excluir
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
