import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { customerPortalApi } from '../../api/customerPortal'
import DataTable from '../../components/ui/DataTable'
import toast from 'react-hot-toast'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { formatDate } from '../../utils/format'
import { Plus } from 'lucide-react'

const schema = z.object({
  partName: z.string().min(1, 'Part name is required'),
  description: z.string().optional(),
})

type FormData = z.infer<typeof schema>

export default function PartRequests() {
  const queryClient = useQueryClient()
  const [showForm, setShowForm] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['customer-part-requests'],
    queryFn: customerPortalApi.getPartRequests,
  })

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const mutation = useMutation({
    mutationFn: customerPortalApi.createPartRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer-part-requests'] })
      toast.success('Part request submitted')
      setShowForm(false)
      reset()
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Failed to submit'),
  })

  const onSubmit = (formData: FormData) => mutation.mutate(formData)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Part Requests</h1>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
          <Plus size={16} /> Request Part
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6 max-w-lg">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">New Part Request</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Part Name</label>
              <input {...register('partName')} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              {errors.partName && <p className="text-red-500 text-xs">{errors.partName.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
              <textarea {...register('description')} rows={3} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="flex gap-2">
              <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">Submit</button>
              <button type="button" onClick={() => { setShowForm(false); reset() }} className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <DataTable
        isLoading={isLoading}
        data={data || []}
        keyExtractor={r => r.id}
        columns={[
          { header: 'Part Name', accessor: 'partName', sortable: true },
          { header: 'Description', accessor: 'description' },
          { header: 'Status', accessor: r => (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              r.status === 'Approved' ? 'bg-green-100 text-green-700' :
              r.status === 'Fulfilled' ? 'bg-blue-100 text-blue-700' :
              'bg-yellow-100 text-yellow-700'
            }`}>{r.status}</span>
          )},
          { header: 'Requested', accessor: r => formatDate(r.requestedAt) },
        ]}
      />
    </div>
  )
}
