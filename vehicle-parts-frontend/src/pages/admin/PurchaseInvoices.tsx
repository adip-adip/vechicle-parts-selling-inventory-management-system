import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { invoicesApi } from '../../api/invoices'
import { vendorsApi } from '../../api/vendors'
import { partsApi } from '../../api/parts'
import DataTable from '../../components/ui/DataTable'
import toast from 'react-hot-toast'
import { formatCurrency, formatDate } from '../../utils/format'
import { Plus, X } from 'lucide-react'

export default function PurchaseInvoices() {
  const queryClient = useQueryClient()
  const [showForm, setShowForm] = useState(false)

  const { data: invoices, isLoading } = useQuery({ queryKey: ['invoices'], queryFn: invoicesApi.getAll })
  const { data: vendors } = useQuery({ queryKey: ['vendors'], queryFn: () => vendorsApi.getAll() })
  const { data: parts } = useQuery({ queryKey: ['parts'], queryFn: partsApi.getAll })

  const [items, setItems] = useState<Array<{ vehiclePartId: number; quantity: number; unitCost: number }>>([])

  const addItem = () => {
    setItems([...items, { vehiclePartId: 0, quantity: 1, unitCost: 0 }])
  }

  const removeItem = (idx: number) => {
    setItems(items.filter((_, i) => i !== idx))
  }

  const updateItem = (idx: number, field: string, value: number) => {
    setItems(items.map((item, i) => i === idx ? { ...item, [field]: value } : item))
  }

  const createMutation = useMutation({
    mutationFn: (data: any) => invoicesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
      toast.success('Invoice created')
      setShowForm(false)
      setItems([])
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Failed to create'),
  })

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) => invoicesApi.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
      toast.success('Status updated')
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Failed to update'),
  })

  const deleteMutation = useMutation({
    mutationFn: invoicesApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
      toast.success('Invoice deleted')
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Failed to delete'),
  })

  const onSubmit = () => {
    if (items.length === 0) {
      toast.error('Add at least one item')
      return
    }
    const vendorId = (document.getElementById('vendorId') as HTMLSelectElement)?.value
    const status = (document.getElementById('status') as HTMLSelectElement)?.value
    if (!vendorId || vendorId === '0') { toast.error('Select a vendor'); return }
    createMutation.mutate({
      vendorId: Number(vendorId),
      status,
      items: items.map(i => ({
        vehiclePartId: Number(i.vehiclePartId),
        quantity: Number(i.quantity),
        unitCost: Number(i.unitCost),
      })),
    })
  }

  const totalCost = items.reduce((sum, item) => {
    return sum + (Number(item.unitCost) || 0) * (Number(item.quantity) || 0)
  }, 0)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Purchase Invoices</h1>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
          <Plus size={16} /> New Invoice
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">New Purchase Invoice</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Vendor</label>
              <select id="vendorId" className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm">
                <option value="0">Select vendor</option>
                {vendors?.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
              <select id="status" className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm">
                <option value="Unpaid">Unpaid</option>
                <option value="Paid">Paid</option>
              </select>
            </div>
          </div>

          <h3 className="font-medium text-slate-700 mb-2">Items</h3>
          {items.map((item, idx) => (
            <div key={idx} className="flex gap-3 items-end mb-2">
              <div className="flex-1">
                <label className="block text-xs text-slate-500 mb-1">Part</label>
                <select value={item.vehiclePartId} onChange={e => updateItem(idx, 'vehiclePartId', Number(e.target.value))} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm">
                  <option value="0">Select part</option>
                  {parts?.map(p => <option key={p.id} value={p.id}>{p.name} (${p.price})</option>)}
                </select>
              </div>
              <div className="w-24">
                <label className="block text-xs text-slate-500 mb-1">Qty</label>
                <input type="number" value={item.quantity} onChange={e => updateItem(idx, 'quantity', Number(e.target.value))} min={1} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
              </div>
              <div className="w-32">
                <label className="block text-xs text-slate-500 mb-1">Unit Cost</label>
                <input type="number" step="0.01" value={item.unitCost} onChange={e => updateItem(idx, 'unitCost', Number(e.target.value))} min={0.01} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
              </div>
              <button type="button" onClick={() => removeItem(idx)} className="p-2 text-red-500 hover:text-red-700"><X size={18} /></button>
            </div>
          ))}

          <div className="flex items-center gap-4 mt-2">
            <button type="button" onClick={addItem} className="text-sm text-blue-600 hover:underline">+ Add Item</button>
            <span className="text-sm font-semibold">Total: {formatCurrency(totalCost)}</span>
          </div>

          <div className="flex gap-2 mt-4">
            <button onClick={onSubmit} className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
              Create Invoice
            </button>
            <button onClick={() => { setShowForm(false); setItems([]) }} className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100">
              Cancel
            </button>
          </div>
        </div>
      )}

      <DataTable
        isLoading={isLoading}
        data={invoices || []}
        keyExtractor={inv => inv.id}
        columns={[
          { header: 'Invoice #', accessor: 'invoiceNumber' },
          { header: 'Vendor', accessor: inv => inv.vendor?.name || '-' },
          { header: 'Total', accessor: inv => formatCurrency(inv.totalCost), sortable: true },
          { header: 'Date', accessor: inv => formatDate(inv.invoiceDate), sortable: true },
          { header: 'Status', accessor: inv => (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              inv.status === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
            }`}>{inv.status}</span>
          )},
        ]}
        actions={inv => (
          <>
            <button
              onClick={() => statusMutation.mutate({ id: inv.id, status: inv.status === 'Paid' ? 'Unpaid' : 'Paid' })}
              className="text-xs font-medium text-green-600 hover:text-green-800"
            >
              Toggle Status
            </button>
            <button
              onClick={() => { if (confirm('Delete this invoice?')) deleteMutation.mutate(inv.id) }}
              className="text-xs font-medium text-red-600 hover:text-red-800"
            >
              Delete
            </button>
          </>
        )}
      />
    </div>
  )
}
