import { useQuery } from '@tanstack/react-query'
import { partsApi } from '../../api/parts'
import { vendorsApi } from '../../api/vendors'
import { adminApi } from '../../api/reports'
import { Package, Truck, Users, AlertTriangle } from 'lucide-react'

export default function AdminDashboard() {
  const { data: parts } = useQuery({ queryKey: ['parts'], queryFn: partsApi.getAll })
  const { data: vendors } = useQuery({ queryKey: ['vendors'], queryFn: () => vendorsApi.getAll() })
  const { data: staff } = useQuery({ queryKey: ['staff'], queryFn: adminApi.getStaff })
  const { data: lowStock } = useQuery({ queryKey: ['low-stock'], queryFn: partsApi.getLowStock })

  const totalStock = parts?.reduce((s, p) => s + p.stockQuantity, 0) || 0
  const totalValue = parts?.reduce((s, p) => s + p.price * p.stockQuantity, 0) || 0

  const cards = [
    { label: 'Total Parts', value: parts?.length || 0, icon: Package, color: 'text-blue-600', bg: 'bg-blue-100' },
    { label: 'Total Vendors', value: vendors?.length || 0, icon: Truck, color: 'text-green-600', bg: 'bg-green-100' },
    { label: 'Staff Members', value: staff?.length || 0, icon: Users, color: 'text-purple-600', bg: 'bg-purple-100' },
    { label: 'Low Stock Items', value: lowStock?.length || 0, icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-100' },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Admin Dashboard</h1>

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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Inventory Overview</h2>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Total Stock Quantity</span>
              <span className="font-semibold">{totalStock.toLocaleString()} units</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Total Inventory Value</span>
              <span className="font-semibold">${totalValue.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Categories</span>
              <span className="font-semibold">
                {new Set(parts?.map(p => p.category).filter(Boolean)).size}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Low Stock Alerts</h2>
          {lowStock && lowStock.length > 0 ? (
            <ul className="space-y-2">
              {lowStock.slice(0, 5).map(p => (
                <li key={p.id} className="flex justify-between text-sm">
                  <span className="text-slate-700">{p.name}</span>
                  <span className="text-red-600 font-medium">{p.stockQuantity} left</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-400">No low stock items</p>
          )}
        </div>
      </div>
    </div>
  )
}
