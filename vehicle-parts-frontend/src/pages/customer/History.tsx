import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { customerPortalApi } from '../../api/customerPortal'
import DataTable from '../../components/ui/DataTable'
import { formatCurrency, formatDate } from '../../utils/format'
import { History, DollarSign, ShoppingBag, Calendar } from 'lucide-react'

export default function CustomerHistory() {
  const [previewAmount, setPreviewAmount] = useState('')

  const { data: history, isLoading } = useQuery({
    queryKey: ['customer-history'],
    queryFn: customerPortalApi.getHistory,
  })

  const baseAmount = history?.totalSpent || 0
  const checkAmount = previewAmount ? Number(previewAmount) : baseAmount

  const { data: loyalty } = useQuery({
    queryKey: ['loyalty-check', checkAmount],
    queryFn: () => customerPortalApi.checkLoyalty(checkAmount),
    enabled: checkAmount > 0,
  })

  const { data: appointments } = useQuery({
    queryKey: ['customer-appointments'],
    queryFn: customerPortalApi.getAppointments,
  })

  const completedAppointments = Array.isArray(appointments)
    ? appointments.filter((a: any) => a.status === 'Completed')
    : []

  const cards = [
    { label: 'Total Purchases', value: history?.totalSales || 0, icon: ShoppingBag, color: 'text-blue-600', bg: 'bg-blue-100' },
    { label: 'Total Spent', value: formatCurrency(baseAmount), icon: DollarSign, color: 'text-green-600', bg: 'bg-green-100' },
    { label: 'Completed Services', value: completedAppointments.length, icon: Calendar, color: 'text-purple-600', bg: 'bg-purple-100' },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Purchase & Service History</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
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

      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-green-100 p-2 rounded-lg"><DollarSign className="text-green-600" size={20} /></div>
          <h2 className="text-lg font-semibold text-slate-800">Loyalty Discount Preview</h2>
        </div>
        <p className="text-sm text-slate-600 mb-3">
          Spend over Rs.5,000 and get <strong>10% off</strong> on your purchase.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Check a different amount</label>
            <input
              type="number"
              placeholder={`Your total spent: ${formatCurrency(baseAmount)}`}
              value={previewAmount}
              onChange={e => setPreviewAmount(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>
        {loyalty && checkAmount > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-slate-50 rounded-lg">
            <div>
              <p className="text-xs text-slate-500">Original Amount</p>
              <p className="text-lg font-semibold text-slate-800">{formatCurrency(loyalty.originalAmount)}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">You Save</p>
              <p className="text-lg font-semibold text-green-600">
                {loyalty.discountApplied ? formatCurrency(loyalty.youSave) : '—'}
              </p>
              {!loyalty.discountApplied && (
                <p className="text-xs text-slate-400">Spend over Rs.5,000 to save</p>
              )}
            </div>
            <div>
              <p className="text-xs text-slate-500">After Discount</p>
              <p className={`text-lg font-semibold ${loyalty.discountApplied ? 'text-green-600' : 'text-slate-800'}`}>
                {loyalty.discountApplied ? formatCurrency(loyalty.discountedAmount) : formatCurrency(loyalty.originalAmount)}
              </p>
            </div>
          </div>
        )}
      </div>

      {history && history.sales && history.sales.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-blue-100 p-2 rounded-lg"><ShoppingBag className="text-blue-600" size={20} /></div>
            <h2 className="text-lg font-semibold text-slate-800">Purchase History</h2>
          </div>
          <DataTable
            isLoading={isLoading}
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

      {completedAppointments.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-purple-100 p-2 rounded-lg"><Calendar className="text-purple-600" size={20} /></div>
            <h2 className="text-lg font-semibold text-slate-800">Service History</h2>
          </div>
          <DataTable
            data={completedAppointments}
            keyExtractor={(a: any) => a.id}
            columns={[
              { header: 'Service', accessor: 'serviceType', sortable: true },
              { header: 'Date', accessor: (a: any) => formatDate(a.appointmentDate), sortable: true },
              { header: 'Vehicle', accessor: (a: any) => a.vehicleRegistration || '-' },
              { header: 'Notes', accessor: 'notes' },
            ]}
          />
        </div>
      )}
    </div>
  )
}