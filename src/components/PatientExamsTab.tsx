import { useState, useEffect } from 'react';
import { LayoutDashboard, History, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExamDefinition, ExamResult, Patient as ExamPatient } from './exams/types';
import { INITIAL_EXAMS } from './exams/constants';
import ExamEditor from './exams/ExamEditor';
import ExamHistory from './exams/ExamHistory';
import ExamDashboard from './exams/ExamDashboard';
import { supabase } from '@/integrations/supabase/client';

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}

type Page = 'dashboard' | 'history' | 'editor';

interface Props {
  patientId: string;
}

const PatientExamsTab = ({ patientId }: Props) => {
  const [activePage, setActivePage] = useState<Page>('dashboard');
  const [exams, setExams] = useState<ExamDefinition[]>(() => {
    const saved = localStorage.getItem(`exams-config`);
    return saved ? JSON.parse(saved) : INITIAL_EXAMS;
  });
  const [results, setResults] = useState<ExamResult[]>(() => {
    const saved = localStorage.getItem(`exam-results-${patientId}`);
    return saved ? JSON.parse(saved) : [];
  });
  const [patient, setPatient] = useState<ExamPatient>({ id: patientId, name: '', gender: 'male' });

  // Fetch patient data
  useEffect(() => {
    const fetchPatient = async () => {
      const { data } = await supabase.from('patients').select('*').eq('id', patientId).single();
      if (data) {
        setPatient({
          id: data.id,
          name: data.name,
          gender: data.sex === 'F' ? 'female' : 'male',
          weight: undefined,
          height: undefined,
        });
      }
    };
    fetchPatient();
  }, [patientId]);

  // Fetch weight/height from body_measurements and energy_profiles
  useEffect(() => {
    const fetchMetrics = async () => {
      const [{ data: measurements }, { data: energy }] = await Promise.all([
        supabase.from('body_measurements').select('weight').eq('patient_id', patientId).order('measured_at', { ascending: false }).limit(1),
        supabase.from('patient_energy_profiles').select('height').eq('patient_id', patientId).single(),
      ]);
      setPatient(prev => ({
        ...prev,
        weight: measurements?.[0]?.weight ? Number(measurements[0].weight) : prev.weight,
        height: energy?.height ? Number(energy.height) / 100 : prev.height, // cm to m
      }));
    };
    fetchMetrics();
  }, [patientId]);

  // Persist exams config
  useEffect(() => {
    localStorage.setItem('exams-config', JSON.stringify(exams));
  }, [exams]);

  // Persist results per patient
  useEffect(() => {
    localStorage.setItem(`exam-results-${patientId}`, JSON.stringify(results));
  }, [results, patientId]);

  const navItems: { key: Page; label: string; icon: React.ReactNode }[] = [
    { key: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { key: 'history', label: 'Resultados', icon: <History className="w-4 h-4" /> },
    { key: 'editor', label: 'Configuração', icon: <Settings className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-6">
      {/* Navigation tabs */}
      <div className="flex items-center gap-2 p-1 bg-muted/50 rounded-2xl w-fit">
        {navItems.map(item => (
          <button
            key={item.key}
            onClick={() => setActivePage(item.key)}
            className={cn(
              "flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all duration-300 text-sm font-bold",
              activePage === item.key
                ? "bg-primary text-primary-foreground shadow-lg"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </div>

      {/* Page title */}
      <div>
        <h2 className="text-2xl font-black text-foreground tracking-tight">
          {activePage === 'editor' && 'Gestão de Exames'}
          {activePage === 'history' && 'Registro de Resultados'}
          {activePage === 'dashboard' && 'Análise Longitudinal'}
        </h2>
        <p className="text-muted-foreground font-bold uppercase tracking-[0.3em] text-[10px] mt-1">
          {activePage === 'editor' && 'Parâmetros e Referências'}
          {activePage === 'history' && 'Entrada de Dados Clínicos'}
          {activePage === 'dashboard' && 'Monitoramento de Saúde'}
        </p>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activePage}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
        >
          {activePage === 'editor' && (
            <ExamEditor exams={exams} setExams={setExams} />
          )}
          {activePage === 'history' && (
            <ExamHistory exams={exams} results={results} setResults={setResults} patient={patient} />
          )}
          {activePage === 'dashboard' && (
            <ExamDashboard exams={exams} results={results} patient={patient} />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default PatientExamsTab;
