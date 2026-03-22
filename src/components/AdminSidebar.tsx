import { NavLink, useNavigate, useLocation } from "react-router-dom";
import {
  Activity,
  Users,
  LayoutDashboard,
  Utensils,
  Dumbbell,
  FlaskConical,
  FileText,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Apple,
  Database,
  PackageOpen,
  ClipboardList,
  Zap,
  BookOpen,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const navItems = [
  
  { to: "/admin/patients", icon: Users, label: "Pacientes" },
  { to: "/admin/diets", icon: Utensils, label: "Dietas" },
  { to: "/admin/workouts", icon: Dumbbell, label: "Treinos" },
  { to: "/admin/exams", icon: FlaskConical, label: "Exames" },
  { to: "/admin/prescriptions", icon: FileText, label: "Prescrições" },
  { to: "/admin/materials", icon: BookOpen, label: "Materiais" },
];

const cadastroItems = [
  { to: "/admin/foods", icon: Apple, label: "Alimentos" },
  { to: "/admin/exercises", icon: Dumbbell, label: "Exercícios" },
  { to: "/admin/techniques", icon: Zap, label: "Técnicas de Treino" },
  { to: "/admin/extras", icon: PackageOpen, label: "Materiais Extras" },
  { to: "/admin/forms", icon: ClipboardList, label: "Formulários" },
];

const AdminSidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [cadastroOpen, setCadastroOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const isCadastroActive = cadastroItems.some((item) =>
    location.pathname.startsWith(item.to)
  );

  const handleLogout = () => {
    localStorage.removeItem("userRole");
    navigate("/");
  };

  return (
    <aside
      className={cn(
        "h-screen sticky top-0 flex flex-col bg-sidebar border-r border-sidebar-border transition-all duration-300",
        collapsed ? "w-[72px]" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="p-4 flex items-center gap-3 border-b border-sidebar-border">
        <div className="w-10 h-10 min-w-[40px] rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
          <Activity className="w-5 h-5 text-primary" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <p className="text-sm font-bold text-foreground truncate">Leonardo Barros</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Saúde & Performance</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-primary/10 text-primary border border-primary/20"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
              )
            }
          >
            <item.icon className="w-5 h-5 min-w-[20px] text-secondary-foreground" />
            {!collapsed && <span className="text-secondary-foreground">{item.label}</span>}
          </NavLink>
        ))}

        {/* Cadastro dropdown */}
        <div>
          <button
            onClick={() => setCadastroOpen(!cadastroOpen)}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 w-full",
              isCadastroActive
                ? "bg-primary/10 text-primary border border-primary/20"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
            )}
          >
            <Database className="w-5 h-5 min-w-[20px] text-secondary-foreground" />
            {!collapsed && (
              <>
                <span className="text-secondary-foreground flex-1 text-left">Cadastros</span>
                <ChevronDown
                  className={cn(
                    "w-4 h-4 text-muted-foreground transition-transform duration-200",
                    cadastroOpen && "rotate-180"
                  )}
                />
              </>
            )}
          </button>

          {(cadastroOpen || isCadastroActive) && !collapsed && (
            <div className="ml-4 mt-1 space-y-1 border-l border-border pl-3">
              {cadastroItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200",
                      isActive
                        ? "bg-primary/10 text-primary border border-primary/20"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                    )
                  }
                >
                  <item.icon className="w-4 h-4 min-w-[16px] text-secondary-foreground" />
                  <span className="text-secondary-foreground">{item.label}</span>
                </NavLink>
              ))}
            </div>
          )}
        </div>
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-sidebar-border space-y-1">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/50 w-full transition-colors"
        >
          {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          {!collapsed && <span>Recolher</span>}
        </button>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-destructive hover:bg-destructive/10 w-full transition-colors"
        >
          <LogOut className="w-5 h-5 min-w-[20px]" />
          {!collapsed && <span>Sair</span>}
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;