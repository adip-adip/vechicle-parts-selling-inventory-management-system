import { useQuery } from '@tanstack/react-query'
import { customerPortalApi } from '../../api/customerPortal'
import DataTable from '../../components/ui/DataTable'
import { formatCurrency, formatDate } from '../../utils/format'
import { Calendar, ClipboardList, History, DollarSign, ExternalLink } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function CustomerDashboard() {
  const { data: history } = useQuery({ queryKey: ['customer-history'], queryFn: customerPortalApi.getHistory })
  const { data: appointments } = useQuery({ queryKey: ['customer-appointments'], queryFn: customerPortalApi.getAppointments })
  const { data: partRequests } = useQuery({ queryKey: ['customer-part-requests'], queryFn: customerPortalApi.getPartRequests })

  const cards = [
    { label: 'Total Purchases', value: history?.totalSales || 0, icon: History, color: 'text-blue-600', bg: 'bg-blue-100', link: '/customer/history' },
    { label: 'Total Spent', value: formatCurrency(history?.totalSpent || 0), icon: DollarSign, color: 'text-green-600', bg: 'bg-green-100', link: '/customer/history' },
    { label: 'Appointments', value: appointments?.length || 0, icon: Calendar, color: 'text-purple-600', bg: 'bg-purple-100', link: '/customer/appointments' },
    { label: 'Part Requests', value: partRequests?.length || 0, icon: ClipboardList, color: 'text-orange-600', bg: 'bg-orange-100', link: '/customer/part-requests' },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Customer Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map(card => (
          <Link key={card.label} to={card.link} className="bg-white rounded-xl shadow-sm p-6 flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className={`${card.bg} p-3 rounded-lg`}>
              <card.icon className={card.color} size={24} />
            </div>
            <div className="flex-1">
              <p className="text-sm text-slate-500">{card.label}</p>
              <p className="text-2xl font-bold text-slate-800">{card.value}</p>
            </div>
            <ExternalLink size={16} className="text-slate-300" />
          </Link>
        ))}
      </div>

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