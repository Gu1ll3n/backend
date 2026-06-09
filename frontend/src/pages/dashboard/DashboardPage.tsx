import { CalendarDays, CheckCircle2, Users, TrendingUp } from "lucide-react";
import { useAppointmentStats, useAppointments } from "@/hooks/useAppointments";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const statusConfig = {
  SCHEDULED: {
    label: "Programada",
    className: "bg-brand-teal/10 text-brand-teal border-brand-teal/20",
  },
  COMPLETED: {
    label: "Completada",
    className: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  },
  CANCELLED: {
    label: "Cancelada",
    className: "bg-red-500/10 text-red-400 border-red-500/20",
  },
  NO_SHOW: {
    label: "No asistió",
    className: "bg-brand-orange/10 text-brand-orange border-brand-orange/20",
  },
};

function StatCard({
  icon: Icon,
  label,
  value,
  color,
  bgColor,
  isLoading,
}: {
  icon: React.ElementType;
  label: string;
  value?: number;
  color: string;
  bgColor: string;
  isLoading: boolean;
}) {
  return (
    <Card className="card-premium bg-card/50 border-border/80 relative overflow-hidden group">
      {/* Top subtle hover accent */}
      <div
        className={`absolute top-0 left-0 right-0 h-0.5 transition-all duration-300 opacity-0 group-hover:opacity-100 bg-linear-to-r ${color === "text-brand-orange" ? "from-brand-orange to-brand-orange/70" : "from-brand-teal to-brand-teal/70"}`}
      />

      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {label}
            </p>
            {isLoading ? (
              <Skeleton className="h-8 w-16 mt-1.5 bg-muted/50" />
            ) : (
              <p
                className={`text-3xl font-extrabold mt-1.5 font-mono ${color}`}
              >
                {value ?? 0}
              </p>
            )}
          </div>
          <div
            className={`p-3 rounded-xl ${bgColor} transition-transform duration-300 group-hover:scale-110`}
          >
            <Icon className={`w-6 h-6 ${color}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const { data: stats, isLoading: statsLoading } = useAppointmentStats();
  const { data: appointments, isLoading: apptLoading } = useAppointments();

  const todayStr = format(new Date(), "EEEE d 'de' MMMM, yyyy", { locale: es });
  const todayAppts =
    appointments?.filter((a) => {
      const d = new Date(a.scheduledAt);
      const t = new Date();
      return (
        d.getDate() === t.getDate() &&
        d.getMonth() === t.getMonth() &&
        d.getFullYear() === t.getFullYear()
      );
    }) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          Panel de Control
        </h1>
        <p className="text-brand-teal text-xs font-semibold tracking-wider mt-1 uppercase">
          {todayStr}
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          icon={CalendarDays}
          label="Total de citas"
          value={stats?.total}
          color="text-brand-teal"
          bgColor="bg-brand-teal/10"
          isLoading={statsLoading}
        />
        <StatCard
          icon={TrendingUp}
          label="Citas hoy"
          value={stats?.todayCount}
          color="text-brand-orange"
          bgColor="bg-brand-orange/10"
          isLoading={statsLoading}
        />
        <StatCard
          icon={CheckCircle2}
          label="Completadas"
          value={stats?.completed}
          color="text-brand-teal"
          bgColor="bg-brand-teal/10"
          isLoading={statsLoading}
        />
        <StatCard
          icon={Users}
          label="Pacientes registrados"
          value={stats?.totalPatients}
          color="text-brand-orange"
          bgColor="bg-brand-orange/10"
          isLoading={statsLoading}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Today's appointments (takes 1 col on xl, or full on mobile) */}
        <Card className="card-premium bg-card/50 border-border/80 xl:col-span-1 flex flex-col">
          <CardHeader className="pb-3">
            <CardTitle className="text-white text-lg flex items-center gap-2">
              <span className="pulse-dot" />
              Citas de hoy
            </CardTitle>
            <CardDescription className="text-muted-foreground text-xs">
              {todayAppts.length} cita{todayAppts.length !== 1 ? "s" : ""}{" "}
              programada{todayAppts.length !== 1 ? "s" : ""} para hoy
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
            {apptLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16 bg-muted/30 rounded-lg" />
                ))}
              </div>
            ) : todayAppts.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground/50">
                <CalendarDays className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p className="text-sm">No hay citas programadas para hoy</p>
              </div>
            ) : (
              <div className="space-y-3">
                {todayAppts.map((appt) => {
                  const cfg =
                    statusConfig[appt.status] || statusConfig.SCHEDULED;
                  return (
                    <div
                      key={appt.id}
                      className="flex items-center gap-4 p-4 rounded-lg bg-background/50 border border-border/60 hover:border-brand-teal/30 transition-colors"
                    >
                      <div className="text-center min-w-12">
                        <p className="text-brand-teal font-extrabold text-sm">
                          {format(new Date(appt.scheduledAt), "HH:mm")}
                        </p>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-semibold text-sm truncate">
                          {appt.patient.firstName} {appt.patient.lastName}
                        </p>
                        <p className="text-muted-foreground text-xs truncate mt-0.5">
                          {appt.reason}
                        </p>
                        <p className="text-muted-foreground/60 text-[10px] mt-0.5">
                          Dr. {appt.doctor.name}
                        </p>
                      </div>
                      <Badge
                        className={`${cfg.className} border text-[10px] uppercase font-bold tracking-wide`}
                      >
                        {cfg.label}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent appointments (takes 2 cols on xl) */}
        <Card className="card-premium bg-card/50 border-border/80 xl:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-white text-lg flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-brand-teal" />
              Últimas citas registradas
            </CardTitle>
            <CardDescription className="text-muted-foreground text-xs">
              Las 5 citas médicas más recientes en el sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            {apptLoading ? (
              <div className="space-y-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-10 bg-muted/30 rounded" />
                ))}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-muted-foreground border-b border-border/40 text-left">
                      <th className="pb-3 font-semibold text-xs uppercase tracking-wider">
                        Paciente
                      </th>
                      <th className="pb-3 font-semibold text-xs uppercase tracking-wider hidden sm:table-cell">
                        Doctor
                      </th>
                      <th className="pb-3 font-semibold text-xs uppercase tracking-wider">
                        Fecha / Hora
                      </th>
                      <th className="pb-3 font-semibold text-xs uppercase tracking-wider">
                        Estado
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/20">
                    {(appointments || []).slice(0, 5).map((appt) => {
                      const cfg =
                        statusConfig[appt.status] || statusConfig.SCHEDULED;
                      return (
                        <tr
                          key={appt.id}
                          className="text-slate-300 hover:bg-secondary/20 transition-colors"
                        >
                          <td className="py-3 font-semibold text-white">
                            {appt.patient.firstName} {appt.patient.lastName}
                          </td>
                          <td className="py-3 text-muted-foreground hidden sm:table-cell">
                            {appt.doctor.name}
                          </td>
                          <td className="py-3 text-muted-foreground font-mono">
                            {format(
                              new Date(appt.scheduledAt),
                              "dd/MM/yyyy HH:mm",
                            )}
                          </td>
                          <td className="py-3">
                            <Badge
                              className={`${cfg.className} border text-[10px] uppercase font-bold tracking-wide`}
                            >
                              {cfg.label}
                            </Badge>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {!appointments?.length && (
                  <p className="text-center text-muted-foreground/40 text-sm py-12">
                    Sin citas médicas registradas
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
