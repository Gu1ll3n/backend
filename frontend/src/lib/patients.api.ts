import api from '@/lib/api'

export interface Patient {
  id: number
  firstName: string
  lastName: string
  ci: string
  birthDate: string
  gender: string
  phone: string
  email?: string
  address?: string
  bloodType?: string
  allergies?: string
  medicalHistory?: string
  createdAt: string
}

export interface CreatePatientData {
  firstName: string
  lastName: string
  ci: string
  birthDate: string
  gender: string
  phone: string
  email?: string
  address?: string
  bloodType?: string
  allergies?: string
  medicalHistory?: string
}

export const patientsApi = {
  getAll: (search?: string) =>
    api.get<Patient[]>('/patients', { params: search ? { search } : {} }).then((r) => r.data),
  getOne: (id: number) => api.get<Patient>(`/patients/${id}`).then((r) => r.data),
  create: (data: CreatePatientData) => api.post<Patient>('/patients', data).then((r) => r.data),
  update: (id: number, data: Partial<CreatePatientData>) =>
    api.put<Patient>(`/patients/${id}`, data).then((r) => r.data),
  delete: (id: number) => api.delete(`/patients/${id}`).then((r) => r.data),
}
