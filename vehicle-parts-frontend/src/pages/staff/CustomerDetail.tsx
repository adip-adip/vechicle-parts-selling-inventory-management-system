import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { staffCustomersApi } from '../../api/sales'
import DataTable from '../../components/ui/DataTable'
import { formatCurrency, formatDate } from '../../utils/format'
import { ArrowLeft, Car, ShoppingBag, User } from 'lucide-react'

export default function CustomerDetail() {
  const { id } = useParams<{ id: string }>()

  const { data: details, isLoading: detailsLoading } = useQuery({
    queryKey: ['customer-detail', id],
    queryFn: () => staffCustomersApi.getDetails(Number(id)),
    enabled: !!id,
  })

  const { data: history, isLoading: historyLoading } = useQuery({
    queryKey: ['customer-history', id],
    queryFn: () => staffCustomersApi.getHistory(Number(id)),
    enabled: !!id,
  })

  const { data: vehicles, isLoading: vehiclesLoading } = useQuery({
    queryKey: ['customer-vehicles', id],
    queryFn: () => staffCustomersApi.getVehicles(Number(id)),
    enabled: !!id,
  })

  if (detailsLoading) return <div className="text-center py-8 text-slate-500">Loading...</div>
  if (!details) return <div className="text-center py-8 text-slate-500">Customer not found</div>

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Link to="/staff/customers" className="text-slate-500 hover:text-slate-700">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl font-bold text-slate-800">Customer Details</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-blue-100 p-2 rounded-lg"><User className="text-blue-600" size={20} /></div>
          <h2 className="text-lg font-semibold text-slate-800">{details.firstName} {details.lastName}</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-slate-500">Email:</span>
            <p className="font-medium">{details.email}</p>
          </div>
          <div>
            <span className="text-slate-500">Phone:</span>
            <p className="font-medium">{details.phone}</p>
          </div>
          {details.address && (
            <div>
              <span className="text-slate-500">Address:</span>
              <p className="font-medium">{details.address}</p>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-green-100 p-2 rounded-lg"><Car className="text-green-600" size={20} /></div>
          <h2 className="text-lg font-semibold text-slate-800">Vehicles</h2>
        </div>
        <DataTable
          isLoading={vehiclesLoading}
          data={vehicles || []}
          keyExtractor={(v: any) => v.id}
          columns={[
            { header: 'Registration #', accessor: 'registrationNumber', sortable: true },
            { header: 'Make', accessor: 'make', sortable: true },
            { header: 'Model', accessor: 'model', sortable: true },
            { header: 'Year', accessor: 'year', sortable: true },
            { header: 'VIN', accessor: 'vin' },
          ]}
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-purple-100 p-2 rounded-lg"><ShoppingBag className="text-purple-600" size={20} /></div>
          <h2 className="text-lg font-semibold text-slate-800">Purchase History</h2>
        </div>
        {history && history.sales && history.sales.length > 0 && (
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="bg-slate-50 rounded-lg p-3 text-center">
              <p className="text-xs text-slate-500">Total Sales</p>
              <p className="text-lg font-bold text-slate-800">{history.totalSales}</p>
            </div>
            <div className="bg-slate-50 rounded-lg p-3 text-center">
              <p className="text-xs text-slate-500">Total Spent</p>
              <p className="text-lg font-bold text-slate-800">{formatCurrency(history.totalSpent)}</p>
            </div>
            <div className="bg-slate-50 rounded-lg p-3 text-center">
              <p className="text-xs text-slate-500">Avg per Sale</p>
              <p className="text-lg font-bold text-slate-800">
                {history.totalSales > 0 ? formatCurrency(history.totalSpent / history.totalSales) : '-'}
              </p>
            </div>
          </div>
        )}
        <DataTable
          isLoading={historyLoading}
          data={history?.sales || []}
          keyExtractor={(s: any) => s.saleId}
          columns={[
            { header: 'Invoice #', accessor: (s: any) => s.invoiceNumber || `#${s.saleId}`, sortable: true },
            { header: 'Amount', accessor: (s: any) => formatCurrency(s.totalAmount), sortable: true },
            { header: 'Date', accessor: (s: any) => formatDate(s.saleDate), sortable: true },
            { header: 'Status', accessor: (s: any) => (
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                s.paymentStatus === 'Paid' ? 'bg-green-100 text-green-700' :
                s.paymentStatus === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                'bg-red-100 text-red-700'
              }`}>{s.paymentStatus}</span>
            )},
            { header: 'Items', accessor: 'itemCount' },
            { header: 'Parts', accessor: (s: any) => s.partsPurchased.join(', ') },
          ]}
        />
      </div>
    </div>
  )
}
