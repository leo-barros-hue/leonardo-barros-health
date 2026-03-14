import { useState, useEffect, useRef, useCallback } from "react";
import { Smartphone, X, RefreshCw, Utensils, Dumbbell, TrendingUp, FlaskConical, FileText, LayoutDashboard } from "lucide-react";
import { useLocation } from "react-router-dom";

const TAB_TO_ROUTE: Record<string, { path: string; label: string; icon: any }> = {
  overview: { path: "", label: "Início", icon: LayoutDashboard },
  energy: { path: "", label: "Início", icon: LayoutDashboard },
  diet: { path: "/diet", label: "Dieta", icon: Utensils },
  workout: { path: "/workout", label: "Treino", icon: Dumbbell },
  evolution: { path: "/evolution", label: "Evolução", icon: TrendingUp },
  exams: { path: "/exams", label: "Exames", icon: FlaskConical },
  prescriptions: { path: "/prescriptions", label: "Prescrições", icon: FileText },
};

const PREVIEW_TABS = [
  { id: "", label: "Início", icon: LayoutDashboard },
  { id: "/diet", label: "Dieta", icon: Utensils },
  { id: "/workout", label: "Treino", icon: Dumbbell },
  { id: "/evolution", label: "Evolução", icon: TrendingUp },
  { id: "/exams", label: "Exames", icon: FlaskConical },
  { id: "/prescriptions", label: "Prescrições", icon: FileText },
];

const MobilePreviewPanel = () => {
  const [open, setOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [activePreviewTab, setActivePreviewTab] = useState("");
  const location = useLocation();
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Extract patient ID from admin route
  const getPatientId = useCallback(() => {
    const match = location.pathname.match(/\/admin\/patients\/([^/]+)/);
    return match ? match[1] : null;
  }, [location.pathname]);

  const patientId = getPatientId();

  // Build the preview URL with patient context
  const getPreviewUrl = useCallback(() => {
    const baseUrl = window.location.origin;
    const params = new URLSearchParams({
      preview: "true",
      forceHideBadge: "true",
    });
    if (patientId) {
      params.set("patientId", patientId);
    }
    return `${baseUrl}/patient${activePreviewTab}?${params.toString()}`;
  }, [patientId, activePreviewTab]);

  // Auto-refresh when admin makes changes (listen for hash changes or use interval)
  const handleRefresh = () => {
    setRefreshKey((k) => k + 1);
  };

  // Listen for Supabase changes to auto-refresh
  useEffect(() => {
    if (!open || !patientId) return;

    // Debounced auto-refresh every 5 seconds when panel is open
    const interval = setInterval(() => {
      setRefreshKey((k) => k + 1);
    }, 8000);

    return () => clearInterval(interval);
  }, [open, patientId]);

  const isOnPatientPage = !!patientId;

  return (
    <>
      {/* Floating Button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed right-0 top-1/2 -translate-y-1/2 z-50 bg-primary text-primary-foreground p-3 rounded-l-xl shadow-lg hover:bg-primary/90 transition-all hover:pr-4 group"
          title="Pré-visualização mobile"
        >
          <Smartphone className="w-5 h-5 group-hover:scale-110 transition-transform" />
        </button>
      )}

      {/* Mobile Preview Sidebar */}
      <div
        className={`fixed top-0 right-0 h-full z-50 transition-transform duration-300 ease-in-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
        style={{ width: 400 }}
      >
        <div className="h-full flex flex-col bg-[hsl(220,20%,10%)] shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <X
                className="w-5 h-5 text-white/70 cursor-pointer hover:text-white transition-colors"
                onClick={() => setOpen(false)}
              />
              <span className="text-sm font-semibold text-white">
                Pré-visualização Mobile
              </span>
            </div>
            <button
              onClick={handleRefresh}
              className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
              title="Atualizar visualização"
            >
              <RefreshCw className="w-4 h-4 text-white/70 hover:text-white transition-colors" />
            </button>
          </div>

          {/* Tab Navigation */}
          {isOnPatientPage && (
            <div className="flex gap-1 px-3 py-2 border-b border-white/10 overflow-x-auto">
              {PREVIEW_TABS.map((tab) => {
                const Icon = tab.icon;
                const isActive = activePreviewTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActivePreviewTab(tab.id);
                      setRefreshKey((k) => k + 1);
                    }}
                    className={`flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium whitespace-nowrap transition-all ${
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-white/50 hover:text-white/80 hover:bg-white/5"
                    }`}
                  >
                    <Icon className="w-3 h-3" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          )}

          {/* Phone Frame */}
          <div className="flex-1 flex items-center justify-center p-4">
            <div className="relative w-[320px] h-[640px] rounded-[2.5rem] border-[6px] border-[hsl(220,15%,20%)] bg-background overflow-hidden shadow-2xl">
              {/* Notch */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-6 bg-[hsl(220,15%,20%)] rounded-b-2xl z-10" />

              {/* Screen Content */}
              <iframe
                ref={iframeRef}
                key={refreshKey}
                src={getPreviewUrl()}
                className="w-full h-full border-0"
                title="Mobile Preview"
                style={{ borderRadius: "2rem" }}
              />

              {/* Home indicator */}
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-28 h-1 rounded-full bg-foreground/30" />
            </div>
          </div>

          {/* Footer hint */}
          {!isOnPatientPage && (
            <div className="px-4 py-3 border-t border-white/10">
              <p className="text-[11px] text-white/40 text-center">
                Acesse a ficha de um paciente para visualizar a pré-visualização personalizada.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      )}
    </>
  );
};

export default MobilePreviewPanel;
