import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { X, History, Loader2, CalendarDays, Dumbbell } from "lucide-react";

interface WorkoutHistory {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

interface WorkoutHistoryPanelProps {
  patientId: string;
  open: boolean;
  onClose: () => void;
}

const WorkoutHistoryPanel = ({ patientId, open, onClose }: WorkoutHistoryPanelProps) => {
  const [histories, setHistories] = useState<WorkoutHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (open) {
      setVisible(true);
      fetchHistory();
    } else {
      const timer = setTimeout(() => setVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [open]);

  const fetchHistory = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("workout_programs")
      .select("id, name, description, created_at, updated_at")
      .eq("patient_id", patientId)
      .order("created_at", { ascending: false });
    setHistories((data as WorkoutHistory[]) || []);
    setLoading(false);
  };

  if (!visible && !open) return null;

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      <div
        className={`fixed top-0 left-0 h-full z-50 transition-transform duration-300 ease-in-out ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{ width: 420 }}
      >
        <div className="h-full flex flex-col bg-[hsl(220,20%,10%)] shadow-2xl rounded-r-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
            <div className="flex items-center gap-2.5">
              <History className="w-5 h-5 text-white/50" />
              <span className="text-sm font-semibold text-white">
                Histórico de Treinos
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5 text-white/70 hover:text-white transition-colors" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-5 h-5 animate-spin text-white/50" />
              </div>
            ) : histories.length === 0 ? (
              <div className="text-center py-12">
                <History className="w-10 h-10 mx-auto text-white/20 mb-3" />
                <p className="text-sm text-white/40">Nenhum programa de treino registrado.</p>
              </div>
            ) : (
              histories.map((program, index) => (
                <div
                  key={program.id}
                  className="rounded-xl bg-white/5 border border-white/10 p-4 space-y-3 animate-fade-in"
                  style={{ animationDelay: `${index * 80}ms`, animationFillMode: "backwards" }}
                >
                  <h4 className="text-sm font-semibold text-white">{program.name}</h4>
                  {program.description && (
                    <p className="text-xs text-white/50">{program.description}</p>
                  )}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex flex-col items-center gap-1 p-2 rounded-lg bg-white/5">
                      <CalendarDays className="w-3.5 h-3.5 text-white/50" />
                      <p className="text-xs font-medium text-white">
                        {new Date(program.created_at).toLocaleDateString("pt-BR")}
                      </p>
                      <p className="text-[9px] text-white/40">Criação</p>
                    </div>
                    <div className="flex flex-col items-center gap-1 p-2 rounded-lg bg-white/5">
                      <Dumbbell className="w-3.5 h-3.5 text-white/50" />
                      <p className="text-xs font-medium text-white">
                        {new Date(program.updated_at).toLocaleDateString("pt-BR")}
                      </p>
                      <p className="text-[9px] text-white/40">Última atualização</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default WorkoutHistoryPanel;
