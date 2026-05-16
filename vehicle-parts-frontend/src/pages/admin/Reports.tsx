import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { reportsApi } from '../../api/reports'
import { formatCurrency } from '../../utils/format'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function Reports() {
  const [period, setPeriod] = useState<'daily' | 'monthly' | 'yearly'>('daily')

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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
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
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm p-6">
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
    </div>
  )
}
