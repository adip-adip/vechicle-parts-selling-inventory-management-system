import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import {
  LayoutDashboard, Package, Users, Truck,
  FileText, BarChart3, Store, UserCircle,
  Calendar, MessageSquare, ClipboardList, Car,
  ClipboardCheck, History,
} from 'lucide-react'

const navItems: Record<string, { label: string; path: string; icon: React.ReactNode }[]> = {
  Admin: [
    { label: 'Dashboard', path: '/admin', icon: <LayoutDashboard size={18} /> },
    { label: 'Parts', path: '/admin/parts', icon: <Package size={18} /> },
    { label: 'Vendors', path: '/admin/vendors', icon: <Truck size={18} /> },
    { label: 'Invoices', path: '/admin/invoices', icon: <FileText size={18} /> },
    { label: 'Staff', path: '/admin/staff', icon: <Users size={18} /> },
    { label: 'Reports', path: '/admin/reports', icon: <BarChart3 size={18} /> },
  ],
  Staff: [
    { label: 'Dashboard', path: '/staff', icon: <LayoutDashboard size={18} /> },
    { label: 'Customers', path: '/staff/customers', icon: <Users size={18} /> },
    { label: 'Sales', path: '/staff/sales', icon: <Store size={18} /> },
    { label: 'Appointments', path: '/staff/appointments', icon: <Calendar size={18} /> },
    { label: 'Part Requests', path: '/staff/part-requests', icon: <ClipboardCheck size={18} /> },
    { label: 'Reports', path: '/staff/reports', icon: <BarChart3 size={18} /> },
  ],
  Customer: [
    { label: 'Dashboard', path: '/customer', icon: <LayoutDashboard size={18} /> },
    { label: 'Profile', path: '/customer/profile', icon: <UserCircle size={18} /> },
    { label: 'Purchase History', path: '/customer/history', icon: <History size={18} /> },
    { label: 'Vehicles', path: '/customer/vehicles', icon: <Car size={18} /> },
    { label: 'Appointments', path: '/customer/appointments', icon: <Calendar size={18} /> },
    { label: 'Part Requests', path: '/customer/part-requests', icon: <ClipboardList size={18} /> },
    { label: 'Reviews', path: '/customer/reviews', icon: <MessageSquare size={18} /> },
  ],
}

export default function Sidebar() {
  const { user } = useAuth()
  const location = useLocation()
  if (!user) return null

  const items = navItems[user.role] || []

  return (
    <aside className="w-64 bg-slate-900 text-white min-h-screen p-4 flex flex-col">
      <div className="mb-8 px-2">
        <h1 className="text-lg font-bold">Vehicle Parts</h1>
        <p className="text-xs text-slate-400">Inventory System</p>
      </div>
      <nav className="flex-1 space-y-1">
        {items.map(item => {
          const active = location.pathname === item.path
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                active
                  ? 'bg-slate-700 text-white font-medium'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              {item.icon}
              {item.label}
            </Link>
          )
        })}
      </nav>
      <div className="px-3 py-3 border-t border-slate-700 text-xs text-slate-400">
        <p className="font-medium text-white">{user.firstName} {user.lastName}</p>
        <p className="capitalize">{user.role}</p>
      </div>
    </aside>
  )
}
