import { useQuery, useMutation } from '@tanstack/react-query'
import { salesApi } from '../../api/sales'
import DataTable from '../../components/ui/DataTable'
import toast from 'react-hot-toast'
import { formatCurrency, formatDate } from '../../utils/format'
import { Link } from 'react-router-dom'
import { Plus, Mail } from 'lucide-react'

export default function Sales() {
  const { data, isLoading } = useQuery({ queryKey: ['staff-sales'], queryFn: salesApi.getAll })

  const emailMutation = useMutation({
    mutationFn: salesApi.emailInvoice,
    onSuccess: () => toast.success('Invoice emailed'),
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Failed to email'),
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Sales</h1>
        <Link to="/staff/sales/new" className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
          <Plus size={16} /> New Sale
        </Link>
      </div>

      <DataTable
        isLoading={isLoading}
        data={data || []}
        keyExtractor={s => s.id}
        columns={[
          { header: 'Invoice #', accessor: 'invoiceNumber', sortable: true },
          { header: 'Customer', accessor: s => s.customer ? `${s.customer.firstName} ${s.customer.lastName}` : '-' },
          { header: 'Amount', accessor: s => formatCurrency(s.totalAmount), sortable: true },
          { header: 'Date', accessor: s => formatDate(s.saleDate), sortable: true },
          { header: 'Status', accessor: s => (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              s.paymentStatus === 'Paid' ? 'bg-green-100 text-green-700' :
              s.paymentStatus === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
              'bg-red-100 text-red-700'
            }`}>{s.paymentStatus}</span>
          )},
        ]}
        actions={sale => (
          <button
            onClick={() => emailMutation.mutate(sale.id)}
            className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-800"
          >
            <Mail size={14} /> Email Invoice
          </button>
        )}
      />
    </div>
  )
}
