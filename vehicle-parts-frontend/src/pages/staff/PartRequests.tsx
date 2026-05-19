import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { staffApi } from '../../api/sales'
import DataTable from '../../components/ui/DataTable'
import toast from 'react-hot-toast'
import { formatDate } from '../../utils/format'
import { Link } from 'react-router-dom'
import { Eye } from 'lucide-react'

const statusColors: Record<string, string> = {
  Pending: 'bg-yellow-100 text-yellow-700',
  Approved: 'bg-green-100 text-green-700',
  Fulfilled: 'bg-blue-100 text-blue-700',
  Rejected: 'bg-red-100 text-red-700',
}

export default function StaffPartRequests() {
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['staff-part-requests'],
    queryFn: staffApi.getAllPartRequests,
  })

  const statusMutation = useMutation({
    mutationFn: ({ requestId, status }: { requestId: number; status: string }) =>
      staffApi.updatePartRequestStatus(requestId, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff-part-requests'] })
      toast.success('Part request status updated')
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Failed to update'),
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Part Requests</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <DataTable
          isLoading={isLoading}
          data={data || []}
          keyExtractor={r => r.id}
          columns={[
            { header: 'Customer', accessor: r => (
              <Link to={`/staff/customers/${r.customerId}`} className="text-blue-600 hover:underline font-medium">
                {r.customerName}
              </Link>
            ), sortable: true },
            { header: 'Email', accessor: 'customerEmail' },
            { header: 'Part Name', accessor: 'partName', sortable: true },
            { header: 'Description', accessor: 'description' },
            { header: 'Status', accessor: r => (
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[r.status] || 'bg-slate-100 text-slate-700'}`}>
                {r.status}
              </span>
            )},
            { header: 'Requested', accessor: r => formatDate(r.requestedAt) },
          ]}
          actions={r => (
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
                  Fulfill
                </button>
              )}
              <Link
                to={`/staff/customers/${r.customerId}`}
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