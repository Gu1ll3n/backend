import { useState, useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  CalendarPlus,
  Pencil,
  Trash2,
  Filter,
  CalendarDays,
  HeartPulse,
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar as CalendarIcon,
} from "lucide-react";
import {
  useAppointments,
  useCreateAppointment,
  useUpdateAppointment,
  useDeleteAppointment,
} from "@/hooks/useAppointments";
import { usePatients } from "@/hooks/usePatients";
import type {
  Appointment,
  AppointmentStatus,
  CreateAppointmentData,
} from "@/lib/appointments.api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  startOfWeek,
  endOfWeek,
  isSameMonth,
  isSameDay,
  isToday,
  addMonths,
  subMonths,
} from "date-fns";
import { useAuthStore } from "@/store/authStore";

const MESES_ES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

const DIAS_ES = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

const timeSlots = [
  "07:00",
  "07:30",
  "08:00",
  "08:30",
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "12:00",
  "12:30",
  "13:00",
  "13:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
  "17:00",
  "17:30",
  "18:00",
  "18:30",
  "19:00",
  "19:30",
  "20:00",
];

const statusConfig: Record<
  AppointmentStatus,
  { label: string; className: string }
> = {
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

const apptSchema = z.object({
  patientId: z.string().min(1, "Seleccione un paciente"),
  scheduledAt: z.string().min(1, "La fecha y hora son requeridas"),
  reason: z.string().min(1, "El motivo es requerido"),
  status: z.enum(["SCHEDULED", "COMPLETED", "CANCELLED", "NO_SHOW"]),
  notes: z.string().optional(),
  diagnosis: z.string().optional(),
  prescription: z.string().optional(),
});

type ApptForm = z.infer<typeof apptSchema>;

function DatePicker({
  value,
  onChange,
}: {
  value: Date;
  onChange: (date: Date) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(value));

  useEffect(() => {
    setCurrentMonth(startOfMonth(value));
  }, [value]);

  const days = eachDayOfInterval({
    start: startOfWeek(currentMonth, { weekStartsOn: 1 }),
    end: endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 1 }),
  });

  const handlePrevMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentMonth((prev) => subMonths(prev, 1));
  };

  const handleNextMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentMonth((prev) => addMonths(prev, 1));
  };

  return (
    <div className="relative">
      <Button
        type="button"
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full justify-start text-left font-normal bg-background/80 border border-border text-white hover:bg-secondary/40 focus:border-brand-teal gap-2"
      >
        <CalendarIcon className="h-4 w-4 text-brand-teal" />
        {value ? format(value, "dd/MM/yyyy") : <span>Seleccionar fecha</span>}
      </Button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <Card className="absolute top-full left-0 mt-2 p-3 bg-card border border-border/80 text-white shadow-2xl z-50 w-72">
            <div className="flex items-center justify-between mb-2">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-white hover:bg-secondary/40"
                onClick={handlePrevMonth}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm font-semibold capitalize">
                {MESES_ES[currentMonth.getMonth()]} {currentMonth.getFullYear()}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-white hover:bg-secondary/40"
                onClick={handleNextMonth}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center text-xs text-slate-400 mb-1">
              {DIAS_ES.map((d) => (
                <span key={d}>{d}</span>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {days.map((day, idx) => {
                const isSelected = isSameDay(day, value);
                const isCurrentMonth = isSameMonth(day, currentMonth);
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      onChange(day);
                      setIsOpen(false);
                    }}
                    className={`h-8 w-8 rounded text-xs transition-colors flex items-center justify-center cursor-pointer ${
                      isSelected
                        ? "bg-brand-teal text-white font-semibold"
                        : isCurrentMonth
                          ? "text-white hover:bg-brand-teal/20 animate-duration-150"
                          : "text-slate-600 hover:bg-secondary/20"
                    }`}
                  >
                    {format(day, "d")}
                  </button>
                );
              })}
            </div>
          </Card>
        </>
      )}
    </div>
  );
}

