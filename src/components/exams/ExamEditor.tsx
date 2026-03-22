import { useState } from 'react';
import { Plus, Trash2, Edit2, ChevronDown, ChevronUp, Save, X, Info, Settings2, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExamDefinition, Category, CATEGORIES } from './types';
import { COMMON_UNITS, INITIAL_EXAMS } from './constants';
import { ReferenceRangeDisplay } from './ReferenceRangeDisplay';

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}

interface ExamEditorProps {
  exams: ExamDefinition[];
  setExams: React.Dispatch<React.SetStateAction<ExamDefinition[]>>;
}

export default function ExamEditor({ exams, setExams }: ExamEditorProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<Category>>(new Set([CATEGORIES[0]]));
  const [editingExam, setEditingExam] = useState<ExamDefinition | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [showRestoreConfirm, setShowRestoreConfirm] = useState(false);
  const [examToDelete, setExamToDelete] = useState<string | null>(null);

  const toggleCategory = (category: Category) => {
    const next = new Set(expandedCategories);
    if (next.has(category)) next.delete(category);
    else next.add(category);
    setExpandedCategories(next);
  };

  const handleSaveExam = (exam: ExamDefinition) => {
    if (exams.find(e => e.id === exam.id)) {
      setExams(prev => prev.map(e => e.id === exam.id ? exam : e));
    } else {
      setExams(prev => [...prev, exam]);
    }
    setEditingExam(null);
    setIsAdding(false);
  };

  const handleDeleteExam = (id: string) => {
    setExamToDelete(id);
  };

  const confirmDelete = () => {
    if (examToDelete) {
      setExams(prev => prev.filter(e => e.id !== examToDelete));
      setExamToDelete(null);
    }
  };

  const confirmRestore = () => {
    setExams(INITIAL_EXAMS);
    setShowRestoreConfirm(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-2xl font-bold text-foreground">Configuração de Exames</h3>
          <p className="text-muted-foreground text-sm">Gerencie os parâmetros de referência e unidades de medida.</p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowRestoreConfirm(true)}
            className="flex items-center gap-2 px-6 py-3 bg-card text-muted-foreground border border-border rounded-2xl font-bold hover:bg-muted transition-all"
          >
            <RotateCcw className="w-5 h-5" />
            Restaurar Padrões
          </button>
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-2xl font-bold hover:bg-primary/90 transition-all shadow-lg"
          >
            <Plus className="w-5 h-5" />
            Novo Exame
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {CATEGORIES.map(category => (
          <CategoryCard
            key={category}
            category={category}
            exams={exams.filter(e => e.category === category)}
            isExpanded={expandedCategories.has(category)}
            onToggle={() => toggleCategory(category)}
            onEdit={setEditingExam}
            onDelete={handleDeleteExam}
          />
        ))}
      </div>

      {(isAdding || editingExam) && (
        <ExamModal
          exam={editingExam || {
            id: Math.random().toString(36).substr(2, 9),
            name: '',
            category: CATEGORIES[0],
            unit: 'mg/dL',
            alternativeUnits: [],
            referenceRange: { unisex: { min: 0, max: 0 } }
          }}
          onClose={() => { setEditingExam(null); setIsAdding(false); }}
          onSave={handleSaveExam}
        />
      )}

      {showRestoreConfirm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-card w-full max-w-md rounded-[2.5rem] shadow-2xl p-8 space-y-6">
            <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-500 mx-auto"><RotateCcw className="w-8 h-8" /></div>
            <div className="text-center space-y-2">
              <h3 className="text-xl font-bold text-foreground">Restaurar Padrões?</h3>
              <p className="text-sm text-muted-foreground">Isso irá substituir todos os exames atuais pelos padrões de fábrica.</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowRestoreConfirm(false)} className="flex-1 px-6 py-3 bg-muted text-muted-foreground font-bold rounded-2xl hover:bg-muted/80 transition-all">Cancelar</button>
              <button onClick={confirmRestore} className="flex-1 px-6 py-3 bg-orange-500 text-white font-bold rounded-2xl hover:bg-orange-600 transition-all">Restaurar</button>
            </div>
          </motion.div>
        </div>
      )}

      {examToDelete && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-card w-full max-w-md rounded-[2.5rem] shadow-2xl p-8 space-y-6">
            <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center text-red-500 mx-auto"><Trash2 className="w-8 h-8" /></div>
            <div className="text-center space-y-2">
              <h3 className="text-xl font-bold text-foreground">Excluir Exame?</h3>
              <p className="text-sm text-muted-foreground">Tem certeza que deseja excluir este exame?</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setExamToDelete(null)} className="flex-1 px-6 py-3 bg-muted text-muted-foreground font-bold rounded-2xl hover:bg-muted/80 transition-all">Cancelar</button>
              <button onClick={confirmDelete} className="flex-1 px-6 py-3 bg-red-500 text-white font-bold rounded-2xl hover:bg-red-600 transition-all">Excluir</button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

