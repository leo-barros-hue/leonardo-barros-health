import { Outlet, NavLink, useNavigate, useSearchParams } from "react-router-dom";
import {
  Activity,
  LayoutDashboard,
  Utensils,
  Dumbbell,
  FlaskConical,
  FileText,
  TrendingUp,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/patient", icon: LayoutDashboard, label: "Início", end: true },
  { to: "/patient/diet", icon: Utensils, label: "Dieta" },
  { to: "/patient/workout", icon: Dumbbell, label: "Treino" },
  { to: "/patient/evolution", icon: TrendingUp, label: "Evolução" },
  { to: "/patient/exams", icon: FlaskConical, label: "Exames" },
  { to: "/patient/prescriptions", icon: FileText, label: "Prescrições" },
];

const PatientLayout = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isPreview = searchParams.get("preview") === "true";

  const handleLogout = () => {
    localStorage.removeItem("userRole");
    navigate("/");
  };

  if (isPreview) {
    return (
      <div className="min-h-screen bg-background">
        <main className="px-3 py-4">
          <Outlet />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-xl">
        <div className="container flex items-center justify-between h-16 max-w-5xl">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Activity className="w-4 h-4 text-primary" />
            </div>
            <span className="font-bold text-sm text-foreground">LB Saúde</span>
          </div>
          <button
            onClick={handleLogout}
            className="text-muted-foreground hover:text-destructive transition-colors"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="container py-6 max-w-5xl pb-24 page-enter">
        <Outlet />
      </main>

      {/* Bottom nav (mobile) */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur-xl md:hidden">
        <div className="flex items-center justify-around h-16">
          {navItems.slice(0, 5).map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  "flex flex-col items-center gap-1 text-[10px] font-medium transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground"
                )
              }
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default PatientLayout;
