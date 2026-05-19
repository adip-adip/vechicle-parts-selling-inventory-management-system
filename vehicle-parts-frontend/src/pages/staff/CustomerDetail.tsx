import { useParams, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { staffCustomersApi, staffApi } from '../../api/sales'
import DataTable from '../../components/ui/DataTable'
import { formatCurrency, formatDate } from '../../utils/format'
import toast from 'react-hot-toast'
import { ArrowLeft, Car, ShoppingBag, User, ClipboardList, Calendar } from 'lucide-react'

export default function CustomerDetail() {
  const { id } = useParams<{ id: string }>()
  const queryClient = useQueryClient()

  const { data: details, isLoading: detailsLoading } = useQuery({
    queryKey: ['customer-detail', id],
    queryFn: () => staffCustomersApi.getDetails(Number(id)),
    enabled: !!id,
  })

  const { data: history, isLoading: historyLoading } = useQuery({
    queryKey: ['customer-history', id],
    queryFn: () => staffCustomersApi.getHistory(Number(id)),
    enabled: !!id,
  })

  const { data: vehicles, isLoading: vehiclesLoading } = useQuery({
    queryKey: ['customer-vehicles', id],
    queryFn: () => staffCustomersApi.getVehicles(Number(id)),
    enabled: !!id,
  })

  const { data: partRequests, isLoading: partRequestsLoading } = useQuery({
    queryKey: ['customer-part-requests', id],
    queryFn: () => staffApi.getPartRequests(Number(id)),
    enabled: !!id,
  })

  const { data: appointments, isLoading: appointmentsLoading } = useQuery({
    queryKey: ['customer-appointments', id],
    queryFn: () => staffApi.getAppointments(Number(id)),
    enabled: !!id,
  })

  const statusMutation = useMutation({
    mutationFn: ({ requestId, status }: { requestId: number; status: string }) =>
      staffApi.updatePartRequestStatus(requestId, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer-part-requests', id] })
      toast.success('Part request status updated')
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Failed to update'),
  })

  const appointmentStatusMutation = useMutation({
    mutationFn: ({ appointmentId, status }: { appointmentId: number; status: string }) =>
      staffApi.updateAppointmentStatus(appointmentId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer-appointments', id] })
      toast.success('Appointment status updated')
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Failed to update'),
  })

  if (detailsLoading) return <div className="text-center py-8 text-slate-500">Loading...</div>
  if (!details) return <div className="text-center py-8 text-slate-500">Customer not found</div>

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Link to="/staff/customers" className="text-slate-500 hover:text-slate-700">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl font-bold text-slate-800">Customer Details</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-blue-100 p-2 rounded-lg"><User className="text-blue-600" size={20} /></div>
          <h2 className="text-lg font-semibold text-slate-800">{details.firstName} {details.lastName}</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-slate-500">Email:</span>
            <p className="font-medium">{details.email}</p>
          </div>
          <div>
            <span className="text-slate-500">Phone:</span>
            <p className="font-medium">{details.phone}</p>
          </div>
          {details.address && (
            <div>
              <span className="text-slate-500">Address:</span>
              <p className="font-medium">{details.address}</p>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-green-100 p-2 rounded-lg"><Car className="text-green-600" size={20} /></div>
          <h2 className="text-lg font-semibold text-slate-800">Vehicles</h2>
        </div>
        <DataTable
          isLoading={vehiclesLoading}
          data={vehicles || []}
          keyExtractor={(v: any) => v.id}
          columns={[
            { header: 'Registration #', accessor: 'registrationNumber', sortable: true },
            { header: 'Make', accessor: 'make', sortable: true },
            { header: 'Model', accessor: 'model', sortable: true },
            { header: 'Year', accessor: 'year', sortable: true },
            { header: 'VIN', accessor: 'vin' },
          ]}
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-amber-100 p-2 rounded-lg"><ClipboardList className="text-amber-600" size={20} /></div>
          <h2 className="text-lg font-semibold text-slate-800">Part Requests</h2>
        </div>
        <DataTable
          isLoading={partRequestsLoading}
          data={partRequests || []}
          keyExtractor={(r: any) => r.id}
          columns={[
            { header: 'Part Name', accessor: 'partName', sortable: true },
            { header: 'Description', accessor: 'description' },
            { header: 'Status', accessor: (r: any) => (
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                r.status === 'Approved' ? 'bg-green-100 text-green-700' :
                r.status === 'Fulfilled' ? 'bg-blue-100 text-blue-700' :
                r.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                'bg-yellow-100 text-yellow-700'
              }`}>{r.status}</span>
            )},
            { header: 'Requested', accessor: (r: any) => formatDate(r.requestedAt) },
          ]}
          actions={(r: any) => (
            <div className="flex items-center gap-2">
              {r.status === 'Pending' && (
                <>
                  <button
                    onClick={() => statusMutation.mutate({ requestId: r.id, status: 'Approved' })}
                    className="text-xs font-medium text-green-600 hover:text-green-800"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => statusMutation.mutate({ requestId: r.id, status: 'Rejected' })}
                    className="text-xs font-medium text-red-600 hover:text-red-800"
                  >
                    Reject
                  </button>
                </>
              )}
              {r.status === 'Approved' && (
                <button
                  onClick={() => statusMutation.mutate({ requestId: r.id, status: 'Fulfilled' })}
                  className="text-xs font-medium text-blue-600 hover:text-blue-800"
                >
                  Mark Fulfilled
                </button>
              )}
            </div>
          )}
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-indigo-100 p-2 rounded-lg"><Calendar className="text-indigo-600" size={20} /></div>
          <h2 className="text-lg font-semibold text-slate-800">Appointments</h2>
        </div>
        <DataTable
          isLoading={appointmentsLoading}
          data={appointments || []}
          keyExtractor={(a: any) => a.id}
          columns={[
            { header: 'Service', accessor: 'serviceType', sortable: true },
            { header: 'Date', accessor: (a: any) => formatDate(a.appointmentDate), sortable: true },
            { header: 'Status', accessor: (a: any) => (
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                a.status === 'Confirmed' ? 'bg-green-100 text-green-700' :
                a.status === 'Completed' ? 'bg-blue-100 text-blue-700' :
                'bg-yellow-100 text-yellow-700'
              }`}>{a.status}</span>
            )},
            { header: 'Vehicle', accessor: (a: any) => a.vehicleRegistration || '-' },
            { header: 'Notes', accessor: 'notes' },
          ]}
          actions={(a: any) => (
            <div className="flex items-center gap-2">
              {a.status === 'Pending' && (
                <>
                  <button onClick={() => appointmentStatusMutation.mutate({ appointmentId: a.id, status: 'Confirmed' })} className="text-xs font-medium text-green-600 hover:text-green-800">Confirm</button>
                  <button onClick={() => appointmentStatusMutation.mutate({ appointmentId: a.id, status: 'Completed' })} className="text-xs font-medium text-blue-600 hover:text-blue-800">Complete</button>
                </>
              )}
              {a.status === 'Confirmed' && (
                <button onClick={() => appointmentStatusMutation.mutate({ appointmentId: a.id, status: 'Completed' })} className="text-xs font-medium text-blue-600 hover:text-blue-800">Mark Completed</button>
              )}
            </div>
          )}
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-purple-100 p-2 rounded-lg"><ShoppingBag className="text-purple-600" size={20} /></div>
          <h2 className="text-lg font-semibold text-slate-800">Purchase History</h2>
        </div>
        {history && history.sales && history.sales.length > 0 && (
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="bg-slate-50 rounded-lg p-3 text-center">
              <p className="text-xs text-slate-500">Total Sales</p>
              <p className="text-lg font-bold text-slate-800">{history.totalSales}</p>
            </div>
            <div className="bg-slate-50 rounded-lg p-3 text-center">
              <p className="text-xs text-slate-500">Total Spent</p>
              <p className="text-lg font-bold text-slate-800">{formatCurrency(history.totalSpent)}</p>
            </div>
            <div className="bg-slate-50 rounded-lg p-3 text-center">
              <p className="text-xs text-slate-500">Avg per Sale</p>
              <p className="text-lg font-bold text-slate-800">
                {history.totalSales > 0 ? formatCurrency(history.totalSpent / history.totalSales) : '-'}
              </p>
            </div>
          </div>
        )}
        <DataTable
          isLoading={historyLoading}
          data={history?.sales || []}
          keyExtractor={(s: any) => s.saleId}
          columns={[
            { header: 'Invoice #', accessor: (s: any) => s.invoiceNumber || `#${s.saleId}`, sortable: true },
            { header: 'Amount', accessor: (s: any) => formatCurrency(s.totalAmount), sortable: true },
            { header: 'Date', accessor: (s: any) => formatDate(s.saleDate), sortable: true },
            { header: 'Status', accessor: (s: any) => (
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                s.paymentStatus === 'Paid' ? 'bg-green-100 text-green-700' :
                s.paymentStatus === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                'bg-red-100 text-red-700'
              }`}>{s.paymentStatus}</span>
            )},
            { header: 'Items', accessor: 'itemCount' },
            { header: 'Parts', accessor: (s: any) => s.partsPurchased.join(', ') },
          ]}
        />
      </div>
    </div>
  )
}
