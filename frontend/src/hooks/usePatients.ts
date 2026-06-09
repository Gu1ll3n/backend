import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { patientsApi, type CreatePatientData } from '@/lib/patients.api'
import { toast } from 'sonner'

export const patientKeys = {
  all: ['patients'] as const,
  list: (search?: string) => [...patientKeys.all, 'list', search] as const,
  detail: (id: number) => [...patientKeys.all, 'detail', id] as const,
}

export function usePatients(search?: string) {
  return useQuery({
    queryKey: patientKeys.list(search),
    queryFn: () => patientsApi.getAll(search),
  })
}

export function usePatient(id: number) {
  return useQuery({
    queryKey: patientKeys.detail(id),
    queryFn: () => patientsApi.getOne(id),
    enabled: !!id,
  })
}

export function useCreatePatient() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreatePatientData) => patientsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: patientKeys.all })
      toast.success('Paciente registrado exitosamente')
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      toast.error(err.response?.data?.message || 'Error al registrar paciente')
    },
  })
}

export function useUpdatePatient() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<CreatePatientData> }) =>
      patientsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: patientKeys.all })
      toast.success('Paciente actualizado exitosamente')
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      toast.error(err.response?.data?.message || 'Error al actualizar paciente')
    },
  })
}

export function useDeletePatient() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => patientsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: patientKeys.all })
      toast.success('Paciente eliminado correctamente')
    },
    onError: () => {
      toast.error('Error al eliminar paciente')
    },
  })
}
