import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import {
  HeartPulse,
  LayoutDashboard,
  Users,
  CalendarDays,
  FileText,
  LogOut,
  Menu,
  X,
  ChevronRight,
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { authApi } from "@/lib/auth.api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const navItems = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/patients", icon: Users, label: "Pacientes" },
  { to: "/appointments", icon: CalendarDays, label: "Citas" },
  { to: "/reports", icon: FileText, label: "Reportes" },
];

const roleLabel: Record<string, string> = {
  ADMIN: "Administrador",
  DOCTOR: "Doctor",
  RECEPCION: "Recepción",
};

export default function AppLayout() {
  const { user, logout } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch {
      // Ignore API errors
    }
    logout();
    toast.success("Sesión cerrada correctamente");
  };

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .substring(0, 2)
        .toUpperCase()
    : "?";

  return (
    <TooltipProvider>
      <div className="flex min-h-screen bg-background text-foreground relative">
        {/* Mobile overlay */}
        {mobileOpen && (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={`
            fixed top-0 left-0 h-full z-40 flex flex-col
            bg-background border-r border-border/80
            transition-all duration-300 ease-in-out
            ${sidebarOpen ? "w-64" : "w-16"}
            ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          `}
        >
          {/* Sidebar Header */}
          <div className="flex items-center h-16 px-4 border-b border-border/50 shrink-0">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="shrink-0 w-9 h-9 rounded-lg bg-brand-teal/10 border border-brand-teal/30 flex items-center justify-center relative">
                <HeartPulse className="w-5 h-5 text-brand-teal" />
                <span className="absolute top-0.5 right-0.5 flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-orange opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-brand-orange"></span>
                </span>
              </div>
              {sidebarOpen && (
                <span className="font-bold text-white text-lg truncate tracking-wide flex items-center gap-1">
                  <span className="text-brand-teal">CEM</span>
                  <span className="text-slate-100">EDICA</span>
                </span>
              )}
            </div>
            <button
              onClick={() => setSidebarOpen((s) => !s)}
              className="hidden lg:flex p-1.5 rounded-lg text-muted-foreground hover:text-white hover:bg-secondary transition-colors cursor-pointer"
              aria-label={sidebarOpen ? "Colapsar menú" : "Expandir menú"}
            >
              {sidebarOpen ? (
                <X className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1.5">
            {navItems.map((item) => (
              <Tooltip key={item.to} delayDuration={0}>
                <TooltipTrigger asChild>
                  <NavLink
                    to={item.to}
                    className={({ isActive }) => `
                      flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                      transition-all duration-150 group relative
                      ${
                        isActive
                          ? "bg-brand-teal/10 text-brand-teal border border-brand-teal/20 shadow-[0_0_15px_-3px_rgba(51,161,155,0.15)]"
                          : "text-muted-foreground hover:text-white hover:bg-secondary/40"
                      }
                    `}
                    aria-label={item.label}
                  >
                    <item.icon className="w-5 h-5 shrink-0" />
                    {sidebarOpen && (
                      <span className="truncate">{item.label}</span>
                    )}
                  </NavLink>
                </TooltipTrigger>
                {!sidebarOpen && (
                  <TooltipContent
                    side="right"
                    className="bg-card border border-border text-foreground"
                  >
                    <p>{item.label}</p>
                  </TooltipContent>
                )}
              </Tooltip>
            ))}
          </nav>

          {/* User section */}
          <div className="p-3 border-t border-border/50 shrink-0 bg-background/50">
            <div
              className={`flex ${sidebarOpen ? "items-start gap-3" : "flex-col items-center gap-2"}`}
            >
              <Avatar className="w-9 h-9 bg-brand-teal shrink-0">
                <AvatarFallback className="text-white text-sm font-bold bg-brand-teal">
                  {initials}
                </AvatarFallback>
              </Avatar>
              {sidebarOpen && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">
                    {user?.name}
                  </p>
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-bold tracking-wider uppercase bg-brand-teal/15 text-brand-teal border border-brand-teal/20 mt-1">
                    {roleLabel[user?.role || ""] || user?.role}
                  </span>
                </div>
              )}
              <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleLogout}
                    className="w-8 h-8 text-muted-foreground hover:text-brand-orange hover:bg-brand-orange/10 shrink-0 cursor-pointer"
                    aria-label="Cerrar sesión"
                  >
                    <LogOut className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="bg-card border border-border text-foreground">
                  <p>Cerrar sesión</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <div
          className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${sidebarOpen ? "lg:ml-64" : "lg:ml-16"}`}
        >
          {/* Top bar (mobile) */}
          <header className="lg:hidden flex items-center h-14 px-4 bg-background border-b border-border">
            <button
              onClick={() => setMobileOpen((s) => !s)}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-white hover:bg-secondary"
              aria-label="Abrir menú"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 ml-3">
              <HeartPulse className="w-5 h-5 text-brand-teal" />
              <span className="font-bold text-white tracking-wide">
                CEMEDICA
              </span>
            </div>
          </header>

          {/* Page content */}
          <main className="flex-1 p-6 overflow-auto" id="main-content">
            <Outlet />
          </main>
        </div>
      </div>
    </TooltipProvider>
  );
}