function AppointmentFormDialog({
  open,
  onClose,
  appointment,
  initialDate,
}: {
  open: boolean;
  onClose: () => void;
  appointment?: Appointment;
  initialDate?: Date;
}) {
  const { user } = useAuthStore();
  const { data: patients } = usePatients();
  const createMut = useCreateAppointment();
  const updateMut = useUpdateAppointment();

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState<string>("09:00");

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
    reset,
  } = useForm<ApptForm>({
    resolver: zodResolver(apptSchema),
    defaultValues: { status: "SCHEDULED" },
  });

  const patientId = useWatch({ control, name: "patientId" });
  const status = useWatch({ control, name: "status" });

  useEffect(() => {
    if (open) {
      if (appointment) {
        const apptDate = new Date(appointment.scheduledAt);
        setSelectedDate(apptDate);
        setSelectedTime(format(apptDate, "HH:mm"));
        reset({
          patientId: String(appointment.patientId),
          scheduledAt: appointment.scheduledAt,
          reason: appointment.reason,
          status: appointment.status,
          notes: appointment.notes || "",
          diagnosis: appointment.diagnosis || "",
          prescription: appointment.prescription || "",
        });
      } else {
        const defaultDate = initialDate ?? new Date();
        setSelectedDate(defaultDate);
        setSelectedTime("09:00");
        reset({
          patientId: "",
          scheduledAt: "",
          reason: "",
          status: "SCHEDULED",
          notes: "",
          diagnosis: "",
          prescription: "",
        });
      }
    }
  }, [open, appointment, initialDate, reset]);

  useEffect(() => {
    if (open) {
      const merged = new Date(selectedDate);
      const [hours, minutes] = selectedTime.split(":").map(Number);
      merged.setHours(hours, minutes, 0, 0);
      setValue("scheduledAt", merged.toISOString(), { shouldValidate: true });
    }
  }, [selectedDate, selectedTime, open, setValue]);

  const onSubmit = async (data: ApptForm) => {
    const payload: CreateAppointmentData = {
      patientId: parseInt(data.patientId),
      doctorId: user?.id || 0,
      scheduledAt: data.scheduledAt,
      reason: data.reason,
      status: data.status,
      notes: data.notes || undefined,
      diagnosis: data.diagnosis || undefined,
      prescription: data.prescription || undefined,
    };
    if (appointment) {
      await updateMut.mutateAsync({ id: appointment.id, data: payload });
    } else {
      await createMut.mutateAsync(payload);
    }
    reset();
    onClose();
  };

  const isSubmitting = createMut.isPending || updateMut.isPending;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="bg-card border border-border/80 text-white max-w-2xl">
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-linear-to-r from-brand-teal to-brand-orange" />

        <DialogHeader className="pt-4">
          <DialogTitle className="text-white flex items-center gap-2">
            <HeartPulse className="w-5 h-5 text-brand-teal" />
            {appointment ? "Editar cita" : "Nueva cita médica"}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {appointment
              ? "Actualice la información de la cita"
              : "Complete los datos de la cita"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-slate-300 text-xs font-semibold uppercase tracking-wider">
              Paciente *
            </Label>
            <Select
              value={patientId}
              onValueChange={(v) =>
                setValue("patientId", v, { shouldValidate: true })
              }
            >
              <SelectTrigger className="bg-background/80 border border-border text-white focus-visible:border-brand-teal">
                <SelectValue placeholder="Seleccionar paciente" />
              </SelectTrigger>
              <SelectContent className="bg-card border border-border text-foreground max-h-60">
                {patients?.map((p) => (
                  <SelectItem key={p.id} value={String(p.id)}>
                    {p.lastName}, {p.firstName} — CI: {p.ci}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.patientId && (
              <p className="text-brand-orange text-xs mt-1">
                {errors.patientId.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-slate-300 text-xs font-semibold uppercase tracking-wider">
                Fecha *
              </Label>
              <DatePicker value={selectedDate} onChange={setSelectedDate} />
              <input type="hidden" {...register("scheduledAt")} />
              {errors.scheduledAt && (
                <p className="text-brand-orange text-xs mt-1">
                  {errors.scheduledAt.message}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label className="text-slate-300 text-xs font-semibold uppercase tracking-wider">
                Hora *
              </Label>
              <Select value={selectedTime} onValueChange={setSelectedTime}>
                <SelectTrigger className="bg-background/80 border border-border text-white focus-visible:border-brand-teal">
                  <SelectValue placeholder="Seleccionar hora" />
                </SelectTrigger>
                <SelectContent className="bg-card border border-border text-foreground max-h-60">
                  {timeSlots.map((time) => (
                    <SelectItem key={time} value={time}>
                      {time} hrs
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-slate-300 text-xs font-semibold uppercase tracking-wider">
                Motivo de consulta *
              </Label>
              <Input
                {...register("reason")}
                className="bg-background/80 border border-border text-white focus-visible:border-brand-teal focus-visible:ring-brand-teal/20 placeholder:text-muted-foreground/45"
                placeholder="Consulta general, dolor de cabeza..."
              />
              {errors.reason && (
                <p className="text-brand-orange text-xs mt-1">
                  {errors.reason.message}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label className="text-slate-300 text-xs font-semibold uppercase tracking-wider">
                Estado
              </Label>
              <Select
                value={status}
                onValueChange={(v) =>
                  setValue("status", v as AppointmentStatus, {
                    shouldValidate: true,
                  })
                }
              >
                <SelectTrigger className="bg-background/80 border border-border text-white focus-visible:border-brand-teal">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border border-border text-foreground">
                  {Object.entries(statusConfig).map(([k, v]) => (
                    <SelectItem key={k} value={k}>
                      {v.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-slate-300 text-xs font-semibold uppercase tracking-wider">
              Notas
            </Label>
            <Textarea
              {...register("notes")}
              className="bg-background/80 border border-border text-white focus-visible:border-brand-teal focus-visible:ring-brand-teal/20 placeholder:text-muted-foreground/45 resize-none"
              rows={2}
              placeholder="Observaciones adicionales..."
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-slate-300 text-xs font-semibold uppercase tracking-wider">
              Diagnóstico
            </Label>
            <Textarea
              {...register("diagnosis")}
              className="bg-background/80 border border-border text-white focus-visible:border-brand-teal focus-visible:ring-brand-teal/20 placeholder:text-muted-foreground/45 resize-none"
              rows={2}
              placeholder="Diagnóstico del médico..."
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-slate-300 text-xs font-semibold uppercase tracking-wider">
              Receta / Prescripción
            </Label>
            <Textarea
              {...register("prescription")}
              className="bg-background/80 border border-border text-white focus-visible:border-brand-teal focus-visible:ring-brand-teal/20 placeholder:text-muted-foreground/45 resize-none"
              rows={2}
              placeholder="Medicamentos, indicaciones..."
            />
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              className="text-muted-foreground hover:text-white hover:bg-secondary/40 cursor-pointer"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-brand-teal hover:bg-brand-teal/85 active:bg-brand-teal-dark text-white font-semibold shadow-md shadow-brand-teal/5 cursor-pointer"
              id={
                appointment ? "save-appointment-btn" : "create-appointment-btn"
              }
            >
              {isSubmitting
                ? "Guardando..."
                : appointment
                  ? "Guardar cambios"
                  : "Registrar cita"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function AppointmentsPage() {
  const [viewMode, setViewMode] = useState<"calendar" | "list">("calendar");
  const [currentDate, setCurrentDate] = useState(new Date());

  const [formOpen, setFormOpen] = useState(false);
  const [editingAppt, setEditingAppt] = useState<Appointment | undefined>();
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [initialDateForForm, setInitialDateForForm] = useState<
    Date | undefined
  >();

  // Filter States for List View
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [fromFilter, setFromFilter] = useState("");
  const [toFilter, setToFilter] = useState("");

  // Determine date intervals for API query based on active view mode
  const gridStart = startOfWeek(startOfMonth(currentDate), { weekStartsOn: 1 });
  const gridEnd = endOfWeek(endOfMonth(currentDate), { weekStartsOn: 1 });

  const queryParams =
    viewMode === "calendar"
      ? {
          from: gridStart.toISOString(),
          to: gridEnd.toISOString(),
        }
      : {
          status:
            statusFilter === "all" || !statusFilter ? undefined : statusFilter,
          from: fromFilter ? new Date(fromFilter).toISOString() : undefined,
          to: toFilter ? new Date(toFilter).toISOString() : undefined,
        };

  const { data: appointments, isLoading } = useAppointments(queryParams);
  const deleteMut = useDeleteAppointment();

  const handleDelete = async () => {
    if (deletingId) {
      await deleteMut.mutateAsync(deletingId);
      setDeletingId(null);
    }
  };

  const handleCreateAtDate = (day: Date) => {
    setEditingAppt(undefined);
    setInitialDateForForm(day);
    setFormOpen(true);
  };

  // Build days for Calendar View Month Grid
  const dayCells = eachDayOfInterval({ start: gridStart, end: gridEnd });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Citas médicas
          </h1>
          <p className="text-muted-foreground text-xs font-semibold uppercase tracking-wider mt-0.5">
            {appointments?.length ?? 0} cita
            {appointments?.length !== 1 ? "s" : ""} registrada
            {appointments?.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* View Mode Toggle Switch */}
          <div className="flex items-center gap-1 bg-card/60 border border-border/80 p-1 rounded-lg">
            <button
              onClick={() => setViewMode("calendar")}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                viewMode === "calendar"
                  ? "bg-brand-teal text-white shadow-md shadow-brand-teal/5"
                  : "text-muted-foreground hover:text-white"
              }`}
            >
              Calendario
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                viewMode === "list"
                  ? "bg-brand-teal text-white shadow-md shadow-brand-teal/5"
                  : "text-muted-foreground hover:text-white"
              }`}
            >
              Listado
            </button>
          </div>

          <Button
            onClick={() => {
              setEditingAppt(undefined);
              setInitialDateForForm(undefined);
              setFormOpen(true);
            }}
            className="bg-brand-teal hover:bg-brand-teal/85 active:bg-brand-teal-dark text-white font-semibold shadow-md shadow-brand-teal/10 gap-2 cursor-pointer"
            id="add-appointment-btn"
          >
            <CalendarPlus className="w-4 h-4" />
            <span className="hidden sm:inline">Nueva cita</span>
          </Button>
        </div>
      </div>

      {viewMode === "calendar" ? (
        /* GOOGLE CALENDAR MONTH VIEW */
        <div className="space-y-4 animate-fade-in animate-duration-200">
          {/* Calendar Navigation Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 bg-card/45 p-4 rounded-xl border border-border/80">
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentDate(new Date())}
                className="bg-background/80 border border-border text-white hover:bg-secondary/40 font-medium cursor-pointer"
              >
                Hoy
              </Button>
              <div className="flex items-center">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setCurrentDate((prev) => subMonths(prev, 1))}
                  className="text-muted-foreground hover:text-white hover:bg-secondary/40 h-8 w-8 cursor-pointer"
                  aria-label="Mes anterior"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setCurrentDate((prev) => addMonths(prev, 1))}
                  className="text-muted-foreground hover:text-white hover:bg-secondary/40 h-8 w-8 cursor-pointer"
                  aria-label="Mes siguiente"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              <h2 className="text-base font-bold text-white capitalize select-none pl-1">
                {MESES_ES[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h2>
            </div>

            {/* Colors Legend */}
            <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-[10px] text-muted-foreground">
              {Object.entries(statusConfig).map(([k, v]) => (
                <div key={k} className="flex items-center gap-1.5">
                  <span
                    className={`w-2 h-2 rounded-full border ${v.className.split(" ")[0]} ${v.className.split(" ")[2]}`}
                  />
                  <span>{v.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="card-premium p-1.5 bg-card/50 border border-border/80 rounded-xl">
            {/* Weekdays Row */}
            <div className="grid grid-cols-7 text-center text-xs font-semibold text-slate-400 py-2">
              {DIAS_ES.map((day) => (
                <div key={day}>{day}</div>
              ))}
            </div>

            {/* Grid Cells */}
            <div className="grid grid-cols-7 gap-1 bg-border/10 rounded-lg overflow-hidden border border-border/20">
              {isLoading
                ? Array.from({ length: 35 }).map((_, i) => (
                    <div key={i} className="bg-card/45 min-h-[110px] p-2">
                      <Skeleton className="h-4 w-6 bg-muted/20 mb-2 rounded" />
                      <Skeleton className="h-3 w-16 bg-muted/10 rounded" />
                    </div>
                  ))
                : dayCells.map((day, idx) => {
                    const isCurrentMonth = isSameMonth(day, currentDate);
                    const isDayToday = isToday(day);

                    // Filter appointments on this specific day
                    const dayAppointments = appointments
                      ? appointments.filter((appt) =>
                          isSameDay(new Date(appt.scheduledAt), day),
                        )
                      : [];

                    return (
                      <div
                        key={idx}
                        onClick={() => handleCreateAtDate(day)}
                        className={`group min-h-[115px] p-2 flex flex-col justify-between transition-all duration-150 relative bg-card/45 hover:bg-secondary/15 cursor-pointer ${
                          !isCurrentMonth ? "opacity-35 bg-card/20" : ""
                        } ${isDayToday ? "ring-1 ring-inset ring-brand-teal/30 bg-brand-teal/5" : ""}`}
                      >
                        {/* Cell Header */}
                        <div className="flex justify-between items-start mb-1.5">
                          <span
                            className={`text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center select-none ${
                              isDayToday
                                ? "bg-brand-teal text-white shadow-md shadow-brand-teal/20"
                                : "text-slate-300"
                            }`}
                          >
                            {format(day, "d")}
                          </span>
                          {/* Plus button on hover */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCreateAtDate(day);
                            }}
                            className="opacity-0 group-hover:opacity-100 text-brand-teal hover:text-white p-0.5 rounded hover:bg-secondary transition-all cursor-pointer"
                            title="Programar cita"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Appointments List inside cell */}
                        <div className="flex-1 flex flex-col gap-1 overflow-y-auto max-h-[75px] pr-0.5 scrollbar-thin scrollbar-thumb-border">
                          {dayAppointments.map((appt) => {
                            const cfg = statusConfig[appt.status];
                            return (
                              <button
                                key={appt.id}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingAppt(appt);
                                  setFormOpen(true);
                                }}
                                className={`text-left text-[9px] px-1.5 py-0.5 rounded truncate font-medium border ${cfg.className} transition-all duration-100 hover:scale-[1.02] cursor-pointer`}
                                title={`${format(new Date(appt.scheduledAt), "HH:mm")} - ${
                                  appt.patient.firstName
                                } ${appt.patient.lastName}: ${appt.reason}`}
                              >
                                <span className="font-bold">
                                  {format(new Date(appt.scheduledAt), "HH:mm")}
                                </span>{" "}
                                {appt.patient.firstName}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
            </div>
          </div>
        </div>
      ) : (
        /* STANDARD TABULAR LIST VIEW */
        <div className="space-y-4 animate-fade-in animate-duration-200">
          {/* Filters Bar */}
          <div className="flex flex-wrap gap-3 items-center">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Filter className="w-4 h-4" />
              <span className="text-xs font-semibold uppercase tracking-wider">
                Filtros:
              </span>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger
                className="w-40 bg-card/65 border border-border text-white focus-visible:border-brand-teal"
                id="status-filter"
              >
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent className="bg-card border border-border text-foreground">
                <SelectItem value="all">Todos</SelectItem>
                {Object.entries(statusConfig).map(([k, v]) => (
                  <SelectItem key={k} value={k}>
                    {v.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              type="date"
              value={fromFilter}
              onChange={(e) => setFromFilter(e.target.value)}
              className="w-40 bg-card/65 border border-border text-white focus-visible:border-brand-teal focus-visible:ring-brand-teal/20"
              aria-label="Desde"
            />
            <Input
              type="date"
              value={toFilter}
              onChange={(e) => setToFilter(e.target.value)}
              className="w-40 bg-card/65 border border-border text-white focus-visible:border-brand-teal focus-visible:ring-brand-teal/20"
              aria-label="Hasta"
            />
            {(statusFilter !== "all" || fromFilter || toFilter) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setStatusFilter("all");
                  setFromFilter("");
                  setToFilter("");
                }}
                className="text-muted-foreground hover:text-white hover:bg-secondary/40 cursor-pointer"
              >
                Limpiar
              </Button>
            )}
          </div>

          {/* List Table Card */}
          <Card className="card-premium bg-card/50 border border-border/80">
            <CardHeader className="pb-3">
              <CardTitle className="text-white text-base">
                Listado de citas
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Skeleton key={i} className="h-14 bg-muted/30 rounded" />
                  ))}
                </div>
              ) : !appointments?.length ? (
                <div className="text-center py-16 text-muted-foreground/45">
                  <CalendarDays className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p className="text-sm">
                    No se encontraron citas con los filtros seleccionados
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table
                    className="w-full text-sm"
                    role="table"
                    aria-label="Tabla de citas"
                  >
                    <thead>
                      <tr className="text-muted-foreground border-b border-border/40 text-left">
                        <th className="pb-3 font-semibold text-xs uppercase tracking-wider">
                          Paciente
                        </th>
                        <th className="pb-3 font-semibold text-xs uppercase tracking-wider hidden md:table-cell">
                          Doctor
                        </th>
                        <th className="pb-3 font-semibold text-xs uppercase tracking-wider">
                          Fecha / Hora
                        </th>
                        <th className="pb-3 font-semibold text-xs uppercase tracking-wider hidden lg:table-cell">
                          Motivo
                        </th>
                        <th className="pb-3 font-semibold text-xs uppercase tracking-wider">
                          Estado
                        </th>
                        <th className="pb-3 font-semibold text-xs uppercase tracking-wider text-right">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/20">
                      {appointments.map((appt) => {
                        const cfg = statusConfig[appt.status];
                        return (
                          <tr
                            key={appt.id}
                            className="text-slate-300 hover:bg-secondary/20 transition-colors"
                          >
                            <td className="py-3">
                              <p className="text-white font-semibold">
                                {appt.patient.firstName} {appt.patient.lastName}
                              </p>
                              <p className="text-muted-foreground/60 font-mono text-[10px] mt-0.5">
                                CI: {appt.patient.ci}
                              </p>
                            </td>
                            <td className="py-3 text-muted-foreground hidden md:table-cell">
                              {appt.doctor.name}
                            </td>
                            <td className="py-3 text-muted-foreground font-mono">
                              <p>
                                {format(
                                  new Date(appt.scheduledAt),
                                  "dd/MM/yyyy",
                                )}
                              </p>
                              <p className="text-[10px] text-muted-foreground/60 mt-0.5">
                                {format(new Date(appt.scheduledAt), "HH:mm")}
                              </p>
                            </td>
                            <td className="py-3 text-muted-foreground hidden lg:table-cell max-w-xs">
                              <p className="truncate">{appt.reason}</p>
                            </td>
                            <td className="py-3">
                              <Badge
                                className={`${cfg.className} border text-[10px] uppercase font-bold tracking-wide`}
                              >
                                {cfg.label}
                              </Badge>
                            </td>
                            <td className="py-3">
                              <div className="flex items-center justify-end gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => {
                                    setEditingAppt(appt);
                                    setFormOpen(true);
                                  }}
                                  className="w-8 h-8 text-brand-teal hover:text-white hover:bg-brand-teal/20 cursor-pointer"
                                  aria-label={`Editar cita de ${appt.patient.firstName}`}
                                >
                                  <Pencil className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => setDeletingId(appt.id)}
                                  className="w-8 h-8 text-brand-orange hover:text-white hover:bg-brand-orange/20 cursor-pointer"
                                  aria-label={`Eliminar cita de ${appt.patient.firstName}`}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Appointment Creation / Editing Dialog */}
      <AppointmentFormDialog
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditingAppt(undefined);
          setInitialDateForForm(undefined);
        }}
        appointment={editingAppt}
        initialDate={initialDateForForm}
      />

      {/* Appointment Deletion Confirmation Dialog */}
      <AlertDialog
        open={!!deletingId}
        onOpenChange={(v) => !v && setDeletingId(null)}
      >
        <AlertDialogContent className="bg-card border border-border/80">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">
              ¿Eliminar cita?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground text-sm">
              Esta acción realizará una eliminación lógica. La cita no aparecerá
              en los listados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-secondary border border-border text-white hover:bg-secondary/80 cursor-pointer">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-brand-orange hover:bg-brand-orange/85 text-white cursor-pointer"
              id="confirm-delete-appointment"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
