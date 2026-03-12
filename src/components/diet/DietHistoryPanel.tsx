import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { X, History, Loader2, CalendarDays, Flame, Scale } from "lucide-react";

interface DietHistory {
  id: string;
  name: string;
  released_at: string | null;
  calories_snapshot: number | null;
  weight_snapshot: number | null;
}

interface DietHistoryPanelProps {
  patientId: string;
  open: boolean;
  onClose: () => void;
}

const DietHistoryPanel = ({ patientId, open, onClose }: DietHistoryPanelProps) => {
  const [histories, setHistories] = useState<DietHistory[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) fetchHistory();
  }, [open, patientId]);

  const fetchHistory = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("diets")
      .select("id, name, released_at, calories_snapshot, weight_snapshot")
      .eq("patient_id", patientId)
      .not("released_at", "is", null)
      .order("released_at", { ascending: false });
    setHistories((data as DietHistory[]) || []);
    setLoading(false);
  };

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Panel - slides from left */}
      <div
        className={`fixed top-0 left-0 h-full z-50 transition-transform duration-300 ease-in-out ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{ width: 420 }}
      >
        <div className="h-full flex flex-col bg-[hsl(220,20%,10%)] shadow-2xl rounded-r-2xl">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
            <div className="flex items-center gap-2.5">
              <History className="w-5 h-5 text-white/50" />
              <span className="text-sm font-semibold text-white">
                Histórico de Dietas
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5 text-white/70 hover:text-white transition-colors" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-5 h-5 animate-spin text-white/50" />
              </div>
            ) : histories.length === 0 ? (
              <div className="text-center py-12">
                <History className="w-10 h-10 mx-auto text-white/20 mb-3" />
                <p className="text-sm text-white/40">Nenhuma dieta liberada ainda.</p>
              </div>
            ) : (
              histories.map((diet) => (
                <div
                  key={diet.id}
                  className="rounded-xl bg-white/5 border border-white/10 p-4 space-y-3"
                >
                  <h4 className="text-sm font-semibold text-white">{diet.name}</h4>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="flex flex-col items-center gap-1 p-2 rounded-lg bg-white/5">
                      <CalendarDays className="w-3.5 h-3.5 text-white/50" />
                      <p className="text-xs font-medium text-white">
                        {diet.released_at
                          ? new Date(diet.released_at).toLocaleDateString("pt-BR")
                          : "—"}
                      </p>
                      <p className="text-[9px] text-white/40">Liberação</p>
                    </div>
                    <div className="flex flex-col items-center gap-1 p-2 rounded-lg bg-white/5">
                      <Flame className="w-3.5 h-3.5 text-white/50" />
                      <p className="text-xs font-medium text-white">
                        {diet.calories_snapshot
                          ? `${Math.round(diet.calories_snapshot).toLocaleString("pt-BR")}`
                          : "—"}
                      </p>
                      <p className="text-[9px] text-white/40">kcal</p>
                    </div>
                    <div className="flex flex-col items-center gap-1 p-2 rounded-lg bg-white/5">
                      <Scale className="w-3.5 h-3.5 text-white/50" />
                      <p className="text-xs font-medium text-white">
                        {diet.weight_snapshot ? `${diet.weight_snapshot} kg` : "—"}
                      </p>
                      <p className="text-[9px] text-white/40">Peso</p>
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

export default DietHistoryPanel;
