import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { customerPortalApi } from '../../api/customerPortal'
import DataTable from '../../components/ui/DataTable'
import toast from 'react-hot-toast'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { formatDate } from '../../utils/format'
import { Plus } from 'lucide-react'

const schema = z.object({
  serviceType: z.string().min(1, 'Service type is required'),
  appointmentDate: z.string().min(1, 'Date is required'),
  notes: z.string().optional(),
})

type FormData = z.infer<typeof schema>

export default function Appointments() {
  const queryClient = useQueryClient()
  const [showForm, setShowForm] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['customer-appointments'],
    queryFn: customerPortalApi.getAppointments,
  })

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const mutation = useMutation({
    mutationFn: customerPortalApi.createAppointment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer-appointments'] })
      toast.success('Appointment created')
      setShowForm(false)
      reset()
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Failed to create'),
  })

  const onSubmit = (formData: FormData) => {
    mutation.mutate({
      serviceType: formData.serviceType,
      appointmentDate: new Date(formData.appointmentDate).toISOString(),
      notes: formData.notes,
    })
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Appointments</h1>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
          <Plus size={16} /> Book Appointment
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6 max-w-lg">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">New Appointment</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Service Type</label>
              <input {...register('serviceType')} placeholder="e.g. Oil Change, Brake Repair" className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              {errors.serviceType && <p className="text-red-500 text-xs">{errors.serviceType.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Date & Time</label>
              <input type="datetime-local" {...register('appointmentDate')} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              {errors.appointmentDate && <p className="text-red-500 text-xs">{errors.appointmentDate.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
              <textarea {...register('notes')} rows={3} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="flex gap-2">
              <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">Book</button>
              <button type="button" onClick={() => { setShowForm(false); reset() }} className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <DataTable
        isLoading={isLoading}
        data={data || []}
        keyExtractor={a => a.id}
        columns={[
          { header: 'Service', accessor: 'serviceType', sortable: true },
          { header: 'Date', accessor: a => formatDate(a.appointmentDate), sortable: true },
          { header: 'Status', accessor: a => (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              a.status === 'Confirmed' ? 'bg-green-100 text-green-700' :
              a.status === 'Completed' ? 'bg-blue-100 text-blue-700' :
              'bg-yellow-100 text-yellow-700'
            }`}>{a.status}</span>
          )},
          { header: 'Vehicle', accessor: 'vehicleRegistration' },
          { header: 'Notes', accessor: 'notes' },
        ]}
      />
    </div>
  )
}
