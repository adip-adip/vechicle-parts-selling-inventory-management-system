import { useQuery } from '@tanstack/react-query'
import { salesApi, staffCustomersApi } from '../../api/sales'
import { partsApi } from '../../api/parts'
import { formatCurrency } from '../../utils/format'
import { Store, Users, Package, CreditCard } from 'lucide-react'

export default function StaffDashboard() {
  const { data: sales } = useQuery({ queryKey: ['staff-sales'], queryFn: salesApi.getAll })
  const { data: parts } = useQuery({ queryKey: ['parts'], queryFn: partsApi.getAll })
  const { data: regular } = useQuery({ queryKey: ['regular-customers'], queryFn: () => staffCustomersApi.getRegularCustomers(5) })
  const { data: pending } = useQuery({ queryKey: ['pending-credits'], queryFn: staffCustomersApi.getPendingCredits })
  const { data: highSpenders } = useQuery({ queryKey: ['high-spenders'], queryFn: () => staffCustomersApi.getHighSpenders(5) })

  const totalSalesAmount = sales?.reduce((s: number, sale: any) => s + sale.totalAmount, 0) || 0
  const totalPending = pending?.reduce((s: number, p: any) => s + p.totalPendingAmount, 0) || 0

  const cards = [
    { label: 'Total Sales', value: formatCurrency(totalSalesAmount), icon: Store, color: 'text-blue-600', bg: 'bg-blue-100' },
    { label: 'Transactions', value: sales?.length || 0, icon: CreditCard, color: 'text-green-600', bg: 'bg-green-100' },
    { label: 'Parts Available', value: parts?.length || 0, icon: Package, color: 'text-purple-600', bg: 'bg-purple-100' },
    { label: 'Pending Credits', value: formatCurrency(totalPending), icon: Users, color: 'text-orange-600', bg: 'bg-orange-100' },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Staff Dashboard</h1>

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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Regular Customers</h2>
          {regular && regular.length > 0 ? (
            <ul className="space-y-2">
              {regular.map((c: any) => (
                <li key={c.id} className="flex justify-between text-sm">
                  <span className="text-slate-700">{c.firstName} {c.lastName}</span>
                  <span className="font-medium">{c.totalPurchases} purchases</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-400">No data</p>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">High Spenders</h2>
          {highSpenders && highSpenders.length > 0 ? (
            <ul className="space-y-2">
              {highSpenders.map((c: any) => (
                <li key={c.id} className="flex justify-between text-sm">
                  <span className="text-slate-700">{c.firstName} {c.lastName}</span>
                  <span className="font-medium text-green-600">{formatCurrency(c.totalSpent)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-400">No data</p>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Pending Credits</h2>
          {pending && pending.length > 0 ? (
            <ul className="space-y-2">
              {pending.slice(0, 5).map((c: any) => (
                <li key={c.id} className="flex justify-between text-sm">
                  <span className="text-slate-700">{c.firstName} {c.lastName}</span>
                  <span className="text-orange-600 font-medium">{formatCurrency(c.totalPendingAmount)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-400">No pending credits</p>
          )}
        </div>
      </div>
    </div>
  )
}
