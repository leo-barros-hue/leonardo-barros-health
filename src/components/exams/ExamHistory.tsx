import { useState, useEffect, useMemo } from 'react';
import { Calendar, Save, ChevronDown, ChevronUp, AlertCircle, CheckCircle2, History as HistoryIcon, Trash2, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExamDefinition, ExamResult, Patient, Category, CATEGORIES } from './types';
import { getStatusColor, getInterpretation, calculateDeviation, getDynamicColor } from './calculations';
import { ReferenceRangeDisplay } from './ReferenceRangeDisplay';

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}

interface ExamHistoryProps {
  exams: ExamDefinition[];
  results: ExamResult[];
  setResults: React.Dispatch<React.SetStateAction<ExamResult[]>>;
  patient: Patient;
}

export default function ExamHistory({ exams, results, setResults, patient }: ExamHistoryProps) {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [currentValues, setCurrentValues] = useState<Record<string, string>>({});
  const [expandedCategories, setExpandedCategories] = useState<Set<Category>>(new Set([CATEGORIES[0]]));
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success'>('idle');
  const [dateToDelete, setDateToDelete] = useState<string | null>(null);
  const [examToDelete, setExamToDelete] = useState<{id: string, name: string} | null>(null);

  const savedDates = useMemo(() => {
    const dates = new Set(results.filter(r => r.patientId === patient.id).map(r => r.date));
    return Array.from(dates).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
  }, [results, patient.id]);

  useEffect(() => {
    const dateResults = results.filter(r => r.patientId === patient.id && r.date === selectedDate);
    const values: Record<string, string> = {};
    dateResults.forEach(r => { values[r.examId] = r.value.toString(); });
    setCurrentValues(values);
  }, [selectedDate, patient.id, results]);

  const toggleCategory = (category: Category) => {
    const next = new Set(expandedCategories);
    if (next.has(category)) next.delete(category);
    else next.add(category);
    setExpandedCategories(next);
  };

  const handleValueChange = (examId: string, value: string) => {
    setCurrentValues(prev => ({ ...prev, [examId]: value }));
  };

  const handleSave = () => {
    setSaveStatus('saving');
    const otherResults = results.filter(r => !(r.patientId === patient.id && r.date === selectedDate));
    const newResults: ExamResult[] = Object.entries(currentValues)
      .filter(([_, val]) => val !== '' && !isNaN(Number(val)))
      .map(([examId, val]) => ({
        id: Math.random().toString(36).substr(2, 9),
        examId,
        value: Number(val),
        date: selectedDate,
        patientId: patient.id
      }));
    setResults([...otherResults, ...newResults]);
    setTimeout(() => {
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 2000);
    }, 600);
  };

  const confirmDeleteCollection = () => {
    if (dateToDelete) {
      setResults(prev => prev.filter(r => !(r.patientId === patient.id && r.date === dateToDelete)));
      if (selectedDate === dateToDelete) setCurrentValues({});
      setDateToDelete(null);
    }
  };

  const handleDeleteIndividual = (examId: string, examName: string) => {
    if (currentValues[examId]) setExamToDelete({ id: examId, name: examName });
  };

  const confirmDeleteIndividual = () => {
    if (examToDelete) {
      setCurrentValues(prev => { const next = { ...prev }; delete next[examToDelete.id]; return next; });
      setResults(prev => prev.filter(r => !(r.patientId === patient.id && r.date === selectedDate && r.examId === examToDelete.id)));
      setExamToDelete(null);
    }
  };

  const handleAddNew = () => {
    setSelectedDate(new Date().toISOString().split('T')[0]);
    setCurrentValues({});
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      {/* Sidebar: History */}
      <div className="lg:col-span-1 space-y-6">
        <div className="glass-card p-6 rounded-[2rem]">
          <div className="flex items-center justify-between mb-6">
            <h4 className="font-bold text-foreground flex items-center gap-2"><HistoryIcon className="w-4 h-4 text-primary" />Histórico</h4>
            <button onClick={handleAddNew} className="p-2 bg-primary/10 text-primary rounded-xl hover:bg-primary/20 transition-colors" title="Nova Coleta"><Plus className="w-4 h-4" /></button>
          </div>
          <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-2">
            {savedDates.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-8 italic">Nenhum registro salvo.</p>
            ) : (
              savedDates.map(date => (
                <div key={date} className={cn("group flex items-center justify-between p-3 rounded-2xl border transition-all cursor-pointer", selectedDate === date ? "bg-primary border-primary text-primary-foreground shadow-md" : "bg-muted/50 border-border text-foreground hover:border-primary/30")} onClick={() => setSelectedDate(date)}>
                  <div className="flex items-center gap-3">
                    <Calendar className={cn("w-4 h-4", selectedDate === date ? "text-primary-foreground/70" : "text-muted-foreground")} />
                    <span className="text-sm font-bold">{new Date(date).toLocaleDateString('pt-BR')}</span>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); setDateToDelete(date); }} className={cn("p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity", selectedDate === date ? "hover:bg-white/20 text-primary-foreground" : "hover:bg-destructive/10 text-muted-foreground hover:text-destructive")}><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Main Form */}
      <div className="lg:col-span-3 space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 glass-card p-8 rounded-[2.5rem]">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-3xl bg-primary flex items-center justify-center text-primary-foreground shadow-lg"><Calendar className="w-8 h-8" /></div>
            <div>
              <h3 className="text-2xl font-bold text-foreground">Registro de Coleta</h3>
              <p className="text-muted-foreground text-sm">Insira os resultados para {new Date(selectedDate).toLocaleDateString('pt-BR')}.</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Data da Coleta</label>
              <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} className="px-6 py-3 bg-muted border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary font-bold text-foreground" />
            </div>
            <button onClick={() => setCurrentValues({})} className="mt-5 px-6 py-3 text-muted-foreground font-bold hover:text-foreground transition-colors">Limpar</button>
            <button onClick={handleSave} disabled={saveStatus !== 'idle'} className={cn("mt-5 flex items-center gap-2 px-8 py-3 rounded-2xl font-bold transition-all shadow-lg", saveStatus === 'success' ? "bg-green-500 text-white" : "bg-primary text-primary-foreground hover:bg-primary/90")}>
              {saveStatus === 'idle' && <><Save className="w-5 h-5" /> Salvar</>}
              {saveStatus === 'saving' && <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              {saveStatus === 'success' && <><CheckCircle2 className="w-5 h-5" /> Salvo!</>}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {CATEGORIES.map(category => {
            const categoryExams = exams.filter(e => e.category === category);
            if (categoryExams.length === 0) return null;
            return (
              <div key={category} className="glass-card rounded-[2.5rem] overflow-hidden">
                <button onClick={() => toggleCategory(category)} className="w-full flex items-center justify-between p-8 hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <h4 className="text-lg font-bold text-foreground">{category}</h4>
                    <span className="px-3 py-1 bg-muted rounded-full text-[10px] font-bold text-muted-foreground uppercase">{categoryExams.length} Parâmetros</span>
                  </div>
                  {expandedCategories.has(category) ? <ChevronUp className="w-6 h-6 text-muted-foreground" /> : <ChevronDown className="w-6 h-6 text-muted-foreground" />}
                </button>
                <AnimatePresence>
                  {expandedCategories.has(category) && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="border-t border-border">
                      <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                        {categoryExams.map(exam => (
                          <ExamInput key={exam.id} exam={exam} patient={patient} value={currentValues[exam.id] || ''} onChange={val => handleValueChange(exam.id, val)} onDelete={() => handleDeleteIndividual(exam.id, exam.name)} />
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>

      {/* Delete Modals */}
      <AnimatePresence>
        {dateToDelete && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-card w-full max-w-md rounded-[2.5rem] shadow-2xl p-8 space-y-6">
              <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center text-red-500 mx-auto"><Trash2 className="w-8 h-8" /></div>
              <div className="text-center space-y-2">
                <h3 className="text-xl font-bold text-foreground">Excluir Coleta?</h3>
                <p className="text-sm text-muted-foreground">Excluir todos os resultados do dia {new Date(dateToDelete).toLocaleDateString('pt-BR')}?</p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setDateToDelete(null)} className="flex-1 px-6 py-3 bg-muted text-muted-foreground font-bold rounded-2xl">Cancelar</button>
                <button onClick={confirmDeleteCollection} className="flex-1 px-6 py-3 bg-red-500 text-white font-bold rounded-2xl">Excluir</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {examToDelete && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-card w-full max-w-md rounded-[2.5rem] shadow-2xl p-8 space-y-6">
              <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center text-red-500 mx-auto"><Trash2 className="w-8 h-8" /></div>
              <div className="text-center space-y-2">
                <h3 className="text-xl font-bold text-foreground">Excluir Resultado?</h3>
                <p className="text-sm text-muted-foreground">Excluir <span className="font-bold text-foreground">{examToDelete.name}</span> desta data?</p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setExamToDelete(null)} className="flex-1 px-6 py-3 bg-muted text-muted-foreground font-bold rounded-2xl">Cancelar</button>
                <button onClick={confirmDeleteIndividual} className="flex-1 px-6 py-3 bg-red-500 text-white font-bold rounded-2xl">Excluir</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

const ExamInput = ({ exam, patient, value, onChange, onDelete }: {
  exam: ExamDefinition; patient: Patient; value: string; onChange: (val: string) => void; onDelete: () => void;
}) => {
  const refRange = exam.referenceRange.unisex || (patient.gender === 'male' ? exam.referenceRange.male : exam.referenceRange.female);
  const numValue = value === '' ? null : Number(value);
  const color = (numValue !== null && refRange) ? getStatusColor(numValue, refRange.min, refRange.max) : null;
  const interpretation = (numValue !== null && refRange) ? getInterpretation(numValue, refRange.min, refRange.max) : null;
  const deviation = (numValue !== null && refRange) ? calculateDeviation(numValue, refRange.min, refRange.max) : 0;
  const dynamicColor = (numValue !== null && refRange) ? getDynamicColor(numValue, refRange.min, refRange.max) : null;

  return (
    <div className="space-y-3 p-5 rounded-3xl bg-muted/30 border border-border transition-all hover:border-primary/20 hover:bg-card group relative">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-muted-foreground group-hover:text-primary transition-colors">{exam.name}</label>
          {value && (
            <button onClick={onDelete} className="p-1 text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100"><Trash2 className="w-3 h-3" /></button>
          )}
        </div>
        <span className="text-[10px] font-bold text-muted-foreground uppercase">{exam.unit}</span>
      </div>
      <div className="relative">
        <input type="number" value={value} onChange={e => onChange(e.target.value)} className={cn("w-full px-5 py-4 rounded-2xl border-2 transition-all focus:outline-none focus:ring-4 focus:ring-opacity-20 font-bold text-lg bg-card text-foreground", !dynamicColor ? "border-border focus:border-primary focus:ring-primary" : "")} style={dynamicColor ? { borderColor: dynamicColor, backgroundColor: `${dynamicColor}08`, color: dynamicColor } : {}} placeholder="0.00" />
        {color && color !== 'green' && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-black" style={{ color: dynamicColor || undefined }}>+{Math.round(deviation * 100)}%</span>
              <span className="text-[8px] font-bold uppercase opacity-50">Desvio</span>
            </div>
            <AlertCircle className="w-5 h-5" style={{ color: dynamicColor || undefined }} />
          </div>
        )}
      </div>
      {exam.referenceRange && (
        <div className="flex items-center justify-between px-1">
          <ReferenceRangeDisplay referenceRange={exam.referenceRange} showLabels={false} valueClassName="text-muted-foreground font-bold text-[10px]" className="flex-row items-center" />
          {interpretation && <p className="text-[10px] font-bold uppercase" style={{ color: dynamicColor || undefined }}>{interpretation}</p>}
        </div>
      )}
    </div>
  );
};