const CategoryCard = ({ category, exams, isExpanded, onToggle, onEdit, onDelete }: {
  category: Category;
  exams: ExamDefinition[];
  isExpanded: boolean;
  onToggle: () => void;
  onEdit: (exam: ExamDefinition) => void;
  onDelete: (id: string) => void;
}) => {
  return (
    <div className="glass-card rounded-3xl overflow-hidden">
      <button onClick={onToggle} className="w-full flex items-center justify-between p-6 hover:bg-muted/50 transition-colors">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary"><Settings2 className="w-5 h-5" /></div>
          <div className="text-left">
            <h4 className="font-bold text-foreground">{category}</h4>
            <p className="text-xs text-muted-foreground">{exams.length} exames cadastrados</p>
          </div>
        </div>
        {isExpanded ? <ChevronUp className="w-5 h-5 text-muted-foreground" /> : <ChevronDown className="w-5 h-5 text-muted-foreground" />}
      </button>
      <AnimatePresence>
        {isExpanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="border-t border-border">
            <div className="p-6 space-y-4">
              {exams.length === 0 ? (
                <p className="text-center text-muted-foreground py-4 italic text-sm">Nenhum exame nesta categoria.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {exams.map(exam => (
                    <div key={exam.id} className="p-4 bg-muted/50 rounded-2xl border border-border flex items-center justify-between group">
                      <div>
                        <h5 className="font-bold text-foreground">{exam.name}</h5>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-xs font-medium px-2 py-0.5 bg-card border border-border rounded-lg text-muted-foreground">{exam.unit}</span>
                          <ReferenceRangeDisplay referenceRange={exam.referenceRange} showLabels={false} className="flex-row items-center" valueClassName="text-muted-foreground font-bold text-xs" />
                        </div>
                      </div>
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => onEdit(exam)} className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-xl transition-all"><Edit2 className="w-4 h-4" /></button>
                        <button onClick={() => onDelete(exam.id)} className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl transition-all"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

function ExamModal({ exam, onClose, onSave }: { exam: ExamDefinition; onClose: () => void; onSave: (exam: ExamDefinition) => void; }) {
  const [formData, setFormData] = useState<ExamDefinition>(exam);
  const [refType, setRefType] = useState<'unisex' | 'gendered'>(exam.referenceRange.unisex ? 'unisex' : 'gendered');
  const [error, setError] = useState<string | null>(null);

  const handleSave = () => {
    if (!formData.name) return setError('Nome do exame é obrigatório');
    if (refType === 'unisex') {
      const range = formData.referenceRange.unisex;
      if (range && range.max <= range.min) return setError('O valor máximo deve ser maior que o mínimo');
    } else {
      const m = formData.referenceRange.male;
      const f = formData.referenceRange.female;
      if (m && m.max <= m.min) return setError('Máximo deve ser maior que mínimo (Masculino)');
      if (f && f.max <= f.min) return setError('Máximo deve ser maior que mínimo (Feminino)');
    }
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-card w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden">
        <div className="p-8 border-b border-border flex items-center justify-between bg-muted/50">
          <div>
            <h3 className="text-xl font-bold text-foreground">Configurar Exame</h3>
            <p className="text-sm text-muted-foreground">Defina os parâmetros clínicos do exame.</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-card rounded-full transition-colors"><X className="w-6 h-6 text-muted-foreground" /></button>
        </div>
        <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto">
          {error && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-4 bg-destructive/10 border border-destructive/20 rounded-2xl flex items-center gap-3 text-destructive text-sm font-bold">
              <Info className="w-5 h-5 flex-shrink-0" />{error}
            </motion.div>
          )}
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Nome do Exame</label>
              <input type="text" value={formData.name} onChange={e => { setFormData({ ...formData, name: e.target.value }); if (error) setError(null); }} className="w-full px-4 py-3 bg-muted border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary transition-all text-foreground" placeholder="Ex: Glicose em Jejum" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Categoria</label>
              <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value as Category })} className="w-full px-4 py-3 bg-muted border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary transition-all text-foreground">
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div className="space-y-4">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Unidade de Medida</label>
            <div className="flex flex-wrap gap-2">
              {COMMON_UNITS.map(u => (
                <button key={u} onClick={() => setFormData({ ...formData, unit: u })} className={cn("px-4 py-2 rounded-xl text-sm font-semibold transition-all border", formData.unit === u ? "bg-primary text-primary-foreground border-primary shadow-md" : "bg-card text-muted-foreground border-border hover:border-primary/30")}>{u}</button>
              ))}
            </div>
          </div>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Intervalos de Referência</label>
              <div className="flex bg-muted p-1 rounded-xl">
                <button onClick={() => { setRefType('unisex'); setFormData({ ...formData, referenceRange: { unisex: formData.referenceRange.unisex || { min: 0, max: 0 } } }); }} className={cn("px-4 py-1.5 rounded-lg text-xs font-bold transition-all", refType === 'unisex' ? "bg-card text-primary shadow-sm" : "text-muted-foreground")}>Unissex</button>
                <button onClick={() => { setRefType('gendered'); setFormData({ ...formData, referenceRange: { male: formData.referenceRange.male || { min: 0, max: 0 }, female: formData.referenceRange.female || { min: 0, max: 0 } } }); }} className={cn("px-4 py-1.5 rounded-lg text-xs font-bold transition-all", refType === 'gendered' ? "bg-card text-primary shadow-sm" : "text-muted-foreground")}>Por Sexo</button>
              </div>
            </div>
            {refType === 'unisex' ? (
              <div className="p-6 bg-primary/5 rounded-3xl border border-primary/10 grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-primary/60 uppercase">Mínimo</label>
                  <input type="number" value={formData.referenceRange.unisex?.min} onChange={e => { setFormData({ ...formData, referenceRange: { unisex: { ...formData.referenceRange.unisex!, min: Number(e.target.value) } } }); if (error) setError(null); }} className="w-full px-4 py-2 bg-card border border-primary/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-foreground" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-primary/60 uppercase">Máximo</label>
                  <input type="number" value={formData.referenceRange.unisex?.max} onChange={e => { setFormData({ ...formData, referenceRange: { unisex: { ...formData.referenceRange.unisex!, max: Number(e.target.value) } } }); if (error) setError(null); }} className="w-full px-4 py-2 bg-card border border-primary/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-foreground" />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div className="p-6 bg-blue-500/5 rounded-3xl border border-blue-500/10 space-y-4">
                  <h6 className="text-xs font-bold text-blue-500 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-500" /> Masculino</h6>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-blue-400 uppercase">Mín</label>
                      <input type="number" value={formData.referenceRange.male?.min} onChange={e => { setFormData({ ...formData, referenceRange: { ...formData.referenceRange, male: { ...formData.referenceRange.male!, min: Number(e.target.value) } } }); if (error) setError(null); }} className="w-full px-3 py-2 bg-card border border-blue-500/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-foreground" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-blue-400 uppercase">Máx</label>
                      <input type="number" value={formData.referenceRange.male?.max} onChange={e => { setFormData({ ...formData, referenceRange: { ...formData.referenceRange, male: { ...formData.referenceRange.male!, max: Number(e.target.value) } } }); if (error) setError(null); }} className="w-full px-3 py-2 bg-card border border-blue-500/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-foreground" />
                    </div>
                  </div>
                </div>
                <div className="p-6 bg-pink-500/5 rounded-3xl border border-pink-500/10 space-y-4">
                  <h6 className="text-xs font-bold text-pink-500 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-pink-500" /> Feminino</h6>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-pink-400 uppercase">Mín</label>
                      <input type="number" value={formData.referenceRange.female?.min} onChange={e => { setFormData({ ...formData, referenceRange: { ...formData.referenceRange, female: { ...formData.referenceRange.female!, min: Number(e.target.value) } } }); if (error) setError(null); }} className="w-full px-3 py-2 bg-card border border-pink-500/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 text-foreground" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-pink-400 uppercase">Máx</label>
                      <input type="number" value={formData.referenceRange.female?.max} onChange={e => { setFormData({ ...formData, referenceRange: { ...formData.referenceRange, female: { ...formData.referenceRange.female!, max: Number(e.target.value) } } }); if (error) setError(null); }} className="w-full px-3 py-2 bg-card border border-pink-500/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 text-foreground" />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="p-8 bg-muted/50 border-t border-border flex items-center justify-end gap-4">
          <button onClick={onClose} className="px-6 py-3 text-muted-foreground font-bold hover:text-foreground transition-colors">Cancelar</button>
          <button onClick={handleSave} className="flex items-center gap-2 px-8 py-3 bg-primary text-primary-foreground rounded-2xl font-bold hover:bg-primary/90 transition-all shadow-lg"><Save className="w-5 h-5" />Salvar Exame</button>
        </div>
      </motion.div>
    </div>
  );
}
