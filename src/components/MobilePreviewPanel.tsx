import { useState } from "react";
import { Smartphone, X } from "lucide-react";
import { useLocation } from "react-router-dom";

const MobilePreviewPanel = () => {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  // Map admin route to corresponding patient route for preview
  const getPatientPreviewUrl = () => {
    const baseUrl = window.location.origin;
    // Extract patient ID if on patient detail page
    const patientMatch = location.pathname.match(/\/admin\/patients\/([^/]+)/);
    if (patientMatch) {
      return `${baseUrl}/patient?preview=true&forceHideBadge=true`;
    }
    return `${baseUrl}/patient?preview=true&forceHideBadge=true`;
  };

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
        {/* Dark overlay background */}
        <div className="h-full flex flex-col bg-[hsl(220,20%,10%)] shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <X
                className="w-5 h-5 text-white/70 cursor-pointer hover:text-white transition-colors"
                onClick={() => setOpen(false)}
              />
              <span className="text-sm font-semibold text-white">
                Pré-visualização da Dieta
              </span>
            </div>
          </div>

          {/* Phone Frame */}
          <div className="flex-1 flex items-center justify-center p-4">
            <div className="relative w-[320px] h-[640px] rounded-[2.5rem] border-[6px] border-[hsl(220,15%,20%)] bg-background overflow-hidden shadow-2xl">
              {/* Notch */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-6 bg-[hsl(220,15%,20%)] rounded-b-2xl z-10" />

              {/* Screen Content */}
              <iframe
                src={getPatientPreviewUrl()}
                className="w-full h-full border-0"
                title="Mobile Preview"
                style={{ borderRadius: "2rem" }}
              />

              {/* Home indicator */}
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-28 h-1 rounded-full bg-foreground/30" />
            </div>
          </div>
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
