import { NavLink, useNavigate } from "react-router-dom";
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
  Apple } from
"lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const navItems = [
{ to: "/admin", icon: LayoutDashboard, label: "Dashboard", end: true },
{ to: "/admin/patients", icon: Users, label: "Pacientes" },
{ to: "/admin/diets", icon: Utensils, label: "Dietas" },
{ to: "/admin/workouts", icon: Dumbbell, label: "Treinos" },
{ to: "/admin/exams", icon: FlaskConical, label: "Exames" },
{ to: "/admin/prescriptions", icon: FileText, label: "Prescrições" },
{ to: "/admin/foods", icon: Apple, label: "Alimentos" }];


const AdminSidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("userRole");
    navigate("/");
  };

  return (
    <aside
      className={cn(
        "h-screen sticky top-0 flex flex-col bg-sidebar border-r border-sidebar-border transition-all duration-300",
        collapsed ? "w-[72px]" : "w-64"
      )}>
      
      {/* Logo */}
      <div className="p-4 flex items-center gap-3 border-b border-sidebar-border">
        <div className="w-10 h-10 min-w-[40px] rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
          <Activity className="w-5 h-5 text-primary" />
        </div>
        {!collapsed &&
        <div className="overflow-hidden">
            <p className="text-sm font-bold text-foreground truncate">Leonardo Barros</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Saúde & Performance</p>
          </div>
        }
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map((item) =>
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          className={({ isActive }) =>
          cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
            isActive ?
            "bg-primary/10 text-primary border border-primary/20" :
            "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
          )
          }>
          
            <item.icon className="w-5 h-5 min-w-[20px] text-secondary-foreground border-sidebar-primary bg-black/0" />
            {!collapsed && <span className="text-secondary-foreground">{item.label}</span>}
          </NavLink>
        )}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-sidebar-border space-y-1">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/50 w-full transition-colors">
          
          {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          {!collapsed && <span>Recolher</span>}
        </button>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-destructive hover:bg-destructive/10 w-full transition-colors">
          
          <LogOut className="w-5 h-5 min-w-[20px]" />
          {!collapsed && <span>Sair</span>}
        </button>
      </div>
    </aside>);

};

export default AdminSidebar;