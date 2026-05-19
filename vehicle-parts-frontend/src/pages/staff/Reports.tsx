import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { staffCustomersApi } from '../../api/sales'
import { formatCurrency } from '../../utils/format'
import { Link } from 'react-router-dom'
import { Eye, Users, TrendingUp, CreditCard } from 'lucide-react'

type Tab = 'regular' | 'spenders' | 'credits'

export default function StaffReports() {
  const [tab, setTab] = useState<Tab>('regular')

  const { data: regular } = useQuery({
    queryKey: ['regular-customers'],
    queryFn: () => staffCustomersApi.getRegularCustomers(50),
  })

  const { data: highSpenders } = useQuery({
    queryKey: ['high-spenders'],
    queryFn: () => staffCustomersApi.getHighSpenders(50),
  })

  const { data: pending } = useQuery({
    queryKey: ['pending-credits'],
    queryFn: staffCustomersApi.getPendingCredits,
  })

  const tabs = [
    { key: 'regular' as const, label: 'Regular Customers', icon: Users },
    { key: 'spenders' as const, label: 'High Spenders', icon: TrendingUp },
    { key: 'credits' as const, label: 'Pending Credits', icon: CreditCard },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Customer Reports</h1>

      <div className="flex gap-2 mb-6 flex-wrap">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === t.key
                ? 'bg-blue-600 text-white'
                : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            <t.icon size={16} />
            {t.label}
          </button>
        ))}
      </div>

      {/* Regular Customers */}
      {tab === 'regular' && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Regular Customers</h2>
          {regular && regular.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-3 px-4 font-medium text-slate-600">Customer</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-600">Email</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-600">Phone</th>
                    <th className="text-right py-3 px-4 font-medium text-slate-600">Purchases</th>
                    <th className="text-right py-3 px-4 font-medium text-slate-600">Total Spent</th>
                    <th className="text-center py-3 px-4 font-medium text-slate-600">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {regular.map((c: any) => (
                    <tr key={c.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-3 px-4 font-medium text-slate-800">{c.firstName} {c.lastName}</td>
                      <td className="py-3 px-4 text-slate-600">{c.email}</td>
                      <td className="py-3 px-4 text-slate-600">{c.phone}</td>
                      <td className="py-3 px-4 text-right text-slate-800">{c.totalPurchases}</td>
                      <td className="py-3 px-4 text-right text-green-600 font-medium">{formatCurrency(c.totalSpent)}</td>
                      <td className="py-3 px-4 text-center">
                        <Link to={`/staff/customers/${c.id}`} className="text-blue-600 hover:text-blue-800 inline-flex items-center gap-1" title="View Customer">
                          <Eye size={16} />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-slate-400">No data available</p>
          )}
        </div>
      )}

      {/* High Spenders */}
      {tab === 'spenders' && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">High Spenders</h2>
          {highSpenders && highSpenders.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-3 px-4 font-medium text-slate-600">Customer</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-600">Email</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-600">Phone</th>
                    <th className="text-right py-3 px-4 font-medium text-slate-600">Total Spent</th>
                    <th className="text-right py-3 px-4 font-medium text-slate-600">Purchases</th>
                    <th className="text-right py-3 px-4 font-medium text-slate-600">Avg/Purchase</th>
                    <th className="text-center py-3 px-4 font-medium text-slate-600">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {highSpenders.map((c: any) => (
                    <tr key={c.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-3 px-4 font-medium text-slate-800">{c.firstName} {c.lastName}</td>
                      <td className="py-3 px-4 text-slate-600">{c.email}</td>
                      <td className="py-3 px-4 text-slate-600">{c.phone}</td>
                      <td className="py-3 px-4 text-right text-green-600 font-medium">{formatCurrency(c.totalSpent)}</td>
                      <td className="py-3 px-4 text-right text-slate-800">{c.totalPurchases}</td>
                      <td className="py-3 px-4 text-right text-slate-600">{formatCurrency(c.averagePerPurchase)}</td>
                      <td className="py-3 px-4 text-center">
                        <Link to={`/staff/customers/${c.id}`} className="text-blue-600 hover:text-blue-800 inline-flex items-center gap-1" title="View Customer">
                          <Eye size={16} />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-slate-400">No data available</p>
          )}
        </div>
      )}

      {/* Pending Credits */}
      {tab === 'credits' && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Pending Credits</h2>
          {pending && pending.length > 0 ? (
            <div className="space-y-4">
              {pending.map((c: any) => (
                <div key={c.id} className="border border-slate-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <Link to={`/staff/customers/${c.id}`} className="font-medium text-blue-600 hover:underline">{c.firstName} {c.lastName}</Link>
                      <p className="text-xs text-slate-500">{c.email} &middot; {c.phone}</p>
                    </div>
                    <span className="font-bold text-orange-600">{formatCurrency(c.totalPendingAmount)}</span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-slate-200">
                          <th className="text-left py-2 px-3 font-medium text-slate-600">Invoice</th>
                          <th className="text-right py-2 px-3 font-medium text-slate-600">Amount</th>
                          <th className="text-left py-2 px-3 font-medium text-slate-600">Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(c.pendingSales || []).map((s: any) => (
                          <tr key={s.saleId} className="border-b border-slate-100">
                            <td className="py-2 px-3 font-medium text-slate-800">{s.invoiceNumber || `#${s.saleId}`}</td>
                            <td className="py-2 px-3 text-right text-slate-800">{formatCurrency(s.totalAmount)}</td>
                            <td className="py-2 px-3 text-slate-600">{new Date(s.saleDate).toLocaleDateString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-400">No pending credits</p>
          )}
        </div>
      )}
    </div>
  )
}