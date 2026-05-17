import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { staffApi, staffCustomersApi } from '../../api/sales'
import DataTable from '../../components/ui/DataTable'
import toast from 'react-hot-toast'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { Plus, Eye, Search } from 'lucide-react'

export default function Customers() {
  const [showForm, setShowForm] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [searchPhone, setSearchPhone] = useState('')
  const [searchVehicle, setSearchVehicle] = useState('')
  const [searchId, setSearchId] = useState('')

  const hasAnySearch = searchTerm || searchPhone || searchVehicle || searchId

  const { data: searchResults, isLoading: searchLoading } = useQuery({
    queryKey: ['customer-search', searchTerm, searchPhone, searchVehicle, searchId],
    queryFn: () => staffCustomersApi.search({
      term: searchTerm || undefined,
      phone: searchPhone || undefined,
      vehicleNo: searchVehicle || undefined,
      customerId: searchId ? Number(searchId) : undefined,
    }),
    enabled: hasAnySearch,
  })

  const { register, handleSubmit, reset } = useForm()

  const createMutation = useMutation({
    mutationFn: (data: any) => staffApi.createCustomerWithVehicle({ ...data, year: Number(data.year) }),
    onSuccess: () => {
      toast.success('Customer created with vehicle')
      setShowForm(false)
      reset()
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Failed to create'),
  })

  const onSubmit = (data: any) => createMutation.mutate(data)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Customers</h1>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
          <Plus size={16} /> New Customer
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Create Customer with Vehicle</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">First Name</label>
              <input {...register('firstName')} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Last Name</label>
              <input {...register('lastName')} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <input type="email" {...register('email')} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
              <input {...register('phone')} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
              <input {...register('address')} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
            </div>

            <div className="border-t pt-4 md:col-span-3">
              <h3 className="font-medium text-slate-700 mb-2">Vehicle Details</h3>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Registration #</label>
              <input {...register('registrationNumber')} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Make</label>
              <input {...register('make')} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Model</label>
              <input {...register('model')} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Year</label>
              <input type="number" {...register('year')} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">VIN</label>
              <input {...register('vin')} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
            </div>

            <div className="flex gap-2 md:col-span-3">
              <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">Create</button>
              <button type="button" onClick={() => { setShowForm(false); reset() }} className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Search size={16} className="text-slate-400" />
          <span className="text-sm font-medium text-slate-700">Search Customers</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs text-slate-500 mb-1">Name / Email</label>
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">Phone</label>
            <input
              type="text"
              placeholder="Search by phone..."
              value={searchPhone}
              onChange={e => setSearchPhone(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">Vehicle Number</label>
            <input
              type="text"
              placeholder="Search by vehicle reg..."
              value={searchVehicle}
              onChange={e => setSearchVehicle(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">Customer ID</label>
            <input
              type="number"
              placeholder="Search by ID..."
              value={searchId}
              onChange={e => setSearchId(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      <DataTable
        isLoading={searchLoading}
        data={searchResults || []}
        keyExtractor={c => c.id}
        columns={[
          { header: 'Name', accessor: c => `${c.firstName} ${c.lastName}`, sortable: true },
          { header: 'Email', accessor: 'email' },
          { header: 'Phone', accessor: 'phone' },
          { header: 'Vehicles', accessor: 'vehicleCount' },
          { header: 'Sales', accessor: 'saleCount' },
          { header: 'Reg Numbers', accessor: c => c.registrationNumbers.join(', ') },
        ]}
        actions={c => (
          <Link
            to={`/staff/customers/${c.id}`}
            className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-800"
          >
            <Eye size={14} /> View
          </Link>
        )}
      />
    </div>
  )
}
