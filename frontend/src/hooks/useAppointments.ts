import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { appointmentsApi, type CreateAppointmentData } from '@/lib/appointments.api'
import { toast } from 'sonner'

export const appointmentKeys = {
  all: ['appointments'] as const,
  list: (params?: object) => [...appointmentKeys.all, 'list', params] as const,
  detail: (id: number) => [...appointmentKeys.all, 'detail', id] as const,
  stats: () => [...appointmentKeys.all, 'stats'] as const,
}

export function useAppointments(params?: {
  patientId?: number
  doctorId?: number
  status?: string
  from?: string
  to?: string
}) {
  return useQuery({
    queryKey: appointmentKeys.list(params),
    queryFn: () => appointmentsApi.getAll(params),
  })
}

export function useAppointmentStats() {
  return useQuery({
    queryKey: appointmentKeys.stats(),
    queryFn: () => appointmentsApi.getStats(),
  })
}

export function useCreateAppointment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateAppointmentData) => appointmentsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: appointmentKeys.all })
      toast.success('Cita registrada exitosamente')
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      toast.error(err.response?.data?.message || 'Error al registrar cita')
    },
  })
}

export function useUpdateAppointment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<CreateAppointmentData> }) =>
      appointmentsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: appointmentKeys.all })
      toast.success('Cita actualizada exitosamente')
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      toast.error(err.response?.data?.message || 'Error al actualizar cita')
    },
  })
}

export function useDeleteAppointment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => appointmentsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: appointmentKeys.all })
      toast.success('Cita eliminada correctamente')
    },
    onError: () => {
      toast.error('Error al eliminar cita')
    },
  })
}
