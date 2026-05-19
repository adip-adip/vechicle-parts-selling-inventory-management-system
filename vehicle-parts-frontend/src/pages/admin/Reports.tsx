import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { reportsApi } from '../../api/reports'
import { formatCurrency, formatDate } from '../../utils/format'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { ChevronDown, ChevronUp } from 'lucide-react'

export default function Reports() {
  const [period, setPeriod] = useState<'daily' | 'monthly' | 'yearly'>('daily')
  const [showDetails, setShowDetails] = useState(true)

  const { data: daily } = useQuery({
    queryKey: ['report-daily'],
    queryFn: () => reportsApi.getDaily(),
    enabled: period === 'daily',
  })

  const { data: monthly } = useQuery({
    queryKey: ['report-monthly'],
    queryFn: () => reportsApi.getMonthly(),
    enabled: period === 'monthly',
  })

  const { data: yearly } = useQuery({
    queryKey: ['report-yearly'],
    queryFn: () => reportsApi.getYearly(),
    enabled: period === 'yearly',
  })

  const tabs = [
    { key: 'daily' as const, label: 'Daily' },
    { key: 'monthly' as const, label: 'Monthly' },
    { key: 'yearly' as const, label: 'Yearly' },
  ]

  const chartData = (() => {
    if (period === 'daily' && daily) {
      return [{ name: 'Today', sales: daily.totalSales, count: daily.transactionCount }]
    }
    if (period === 'monthly' && monthly) {
      return monthly.dailyBreakdown?.map(d => ({
        name: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        sales: d.totalSales,
        count: d.transactionCount,
      })) || []
    }
    if (period === 'yearly' && yearly) {
      return yearly.monthlyBreakdown?.map((m: any) => ({
        name: new Date(2000, m.month - 1).toLocaleDateString('en-US', { month: 'short' }),
        sales: m.totalSales,
        count: m.transactionCount,
      })) || []
    }
    return []
  })()

  const currentData = daily || monthly || yearly

  const detailRows = (() => {
    if (period === 'daily' && daily?.sales) {
      return daily.sales.map((s: any) => ({
        id: s.id,
        invoice: s.invoiceNumber || `#${s.id}`,
        customer: s.customer ? `${s.customer.firstName} ${s.customer.lastName}` : '-',
        amount: s.totalAmount,
        date: s.saleDate,
        status: s.paymentStatus,
        items: s.saleItems?.length || s.itemCount || '-',
      }))
    }
    if (period === 'monthly' && monthly?.dailyBreakdown) {
      return monthly.dailyBreakdown.map((d: any) => ({
        id: d.date,
        invoice: formatDate(d.date),
        customer: `${d.transactionCount} transaction(s)`,
        amount: d.totalSales,
        date: d.date,
        status: '',
        items: d.transactionCount,
      }))
    }
    if (period === 'yearly' && (yearly as any)?.monthlyBreakdown) {
      return (yearly as any).monthlyBreakdown.map((m: any) => ({
        id: m.month,
        invoice: m.monthName,
        customer: `${m.transactionCount} transaction(s)`,
        amount: m.totalSales,
        date: '',
        status: '',
        items: m.transactionCount,
      }))
    }
    return []
  })()

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Reports</h1>

      <div className="flex gap-2 mb-6">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setPeriod(tab.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              period === tab.key
                ? 'bg-blue-600 text-white'
                : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {currentData && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <p className="text-sm text-slate-500">Total Sales</p>
              <p className="text-2xl font-bold text-slate-800">{formatCurrency(currentData.totalSales)}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6">
              <p className="text-sm text-slate-500">Transactions</p>
              <p className="text-2xl font-bold text-slate-800">{currentData.transactionCount}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6">
              <p className="text-sm text-slate-500">Avg per Transaction</p>
              <p className="text-2xl font-bold text-slate-800">
                {currentData.transactionCount > 0
                  ? formatCurrency(currentData.totalSales / currentData.transactionCount)
                  : '-'}
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6">
              <p className="text-sm text-slate-500">Highest Sale</p>
              <p className="text-2xl font-bold text-slate-800">
                {detailRows.length > 0 ? formatCurrency(Math.max(...detailRows.map((r: any) => r.amount))) : '-'}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">
              {period === 'daily' ? 'Today' : period === 'monthly' ? 'Daily Breakdown' : 'Monthly Breakdown'}
            </h2>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip formatter={(val: any) => formatCurrency(Number(val))} />
                  <Bar dataKey="sales" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-slate-400">No data available</p>
            )}
          </div>

          {detailRows.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="flex items-center gap-2 text-lg font-semibold text-slate-800 mb-4"
              >
                {showDetails ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                {period === 'daily' ? 'Sale Details' : period === 'monthly' ? 'Daily Summary' : 'Monthly Summary'}
              </button>
              {showDetails && (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="text-left py-3 px-4 font-medium text-slate-600">
                          {period === 'daily' ? 'Invoice #' : 'Period'}
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-slate-600">
                          {period === 'daily' ? 'Customer' : 'Activity'}
                        </th>
                        <th className="text-right py-3 px-4 font-medium text-slate-600">Amount</th>
                        {period === 'daily' && <th className="text-left py-3 px-4 font-medium text-slate-600">Date</th>}
                        {period === 'daily' && <th className="text-left py-3 px-4 font-medium text-slate-600">Status</th>}
                        <th className="text-right py-3 px-4 font-medium text-slate-600">{period === 'daily' ? 'Items' : 'Transactions'}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {detailRows.map((row: any) => (
                        <tr key={row.id} className="border-b border-slate-100 hover:bg-slate-50">
                          <td className="py-3 px-4 font-medium text-slate-800">{row.invoice}</td>
                          <td className="py-3 px-4 text-slate-600">{row.customer}</td>
                          <td className="py-3 px-4 text-right text-slate-800">{formatCurrency(row.amount)}</td>
                          {period === 'daily' && <td className="py-3 px-4 text-slate-600">{formatDate(row.date)}</td>}
                          {period === 'daily' && (
                            <td className="py-3 px-4">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                row.status === 'Paid' ? 'bg-green-100 text-green-700' :
                                row.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-red-100 text-red-700'
                              }`}>{row.status}</span>
                            </td>
                          )}
                          <td className="py-3 px-4 text-right text-slate-600">{row.items}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}