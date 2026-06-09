import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Search,
  UserPlus,
  Pencil,
  Trash2,
  Eye,
  Users,
  Phone,
  MapPin,
  Droplets,
  HeartPulse,
} from "lucide-react";
import {
  usePatients,
  useCreatePatient,
  useUpdatePatient,
  useDeletePatient,
} from "@/hooks/usePatients";
import type { Patient } from "@/lib/patients.api";
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
import { format } from "date-fns";

const patientSchema = z.object({
  firstName: z.string().min(1, "El nombre es requerido"),
  lastName: z.string().min(1, "El apellido es requerido"),
  ci: z.string().min(1, "El CI es requerido"),
  birthDate: z.string().min(1, "La fecha de nacimiento es requerida"),
  gender: z.enum(["M", "F", "O"] as const, { error: "El género es requerido" }),
  phone: z.string().min(1, "El teléfono es requerido"),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  address: z.string().optional(),
  bloodType: z.string().optional(),
  allergies: z.string().optional(),
  medicalHistory: z.string().optional(),
});

type PatientForm = z.infer<typeof patientSchema>;

const bloodTypes = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];

function calculateAge(birthDate: string): number {
  const diff = Date.now() - new Date(birthDate).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
}

function PatientFormDialog({
  open,
  onClose,
  patient,
}: {
  open: boolean;
  onClose: () => void;
  patient?: Patient;
}) {
  const isEditing = !!patient;
  const createMut = useCreatePatient();
  const updateMut = useUpdatePatient();

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
    reset,
  } = useForm<PatientForm>({
    resolver: zodResolver(patientSchema),
    defaultValues: patient
      ? {
          ...patient,
          birthDate: patient.birthDate
            ? format(new Date(patient.birthDate), "yyyy-MM-dd")
            : "",
          gender: patient.gender as "M" | "F" | "O",
        }
      : {},
  });

  const gender = useWatch({ control, name: "gender" });
  const bloodType = useWatch({ control, name: "bloodType" });

  const onSubmit = async (data: PatientForm) => {
    const payload = { ...data, email: data.email || undefined };
    if (isEditing) {
      await updateMut.mutateAsync({ id: patient.id, data: payload });
    } else {
      await createMut.mutateAsync(payload);
    }
    reset();
    onClose();
  };

  const isSubmitting = createMut.isPending || updateMut.isPending;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="bg-card border-border/80 text-white max-w-2xl">
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-linear-to-r from-brand-teal to-brand-orange" />

        <DialogHeader className="pt-4">
          <DialogTitle className="text-white flex items-center gap-2">
            <HeartPulse className="w-5 h-5 text-brand-teal" />
            {isEditing ? "Editar paciente" : "Registrar nuevo paciente"}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {isEditing
              ? "Actualice la información del paciente"
              : "Complete los datos del nuevo paciente"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-slate-300 text-xs font-semibold uppercase tracking-wider">
                Nombre *
              </Label>
              <Input
                {...register("firstName")}
                className="bg-background/80 border-border text-white focus-visible:border-brand-teal focus-visible:ring-brand-teal/20 placeholder:text-muted-foreground/45"
                placeholder="Juan"
              />
              {errors.firstName && (
                <p className="text-brand-orange text-xs mt-1">
                  {errors.firstName.message}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label className="text-slate-300 text-xs font-semibold uppercase tracking-wider">
                Apellido *
              </Label>
              <Input
                {...register("lastName")}
                className="bg-background/80 border-border text-white focus-visible:border-brand-teal focus-visible:ring-brand-teal/20 placeholder:text-muted-foreground/45"
                placeholder="Pérez"
              />
              {errors.lastName && (
                <p className="text-brand-orange text-xs mt-1">
                  {errors.lastName.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-slate-300 text-xs font-semibold uppercase tracking-wider">
                CI *
              </Label>
              <Input
                {...register("ci")}
                className="bg-background/80 border-border text-white focus-visible:border-brand-teal focus-visible:ring-brand-teal/20 placeholder:text-muted-foreground/45"
                placeholder="12345678"
              />
              {errors.ci && (
                <p className="text-brand-orange text-xs mt-1">
                  {errors.ci.message}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label className="text-slate-300 text-xs font-semibold uppercase tracking-wider">
                Género *
              </Label>
              <Select
                value={gender}
                onValueChange={(v) =>
                  setValue("gender", v as "M" | "F" | "O", {
                    shouldValidate: true,
                  })
                }
              >
                <SelectTrigger className="bg-background/80 border-border text-white focus-visible:border-brand-teal">
                  <SelectValue placeholder="Seleccionar" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border text-foreground">
                  <SelectItem value="M">Masculino</SelectItem>
                  <SelectItem value="F">Femenino</SelectItem>
                  <SelectItem value="O">Otro</SelectItem>
                </SelectContent>
              </Select>
              {errors.gender && (
                <p className="text-brand-orange text-xs mt-1">
                  {errors.gender.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-slate-300 text-xs font-semibold uppercase tracking-wider">
                Fecha de nacimiento *
              </Label>
              <Input
                type="date"
                {...register("birthDate")}
                className="bg-background/80 border-border text-white focus-visible:border-brand-teal focus-visible:ring-brand-teal/20"
              />
              {errors.birthDate && (
                <p className="text-brand-orange text-xs mt-1">
                  {errors.birthDate.message}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label className="text-slate-300 text-xs font-semibold uppercase tracking-wider">
                Teléfono *
              </Label>
              <Input
                {...register("phone")}
                className="bg-background/80 border-border text-white focus-visible:border-brand-teal focus-visible:ring-brand-teal/20 placeholder:text-muted-foreground/45"
                placeholder="+591 70000000"
              />
              {errors.phone && (
                <p className="text-brand-orange text-xs mt-1">
                  {errors.phone.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-slate-300 text-xs font-semibold uppercase tracking-wider">
                Email
              </Label>
              <Input
                type="email"
                {...register("email")}
                className="bg-background/80 border-border text-white focus-visible:border-brand-teal focus-visible:ring-brand-teal/20 placeholder:text-muted-foreground/45"
                placeholder="paciente@email.com"
              />
              {errors.email && (
                <p className="text-brand-orange text-xs mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label className="text-slate-300 text-xs font-semibold uppercase tracking-wider">
                Tipo de sangre
              </Label>
              <Select
                value={bloodType || ""}
                onValueChange={(v) => setValue("bloodType", v, { shouldValidate: true })}
              >
                <SelectTrigger className="bg-background/80 border-border text-white focus-visible:border-brand-teal">
                  <SelectValue placeholder="Seleccionar" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border text-foreground">
                  {bloodTypes.map((bt) => (
                    <SelectItem key={bt} value={bt}>
                      {bt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-slate-300 text-xs font-semibold uppercase tracking-wider">
              Dirección
            </Label>
            <Input
              {...register("address")}
              className="bg-background/80 border-border text-white focus-visible:border-brand-teal focus-visible:ring-brand-teal/20 placeholder:text-muted-foreground/45"
              placeholder="Av. Principal 123"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-slate-300 text-xs font-semibold uppercase tracking-wider">
              Alergias
            </Label>
            <Input
              {...register("allergies")}
              className="bg-background/80 border-border text-white focus-visible:border-brand-teal focus-visible:ring-brand-teal/20 placeholder:text-muted-foreground/45"
              placeholder="Penicilina, látex..."
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-slate-300 text-xs font-semibold uppercase tracking-wider">
              Historia clínica
            </Label>
            <Textarea
              {...register("medicalHistory")}
              className="bg-background/80 border-border text-white focus-visible:border-brand-teal focus-visible:ring-brand-teal/20 placeholder:text-muted-foreground/45 resize-none"
              rows={3}
              placeholder="Antecedentes médicos relevantes..."
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
              id={isEditing ? "save-patient-btn" : "create-patient-btn"}
            >
              {isSubmitting
                ? "Guardando..."
                : isEditing
                  ? "Guardar cambios"
                  : "Registrar paciente"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function PatientDetailDialog({
  patient,
  onClose,
}: {
  patient: Patient;
  onClose: () => void;
}) {
  return (
    <Dialog open onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="bg-card border-border/80 text-white max-w-lg">
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-linear-to-r from-brand-teal to-brand-orange" />
        <DialogHeader className="pt-4">
          <DialogTitle className="text-white text-xl flex items-center gap-2">
            <HeartPulse className="w-5 h-5 text-brand-teal" />
            {patient.firstName} {patient.lastName}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground font-mono text-xs mt-1">
            CI: {patient.ci}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="grid grid-cols-2 gap-4 text-sm bg-background/40 p-4 rounded-xl border border-border/40">
            <div className="flex items-center gap-2 text-slate-300">
              <span className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">
                Género:
              </span>
              <span className="font-semibold">
                {{ M: "Masculino", F: "Femenino", O: "Otro" }[patient.gender]}
              </span>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <span className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">
                Edad:
              </span>
              <span className="font-semibold">
                {calculateAge(patient.birthDate)} años
              </span>
            </div>
            <div className="flex items-center gap-2 text-slate-300 col-span-2">
              <Phone className="w-3.5 h-3.5 text-brand-teal" />
              <span className="font-semibold font-mono">{patient.phone}</span>
            </div>
            {patient.bloodType && (
              <div className="flex items-center gap-2 text-slate-300 col-span-2">
                <Droplets className="w-3.5 h-3.5 text-brand-orange" />
                <span className="text-xs uppercase font-bold tracking-wider text-brand-orange">
                  Grupo Sangre: {patient.bloodType}
                </span>
              </div>
            )}
            {patient.address && (
              <div className="flex items-start gap-2 text-slate-300 col-span-2 border-t border-border/20 pt-2 mt-1">
                <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                <span className="text-xs text-muted-foreground leading-relaxed">
                  {patient.address}
                </span>
              </div>
            )}
          </div>

          {patient.allergies && (
            <div className="p-3.5 rounded-xl bg-brand-orange/10 border border-brand-orange/20">
              <p className="text-[10px] font-bold text-brand-orange uppercase tracking-wider mb-1">
                ⚠ Alergias registradas
              </p>
              <p className="text-sm text-slate-300 font-semibold">
                {patient.allergies}
              </p>
            </div>
          )}

          {patient.medicalHistory && (
            <div className="p-4 rounded-xl bg-background/50 border border-border/50">
              <p className="text-[10px] font-bold text-brand-teal uppercase tracking-wider mb-1.5">
                Historia clínica / Observación
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {patient.medicalHistory}
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function PatientsPage() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | undefined>();
  const [viewingPatient, setViewingPatient] = useState<Patient | undefined>();
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const { data: patients, isLoading } = usePatients(
    debouncedSearch || undefined,
  );
  const deleteMut = useDeletePatient();

  const handleSearch = (val: string) => {
    setSearch(val);
    const timeout = setTimeout(() => setDebouncedSearch(val), 400);
    return () => clearTimeout(timeout);
  };

  const handleDelete = async () => {
    if (deletingId) {
      await deleteMut.mutateAsync(deletingId);
      setDeletingId(null);
    }
  };

  const genderLabel: Record<string, string> = {
    M: "Masc.",
    F: "Fem.",
    O: "Otro",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Pacientes
          </h1>
          <p className="text-muted-foreground text-xs font-semibold uppercase tracking-wider mt-0.5">
            {patients?.length ?? 0} paciente{patients?.length !== 1 ? "s" : ""}{" "}
            registrado{patients?.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingPatient(undefined);
            setFormOpen(true);
          }}
          className="bg-brand-teal hover:bg-brand-teal/85 active:bg-brand-teal-dark text-white font-semibold shadow-md shadow-brand-teal/10 gap-2 cursor-pointer"
          id="add-patient-btn"
        >
          <UserPlus className="w-4 h-4" />
          <span className="hidden sm:inline">Nuevo paciente</span>
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          id="patient-search"
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Buscar por nombre o CI..."
          className="pl-9 bg-card/65 border-border text-white placeholder:text-muted-foreground/50 focus-visible:border-brand-teal focus-visible:ring-brand-teal/20"
          aria-label="Buscar pacientes"
        />
      </div>

      {/* Table Card */}
      <Card className="card-premium bg-card/50 border-border/80">
        <CardHeader className="pb-3">
          <CardTitle className="text-white text-base">
            Listado de pacientes
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-12 bg-muted/30 rounded" />
              ))}
            </div>
          ) : !patients?.length ? (
            <div className="text-center py-16 text-muted-foreground/45">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p className="text-sm">
                {debouncedSearch
                  ? "No se encontraron pacientes con esa búsqueda"
                  : "No hay pacientes registrados"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table
                className="w-full text-sm"
                role="table"
                aria-label="Tabla de pacientes"
              >
                <thead>
                  <tr className="text-muted-foreground border-b border-border/40 text-left">
                    <th className="pb-3 font-semibold text-xs uppercase tracking-wider">
                      Paciente
                    </th>
                    <th className="pb-3 font-semibold text-xs uppercase tracking-wider hidden md:table-cell">
                      CI
                    </th>
                    <th className="pb-3 font-semibold text-xs uppercase tracking-wider hidden lg:table-cell">
                      Género
                    </th>
                    <th className="pb-3 font-semibold text-xs uppercase tracking-wider hidden lg:table-cell">
                      Edad
                    </th>
                    <th className="pb-3 font-semibold text-xs uppercase tracking-wider hidden md:table-cell">
                      Teléfono
                    </th>
                    <th className="pb-3 font-semibold text-xs uppercase tracking-wider text-right">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/20">
                  {patients.map((p) => (
                    <tr
                      key={p.id}
                      className="text-slate-300 hover:bg-secondary/20 transition-colors"
                    >
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <p className="text-white font-semibold">
                            {p.firstName} {p.lastName}
                          </p>
                          {p.bloodType && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded uppercase bg-brand-orange/15 text-brand-orange border border-brand-orange/20">
                              🩸 {p.bloodType}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 text-muted-foreground font-mono hidden md:table-cell">
                        {p.ci}
                      </td>
                      <td className="py-3 hidden lg:table-cell">
                        <Badge
                          variant="outline"
                          className="text-[10px] border-border bg-background/40 text-slate-300 font-bold uppercase"
                        >
                          {genderLabel[p.gender] || p.gender}
                        </Badge>
                      </td>
                      <td className="py-3 text-muted-foreground hidden lg:table-cell">
                        {calculateAge(p.birthDate)} años
                      </td>
                      <td className="py-3 text-muted-foreground font-mono hidden md:table-cell">
                        {p.phone}
                      </td>
                      <td className="py-3">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setViewingPatient(p)}
                            className="w-8 h-8 text-brand-teal hover:text-white hover:bg-brand-teal/20 cursor-pointer"
                            aria-label={`Ver detalles de ${p.firstName} ${p.lastName}`}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setEditingPatient(p);
                              setFormOpen(true);
                            }}
                            className="w-8 h-8 text-brand-teal hover:text-white hover:bg-brand-teal/20 cursor-pointer"
                            aria-label={`Editar ${p.firstName} ${p.lastName}`}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeletingId(p.id)}
                            className="w-8 h-8 text-brand-orange hover:text-white hover:bg-brand-orange/20 cursor-pointer"
                            aria-label={`Eliminar ${p.firstName} ${p.lastName}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      <PatientFormDialog
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditingPatient(undefined);
        }}
        patient={editingPatient}
      />

      {viewingPatient && (
        <PatientDetailDialog
          patient={viewingPatient}
          onClose={() => setViewingPatient(undefined)}
        />
      )}

      <AlertDialog
        open={!!deletingId}
        onOpenChange={(v) => !v && setDeletingId(null)}
      >
        <AlertDialogContent className="bg-card border-border/80">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">
              ¿Eliminar paciente?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground text-sm">
              Esta acción realiza una eliminación lógica. El paciente no
              aparecerá en los listados del sistema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-secondary border-border text-white hover:bg-secondary/80 cursor-pointer">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-brand-orange hover:bg-brand-orange/85 text-white cursor-pointer"
              id="confirm-delete-patient"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
