import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { staffApi } from '../../api/sales'
import DataTable from '../../components/ui/DataTable'
import toast from 'react-hot-toast'
import { formatDate } from '../../utils/format'
import { Link } from 'react-router-dom'
import { Eye } from 'lucide-react'

const statusColors: Record<string, string> = {
  Pending: 'bg-yellow-100 text-yellow-700',
  Confirmed: 'bg-green-100 text-green-700',
  Completed: 'bg-blue-100 text-blue-700',
}

export default function StaffAppointments() {
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['staff-appointments'],
    queryFn: staffApi.getAllAppointments,
  })

  const statusMutation = useMutation({
    mutationFn: ({ appointmentId, status }: { appointmentId: number; status: string }) =>
      staffApi.updateAppointmentStatus(appointmentId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff-appointments'] })
      toast.success('Appointment status updated')
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Failed to update'),
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Appointments</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <DataTable
          isLoading={isLoading}
          data={data || []}
          keyExtractor={a => a.id}
          columns={[
            { header: 'Customer', accessor: a => (
              <Link to={`/staff/customers/${a.customerId}`} className="text-blue-600 hover:underline font-medium">
                {a.customerName}
              </Link>
            ), sortable: true },
            { header: 'Email', accessor: 'customerEmail' },
            { header: 'Service', accessor: 'serviceType', sortable: true },
            { header: 'Date', accessor: a => formatDate(a.appointmentDate), sortable: true },
            { header: 'Vehicle', accessor: a => a.vehicleRegistration || '-' },
            { header: 'Notes', accessor: 'notes' },
            { header: 'Status', accessor: a => (
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[a.status] || 'bg-slate-100 text-slate-700'}`}>
                {a.status}
              </span>
            )},
          ]}
          actions={a => (
            <div className="flex items-center gap-2">
              {a.status === 'Pending' && (
                <>
                  <button
                    onClick={() => statusMutation.mutate({ appointmentId: a.id, status: 'Confirmed' })}
                    className="text-xs font-medium text-green-600 hover:text-green-800"
                  >
                    Confirm
                  </button>
                  <button
                    onClick={() => statusMutation.mutate({ appointmentId: a.id, status: 'Completed' })}
                    className="text-xs font-medium text-blue-600 hover:text-blue-800"
                  >
                    Complete
                  </button>
                </>
              )}
              {a.status === 'Confirmed' && (
                <button
                  onClick={() => statusMutation.mutate({ appointmentId: a.id, status: 'Completed' })}
                  className="text-xs font-medium text-blue-600 hover:text-blue-800"
                >
                  Mark Completed
                </button>
              )}
              <Link
                to={`/staff/customers/${a.customerId}`}
                className="text-slate-400 hover:text-slate-600"
                title="View Customer"
              >
                <Eye size={16} />
              </Link>
            </div>
          )}
        />
      </div>
    </div>
  )
}