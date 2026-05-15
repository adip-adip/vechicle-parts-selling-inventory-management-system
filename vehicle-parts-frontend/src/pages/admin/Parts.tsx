import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { partsApi } from '../../api/parts'
import DataTable from '../../components/ui/DataTable'
import toast from 'react-hot-toast'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { VehiclePart } from '../../types/api'
import { formatCurrency } from '../../utils/format'
import { Plus } from 'lucide-react'

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  price: z.number().min(0, 'Price must be >= 0'),
  stockQuantity: z.number().int().min(0, 'Stock must be >= 0'),
  category: z.string().optional(),
})



export default function Parts() {
  const queryClient = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<VehiclePart | null>(null)

  const { data, isLoading } = useQuery({ queryKey: ['parts'], queryFn: partsApi.getAll })

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  })

  const createMutation = useMutation({
    mutationFn: (d: z.infer<typeof schema>) => partsApi.create(d),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parts'] })
      toast.success('Part created')
      setShowForm(false)
      reset()
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Failed to create'),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: z.infer<typeof schema> }) => partsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parts'] })
      toast.success('Part updated')
      setEditing(null)
      setShowForm(false)
      reset()
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Failed to update'),
  })

  const deleteMutation = useMutation({
    mutationFn: partsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parts'] })
      toast.success('Part deleted')
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Failed to delete'),
  })

  const onSubmit = (raw: any) => {
    const formData = { ...raw, price: Number(raw.price), stockQuantity: Number(raw.stockQuantity) }
    if (editing) {
      updateMutation.mutate({ id: editing.id, data: formData })
    } else {
      createMutation.mutate(formData)
    }
  }

  const openEdit = (part: VehiclePart) => {
    setEditing(part)
    setShowForm(true)
    reset({
      name: part.name,
      description: part.description || '',
      price: part.price,
      stockQuantity: part.stockQuantity,
      category: part.category || '',
    })
  }

  const openCreate = () => {
    setEditing(null)
    reset({ name: '', description: '', price: 0, stockQuantity: 0, category: '' })
    setShowForm(true)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Parts Inventory</h1>
        <button onClick={openCreate} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
          <Plus size={16} /> Add Part
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">
            {editing ? 'Edit Part' : 'New Part'}
          </h2>
          <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
              <input {...register('name')} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Price ($)</label>
              <input type="number" step="0.01" {...register('price', { valueAsNumber: true })} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Stock Quantity</label>
              <input type="number" {...register('stockQuantity', { valueAsNumber: true })} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              {errors.stockQuantity && <p className="text-red-500 text-xs mt-1">{errors.stockQuantity.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
              <input {...register('category')} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
              <textarea {...register('description')} rows={2} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="flex items-end gap-2">
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
        keyExtractor={p => p.id}
        columns={[
          { header: 'Name', accessor: 'name', sortable: true },
          { header: 'Category', accessor: 'category', sortable: true },
          { header: 'Price', accessor: p => formatCurrency(p.price), sortable: true },
          { header: 'Stock', accessor: p => (
            <span className={p.stockQuantity < 10 ? 'text-red-600 font-medium' : ''}>
              {p.stockQuantity}
            </span>
          ), sortable: true },
          { header: 'Updated', accessor: p => new Date(p.updatedAt).toLocaleDateString() },
        ]}
        onEdit={openEdit}
        onDelete={p => {
          if (confirm('Delete this part?')) deleteMutation.mutate(p.id)
        }}
      />
    </div>
  )
}
