import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { vendorsApi } from '../../api/vendors'
import DataTable from '../../components/ui/DataTable'
import toast from 'react-hot-toast'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { Vendor, PurchaseInvoice } from '../../types/api'
import { Plus, Eye, X, FileText } from 'lucide-react'
import { formatCurrency, formatDate } from '../../utils/format'

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  contactPerson: z.string().optional(),
  phone: z.string().min(1, 'Phone is required'),
  email: z.string().email().optional().or(z.literal('')),
  address: z.string().optional(),
  paymentTerms: z.string().optional(),
})

type FormData = z.infer<typeof schema>

export default function Vendors() {
  const queryClient = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Vendor | null>(null)
  const [viewing, setViewing] = useState<Vendor | null>(null)

  const { data, isLoading } = useQuery({ queryKey: ['vendors'], queryFn: () => vendorsApi.getAll() })

  const { data: vendorDetail } = useQuery({
    queryKey: ['vendor-detail', viewing?.id],
    queryFn: () => vendorsApi.getById(viewing!.id),
    enabled: !!viewing,
  })

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const createMutation = useMutation({
    mutationFn: vendorsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendors'] })
      toast.success('Vendor created')
      setShowForm(false)
      reset()
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Failed to create'),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: FormData }) => vendorsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendors'] })
      toast.success('Vendor updated')
      setEditing(null)
      setShowForm(false)
      reset()
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Failed to update'),
  })

  const deleteMutation = useMutation({
    mutationFn: vendorsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendors'] })
      toast.success('Vendor deleted')
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Failed to delete'),
  })

  const onSubmit = (formData: FormData) => {
    const payload = { ...formData, email: formData.email || undefined }
    if (editing) {
      updateMutation.mutate({ id: editing.id, data: payload })
    } else {
      createMutation.mutate(payload)
    }
  }

  const openEdit = (v: Vendor) => {
    setEditing(v)
    setShowForm(true)
    reset({
      name: v.name,
      contactPerson: v.contactPerson || '',
      phone: v.phone,
      email: v.email || '',
      address: v.address || '',
      paymentTerms: v.paymentTerms || '',
    })
  }

  const openCreate = () => {
    setEditing(null)
    reset({ name: '', contactPerson: '', phone: '', email: '', address: '', paymentTerms: '' })
    setShowForm(true)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Vendors</h1>
        <button onClick={openCreate} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
          <Plus size={16} /> Add Vendor
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">
            {editing ? 'Edit Vendor' : 'New Vendor'}
          </h2>
          <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
              <input {...register('name')} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
              <input {...register('phone')} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Contact Person</label>
              <input {...register('contactPerson')} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <input type="email" {...register('email')} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
              <input {...register('address')} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Payment Terms</label>
              <input {...register('paymentTerms')} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="flex gap-2 md:col-span-2">
              <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
                {editing ? 'Update' : 'Create'}
              </button>
              <button type="button" onClick={() => { setShowForm(false); setEditing(null); reset() }} className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <DataTable
        isLoading={isLoading}
        data={data || []}
        keyExtractor={v => v.id}
        columns={[
          { header: 'Name', accessor: 'name', sortable: true },
          { header: 'Contact', accessor: 'contactPerson' },
          { header: 'Phone', accessor: 'phone' },
          { header: 'Email', accessor: 'email' },
          { header: 'Payment Terms', accessor: 'paymentTerms' },
        ]}
        onEdit={openEdit}
        onDelete={v => { if (confirm('Delete this vendor?')) deleteMutation.mutate(v.id) }}
        actions={v => (
          <button onClick={() => setViewing(v)} className="text-blue-600 hover:text-blue-800" title="View Details">
            <Eye size={16} />
          </button>
        )}
      />

      {/* Vendor Detail Modal */}
      {viewing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl mx-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-slate-200">
              <h2 className="text-lg font-semibold text-slate-800">{viewing.name}</h2>
              <button onClick={() => setViewing(null)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>

            <div className="p-4 overflow-y-auto">
              {/* Vendor Info */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-xs text-slate-500">Contact Person</p>
                  <p className="font-medium text-slate-800">{viewing.contactPerson || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Phone</p>
                  <p className="font-medium text-slate-800">{viewing.phone}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Email</p>
                  <p className="font-medium text-slate-800">{viewing.email || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Address</p>
                  <p className="font-medium text-slate-800">{viewing.address || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Payment Terms</p>
                  <p className="font-medium text-slate-800">{viewing.paymentTerms || '-'}</p>
                </div>
              </div>

              {/* Purchase Invoices */}
              <div className="flex items-center gap-2 mb-3">
                <FileText size={16} className="text-slate-500" />
                <h3 className="font-semibold text-slate-800">Purchase Invoices</h3>
              </div>
              {vendorDetail?.purchaseInvoices && vendorDetail.purchaseInvoices.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="text-left py-2 px-3 font-medium text-slate-600">Invoice #</th>
                        <th className="text-right py-2 px-3 font-medium text-slate-600">Total</th>
                        <th className="text-left py-2 px-3 font-medium text-slate-600">Date</th>
                        <th className="text-left py-2 px-3 font-medium text-slate-600">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {vendorDetail.purchaseInvoices.map((inv: PurchaseInvoice) => (
                        <tr key={inv.id} className="border-b border-slate-100 hover:bg-slate-50">
                          <td className="py-2 px-3 font-medium text-slate-800">{inv.invoiceNumber}</td>
                          <td className="py-2 px-3 text-right text-slate-800">{formatCurrency(inv.totalCost)}</td>
                          <td className="py-2 px-3 text-slate-600">{formatDate(inv.invoiceDate)}</td>
                          <td className="py-2 px-3">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              inv.status === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                            }`}>{inv.status}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-sm text-slate-400">No purchase invoices found for this vendor.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
