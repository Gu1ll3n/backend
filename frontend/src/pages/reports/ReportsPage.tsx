import { useState } from 'react'
import { FileText, Download, CalendarDays, Users, Loader2 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import api from '@/lib/api'

async function downloadPdf(url: string, filename: string) {
  const response = await api.get(url, { responseType: 'blob' })
  const blob = new Blob([response.data], { type: 'application/pdf' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(link.href)
}

export default function ReportsPage() {
  const [apptFrom, setApptFrom] = useState('')
  const [apptTo, setApptTo] = useState('')
  const [loadingAppt, setLoadingAppt] = useState(false)
  const [loadingPatients, setLoadingPatients] = useState(false)

  const handleAppointmentsReport = async () => {
    setLoadingAppt(true)
    try {
      const params = new URLSearchParams()
      if (apptFrom) params.append('from', new Date(apptFrom).toISOString())
      if (apptTo) params.append('to', new Date(apptTo).toISOString())
      await downloadPdf(
        `/reports/appointments?${params.toString()}`,
        `reporte-citas-${Date.now()}.pdf`,
      )
      toast.success('Reporte descargado correctamente')
    } catch {
      toast.error('Error al generar el reporte')
    } finally {
      setLoadingAppt(false)
    }
  }

  const handlePatientsReport = async () => {
    setLoadingPatients(true)
    try {
      await downloadPdf(`/reports/patients`, `reporte-pacientes-${Date.now()}.pdf`)
      toast.success('Reporte descargado correctamente')
    } catch {
      toast.error('Error al generar el reporte')
    } finally {
      setLoadingPatients(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Reportes</h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          Generación y exportación de reportes clínicos en formato PDF.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Appointments report */}
        <Card className="card-premium">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-brand-teal/10 border border-brand-teal/20 flex items-center justify-center">
                <CalendarDays className="w-5 h-5 text-brand-teal" />
              </div>
              <div>
                <CardTitle className="text-white text-base font-semibold">Reporte de Citas</CardTitle>
                <CardDescription className="text-muted-foreground text-sm">
                  Listado de citas médicas por período de tiempo
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-slate-300 text-xs font-medium uppercase tracking-wider">Desde</Label>
                <Input
                  id="report-appt-from"
                  type="date"
                  value={apptFrom}
                  onChange={(e) => setApptFrom(e.target.value)}
                  className="bg-background/80 border-border text-white text-sm focus-visible:ring-1 focus-visible:ring-brand-teal focus-visible:border-brand-teal"
                  aria-label="Fecha inicio del reporte de citas"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-slate-300 text-xs font-medium uppercase tracking-wider">Hasta</Label>
                <Input
                  id="report-appt-to"
                  type="date"
                  value={apptTo}
                  onChange={(e) => setApptTo(e.target.value)}
                  className="bg-background/80 border-border text-white text-sm focus-visible:ring-1 focus-visible:ring-brand-teal focus-visible:border-brand-teal"
                  aria-label="Fecha fin del reporte de citas"
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground/80 italic">
              * Si no selecciona rango de fechas, se incluirá el historial completo de citas.
            </p>
            <Button
              id="download-appointments-report"
              onClick={handleAppointmentsReport}
              disabled={loadingAppt}
              className="w-full bg-brand-teal hover:bg-brand-teal/90 text-white font-medium shadow-md shadow-brand-teal/10 hover:shadow-brand-teal/20 transition-all duration-200 gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loadingAppt ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generando PDF...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Descargar PDF
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Patients report */}
        <Card className="card-premium">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-brand-orange/10 border border-brand-orange/20 flex items-center justify-center">
                <Users className="w-5 h-5 text-brand-orange" />
              </div>
              <div>
                <CardTitle className="text-white text-base font-semibold">Reporte de Pacientes</CardTitle>
                <CardDescription className="text-muted-foreground text-sm">
                  Listado completo de pacientes registrados en el sistema
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="p-4 rounded-lg bg-background/50 border border-border/80">
              <div className="flex items-center gap-3 text-slate-300 text-sm leading-relaxed">
                <FileText className="w-5 h-5 text-brand-orange shrink-0" />
                <span>Contiene: nombre completo, RUT/CI, fecha de nacimiento, teléfono, correo electrónico y cantidad total de citas programadas.</span>
              </div>
            </div>
            <div className="h-[60px]" />{/* spacer to match height */}
            <Button
              id="download-patients-report"
              onClick={handlePatientsReport}
              disabled={loadingPatients}
              className="w-full bg-brand-orange hover:bg-brand-orange/90 text-white font-medium shadow-md shadow-brand-orange/10 hover:shadow-brand-orange/20 transition-all duration-200 gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loadingPatients ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generando PDF...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Descargar PDF
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
