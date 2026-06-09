import api from '@/lib/api'

export type AppointmentStatus = 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW'

export interface Appointment {
  id: number
  patientId: number
  doctorId: number
  scheduledAt: string
  reason: string
  status: AppointmentStatus
  notes?: string
  diagnosis?: string
  prescription?: string
  patient: { id: number; firstName: string; lastName: string; ci: string }
  doctor: { id: number; name: string }
  createdAt: string
}

export interface DashboardStats {
  total: number
  todayCount: number
  completed: number
  cancelled: number
  totalPatients: number
}

export interface CreateAppointmentData {
  patientId: number
  doctorId: number
  scheduledAt: string
  reason: string
  status?: AppointmentStatus
  notes?: string
  diagnosis?: string
  prescription?: string
}

export const appointmentsApi = {
  getAll: (params?: {
    patientId?: number
    doctorId?: number
    status?: string
    from?: string
    to?: string
  }) => api.get<Appointment[]>('/appointments', { params }).then((r) => r.data),
  getOne: (id: number) => api.get<Appointment>(`/appointments/${id}`).then((r) => r.data),
  create: (data: CreateAppointmentData) =>
    api.post<Appointment>('/appointments', data).then((r) => r.data),
  update: (id: number, data: Partial<CreateAppointmentData>) =>
    api.put<Appointment>(`/appointments/${id}`, data).then((r) => r.data),
  delete: (id: number) => api.delete(`/appointments/${id}`).then((r) => r.data),
  getStats: () => api.get<DashboardStats>('/appointments/stats').then((r) => r.data),
}
