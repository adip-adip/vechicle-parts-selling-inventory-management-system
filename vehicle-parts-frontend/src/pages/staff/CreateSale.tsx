import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { salesApi, staffCustomersApi } from '../../api/sales'
import { partsApi } from '../../api/parts'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import { X, Search } from 'lucide-react'
import { formatCurrency } from '../../utils/format'

interface SaleItemEntry {
  vehiclePartId: number
  vehiclePartName: string
  quantity: number
  unitPrice: number
  subtotal: number
}

export default function CreateSale() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [customerSearch, setCustomerSearch] = useState('')
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null)
  const [selectedCustomerName, setSelectedCustomerName] = useState('')
  const [items, setItems] = useState<SaleItemEntry[]>([])

  const { data: searchResults } = useQuery({
    queryKey: ['customer-search-sale', customerSearch],
    queryFn: () => staffCustomersApi.search({ term: customerSearch }),
    enabled: customerSearch.length > 1,
  })

  const { data: parts } = useQuery({ queryKey: ['parts'], queryFn: partsApi.getAll })

  const createMutation = useMutation({
    mutationFn: salesApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff-sales'] })
      toast.success('Sale created')
      navigate('/staff/sales')
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Failed to create sale'),
  })

  const addItem = (partId: number) => {
    const part = parts?.find(p => p.id === partId)
    if (!part) return
    if (items.find(i => i.vehiclePartId === partId)) {
      toast.error('Item already added')
      return
    }
    setItems([...items, {
      vehiclePartId: part.id,
      vehiclePartName: part.name,
      quantity: 1,
      unitPrice: part.price,
      subtotal: part.price,
    }])
  }

  const updateQty = (idx: number, qty: number) => {
    setItems(items.map((item, i) =>
      i === idx ? { ...item, quantity: qty, subtotal: qty * item.unitPrice } : item
    ))
  }

  const removeItem = (idx: number) => {
    setItems(items.filter((_, i) => i !== idx))
  }

  const totalAmount = items.reduce((s, i) => s + i.subtotal, 0)

  const handleCreate = () => {
    if (!selectedCustomerId) { toast.error('Select a customer'); return }
    if (items.length === 0) { toast.error('Add at least one item'); return }
    createMutation.mutate({
      customerId: selectedCustomerId,
      items: items.map(i => ({ vehiclePartId: i.vehiclePartId, quantity: i.quantity })),
    })
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">New Sale</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Customer</h2>
          {selectedCustomerId ? (
            <div className="flex items-center justify-between bg-blue-50 p-3 rounded-lg mb-4">
              <span className="font-medium">{selectedCustomerName}</span>
              <button onClick={() => { setSelectedCustomerId(null); setSelectedCustomerName('') }} className="text-red-500 text-sm">Change</button>
            </div>
          ) : (
            <>
              <div className="relative mb-4">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search customer by name, phone..."
                  value={customerSearch}
                  onChange={e => setCustomerSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              {searchResults && searchResults.length > 0 && (
                <ul className="border border-slate-200 rounded-lg divide-y divide-slate-200">
                  {searchResults.map(c => (
                    <li
                      key={c.id}
                      onClick={() => { setSelectedCustomerId(c.id); setSelectedCustomerName(`${c.firstName} ${c.lastName}`); setCustomerSearch('') }}
                      className="px-3 py-2 text-sm hover:bg-slate-50 cursor-pointer"
                    >
                      {c.firstName} {c.lastName} - {c.phone} ({c.registrationNumbers.join(', ')})
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Items</h2>

          <div className="mb-4">
            <select
              onChange={e => { if (e.target.value) addItem(Number(e.target.value)); e.target.value = '' }}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              defaultValue=""
            >
              <option value="" disabled>Select a part to add...</option>
              {parts?.map(p => (
                <option key={p.id} value={p.id} disabled={p.stockQuantity === 0}>
                  {p.name} - {formatCurrency(p.price)} ({p.stockQuantity} in stock)
                </option>
              ))}
            </select>
          </div>

          {items.length === 0 ? (
            <p className="text-sm text-slate-400">No items added yet</p>
          ) : (
            <div className="space-y-2">
              {items.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 bg-slate-50 p-2 rounded-lg">
                  <span className="flex-1 text-sm">{item.vehiclePartName}</span>
                  <input
                    type="number"
                    min={1}
                    value={item.quantity}
                    onChange={e => updateQty(idx, Number(e.target.value))}
                    className="w-16 px-2 py-1 border border-slate-300 rounded text-sm text-center"
                  />
                  <span className="text-sm font-medium w-24 text-right">{formatCurrency(item.subtotal)}</span>
                  <button onClick={() => removeItem(idx)} className="text-red-500"><X size={16} /></button>
                </div>
              ))}
            </div>
          )}

          <div className="border-t mt-4 pt-4 flex justify-between items-center">
            <span className="font-semibold">Total</span>
            <span className="text-xl font-bold">{formatCurrency(totalAmount)}</span>
          </div>
        </div>
      </div>

      <div className="mt-6 flex gap-3">
        <button
          onClick={handleCreate}
          disabled={createMutation.isPending}
          className="bg-blue-600 text-white px-8 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
        >
          {createMutation.isPending ? 'Creating...' : 'Create Sale'}
        </button>
        <button onClick={() => navigate('/staff/sales')} className="px-4 py-2 rounded-lg font-medium text-slate-600 hover:bg-slate-100">
          Cancel
        </button>
      </div>
    </div>
  )
}
