import { useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { customerPortalApi } from '../../api/customerPortal'
import DataTable from '../../components/ui/DataTable'
import { formatCurrency, formatDate } from '../../utils/format'
import toast from 'react-hot-toast'
import { useForm } from 'react-hook-form'
import { User, ShoppingBag, DollarSign, Phone, MapPin, Mail } from 'lucide-react'

export default function Profile() {
  const queryClient = useQueryClient()

  const { data: profile, isLoading } = useQuery({
    queryKey: ['customer-profile'],
    queryFn: customerPortalApi.getProfile,
  })

  const { data: history } = useQuery({
    queryKey: ['customer-history'],
    queryFn: customerPortalApi.getHistory,
  })

  const { register, handleSubmit, reset } = useForm()

  useEffect(() => {
    if (profile) {
      reset({
        firstName: profile.firstName,
        lastName: profile.lastName,
        phone: profile.phone,
        address: profile.address || '',
      })
    }
  }, [profile, reset])

  const mutation = useMutation({
    mutationFn: (data: any) => customerPortalApi.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer-profile'] })
      toast.success('Profile updated')
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Failed to update'),
  })

  const onSubmit = (data: any) => mutation.mutate(data)

  if (isLoading) return <div className="text-center py-8 text-slate-500">Loading...</div>
  if (!profile) return <div className="text-center py-8 text-slate-500">Profile not found</div>

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">My Profile</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-3">
              <User size={36} className="text-blue-600" />
            </div>
            <h2 className="text-lg font-semibold text-slate-800">{profile.firstName} {profile.lastName}</h2>
            <div className="flex items-center gap-1 text-sm text-slate-500 mt-1">
              <Mail size={14} />
              <span>{profile.email}</span>
            </div>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-2 text-slate-600">
              <Phone size={16} className="text-slate-400" />
              <span>{profile.phone}</span>
            </div>
            {profile.address && (
              <div className="flex items-center gap-2 text-slate-600">
                <MapPin size={16} className="text-slate-400" />
                <span>{profile.address}</span>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-blue-50 rounded-xl p-6 flex items-center gap-4">
            <div className="bg-blue-100 p-3 rounded-lg">
              <ShoppingBag size={24} className="text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Total Purchases</p>
              <p className="text-2xl font-bold text-slate-800">{profile.totalSales}</p>
            </div>
          </div>
          <div className="bg-green-50 rounded-xl p-6 flex items-center gap-4">
            <div className="bg-green-100 p-3 rounded-lg">
              <DollarSign size={24} className="text-green-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Total Spent</p>
              <p className="text-2xl font-bold text-slate-800">{formatCurrency(profile.totalSpent)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Edit Profile</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">First Name</label>
              <input {...register('firstName')} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Last Name</label>
              <input {...register('lastName')} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
              <input {...register('phone')} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
              <input {...register('address')} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          <button type="submit" disabled={mutation.isPending} className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
            {mutation.isPending ? 'Saving...' : 'Update Profile'}
          </button>
        </form>
      </div>

      {history && history.sales && history.sales.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Recent Purchases</h2>
          <DataTable
            data={history.sales.slice(0, 5)}
            pageSize={5}
            keyExtractor={s => s.saleId}
            columns={[
              { header: 'Invoice', accessor: s => s.invoiceNumber || `#${s.saleId}` },
              { header: 'Amount', accessor: s => formatCurrency(s.totalAmount), sortable: true },
              { header: 'Date', accessor: s => formatDate(s.saleDate), sortable: true },
              { header: 'Status', accessor: s => (
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  s.paymentStatus === 'Paid' ? 'bg-green-100 text-green-700' :
                  s.paymentStatus === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-700'
                }`}>{s.paymentStatus}</span>
              )},
            ]}
          />
        </div>
      )}
    </div>
  )
}