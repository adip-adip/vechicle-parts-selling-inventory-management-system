import { useQuery } from '@tanstack/react-query'
import { customerPortalApi } from '../../api/customerPortal'
import DataTable from '../../components/ui/DataTable'
import { formatCurrency, formatDate } from '../../utils/format'
import { Calendar, ClipboardList, History, DollarSign } from 'lucide-react'

export default function CustomerDashboard() {
  const { data: history } = useQuery({ queryKey: ['customer-history'], queryFn: customerPortalApi.getHistory })
  const { data: appointments } = useQuery({ queryKey: ['customer-appointments'], queryFn: customerPortalApi.getAppointments })
  const { data: partRequests } = useQuery({ queryKey: ['customer-part-requests'], queryFn: customerPortalApi.getPartRequests })
  const { data: loyalty } = useQuery({
    queryKey: ['loyalty-check', 100],
    queryFn: () => customerPortalApi.checkLoyalty(100),
  })

  const cards = [
    { label: 'Total Purchases', value: history?.totalSales || 0, icon: History, color: 'text-blue-600', bg: 'bg-blue-100' },
    { label: 'Total Spent', value: formatCurrency(history?.totalSpent || 0), icon: DollarSign, color: 'text-green-600', bg: 'bg-green-100' },
    { label: 'Appointments', value: appointments?.length || 0, icon: Calendar, color: 'text-purple-600', bg: 'bg-purple-100' },
    { label: 'Part Requests', value: partRequests?.length || 0, icon: ClipboardList, color: 'text-orange-600', bg: 'bg-orange-100' },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Customer Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map(card => (
          <div key={card.label} className="bg-white rounded-xl shadow-sm p-6 flex items-center gap-4">
            <div className={`${card.bg} p-3 rounded-lg`}>
              <card.icon className={card.color} size={24} />
            </div>
            <div>
              <p className="text-sm text-slate-500">{card.label}</p>
              <p className="text-2xl font-bold text-slate-800">{card.value}</p>
            </div>
          </div>
        ))}
      </div>

      {loyalty && (
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Loyalty Discount Preview</h2>
          <p className="text-sm text-slate-600 mb-2">On a $100 purchase:</p>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-slate-500">Original</p>
              <p className="font-semibold">{formatCurrency(loyalty.originalAmount)}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">You Save</p>
              <p className="font-semibold text-green-600">{formatCurrency(loyalty.youSave)}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">After Discount</p>
              <p className="font-semibold">{formatCurrency(loyalty.discountedAmount)}</p>
            </div>
          </div>
        </div>
      )}

      {history && history.sales && history.sales.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Purchase History</h2>
          <DataTable
            data={history.sales}
            keyExtractor={s => s.saleId}
            columns={[
              { header: 'Invoice #', accessor: s => s.invoiceNumber || `#${s.saleId}`, sortable: true },
              { header: 'Amount', accessor: s => formatCurrency(s.totalAmount), sortable: true },
              { header: 'Date', accessor: s => formatDate(s.saleDate), sortable: true },
              { header: 'Status', accessor: s => (
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  s.paymentStatus === 'Paid' ? 'bg-green-100 text-green-700' :
                  s.paymentStatus === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-700'
                }`}>{s.paymentStatus}</span>
              )},
              { header: 'Items', accessor: 'itemCount' },
              { header: 'Parts', accessor: s => s.partsPurchased.join(', ') },
            ]}
          />
        </div>
      )}

      {appointments && appointments.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Upcoming Appointments</h2>
          <ul className="space-y-2">
            {appointments.filter(a => a.status === 'Pending').slice(0, 5).map(a => (
              <li key={a.id} className="flex justify-between text-sm">
                <span className="text-slate-700">{a.serviceType}</span>
                <span className="font-medium">{formatDate(a.appointmentDate)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
