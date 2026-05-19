import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { customerPortalApi } from '../../api/customerPortal'
import DataTable from '../../components/ui/DataTable'
import toast from 'react-hot-toast'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { formatDate } from '../../utils/format'
import { Plus, Search, X } from 'lucide-react'
import type { AvailablePartDto } from '../../types/api'

const schema = z.object({
  partName: z.string().min(1, 'Please select a part'),
  description: z.string().optional(),
})

type FormData = z.infer<typeof schema>

export default function PartRequests() {
  const queryClient = useQueryClient()
  const [showModal, setShowModal] = useState(false)
  const [selectedPart, setSelectedPart] = useState<AvailablePartDto | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [step, setStep] = useState<'browse' | 'confirm'>('browse')

  const { data: partRequests, isLoading } = useQuery({
    queryKey: ['customer-part-requests'],
    queryFn: customerPortalApi.getPartRequests,
  })

  const { data: availableParts, isLoading: partsLoading, error: partsError, refetch: refetchParts } = useQuery({
    queryKey: ['available-parts'],
    queryFn: customerPortalApi.getAvailableParts,
    enabled: false,
    staleTime: 0,
  })

  const filteredParts = useMemo(() => {
    if (!availableParts) return []
    const q = searchQuery.toLowerCase()
    return availableParts.filter(p =>
      p.name.toLowerCase().includes(q) ||
      (p.category?.toLowerCase().includes(q))
    )
  }, [availableParts, searchQuery])

  const { register, handleSubmit, reset, setValue } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { partName: '', description: '' },
  })

  const mutation = useMutation({
    mutationFn: customerPortalApi.createPartRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer-part-requests'] })
      toast.success('Part request submitted')
      closeModal()
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Failed to submit'),
  })

  const onSubmit = (formData: FormData) => mutation.mutate(formData)

  const closeModal = () => {
    setShowModal(false)
    setSelectedPart(null)
    setSearchQuery('')
    setStep('browse')
    reset()
  }

  const handleOpenModal = () => {
    setShowModal(true)
    setStep('browse')
    setSelectedPart(null)
    setSearchQuery('')
    reset()
    refetchParts()
  }

  const handleSelectPart = (part: AvailablePartDto) => {
    setSelectedPart(part)
    setValue('partName', part.name)
    setStep('confirm')
  }

  const handleBack = () => {
    setSelectedPart(null)
    setSearchQuery('')
    setStep('browse')
    reset()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Part Requests</h1>
        <button
          onClick={handleOpenModal}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
        >
          <Plus size={16} /> Request Part
        </button>
      </div>

      {/* Browse/Confirm Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 max-h-[80vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-200">
              <h2 className="text-lg font-semibold text-slate-800">
                {step === 'browse' ? 'Select a Part' : 'Confirm Request'}
              </h2>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>

            {step === 'browse' ? (
              <>
                {/* Search */}
                <div className="p-4 pb-2">
                  <div className="relative">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search parts by name or category..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      autoFocus
                    />
                  </div>
                </div>

                {/* Parts List */}
                <div className="flex-1 overflow-y-auto p-4 pt-2">
                  {partsLoading ? (
                    <div className="text-center py-8 text-slate-500">Loading parts...</div>
                  ) : partsError ? (
                    <div className="text-center py-8 text-red-500">Failed to load parts. <button type="button" onClick={() => refetchParts()} className="underline text-blue-600">Retry</button></div>
                  ) : filteredParts.length === 0 ? (
                    <div className="text-center py-8 text-slate-500">No parts found</div>
                  ) : (
                    <div className="space-y-1">
                      {filteredParts.map(p => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => handleSelectPart(p)}
                          className="w-full text-left px-4 py-3 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-slate-800">{p.name}</span>
                            <span className="text-sm font-medium text-slate-700">Rs.{p.price.toLocaleString()}</span>
                          </div>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-xs text-slate-500">{p.category || '-'}</span>
                            <span className={`text-xs font-medium ${p.stockQuantity > 0 ? 'text-green-600' : 'text-red-500'}`}>
                              {p.stockQuantity > 0 ? `${p.stockQuantity} in stock` : 'Out of stock'}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </>
            ) : (
              /* Confirm step */
              <div className="p-4">
                {selectedPart && (
                  <div className="bg-slate-50 rounded-lg p-3 mb-4">
                    <p className="font-medium text-slate-800">{selectedPart.name}</p>
                    <p className="text-sm text-slate-500 mt-1">
                      {selectedPart.category} &middot; Rs.{selectedPart.price.toLocaleString()}
                      &middot; {selectedPart.stockQuantity > 0 ? `${selectedPart.stockQuantity} in stock` : 'Out of stock'}
                    </p>
                  </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <input type="hidden" {...register('partName')} />

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Description (optional)</label>
                    <textarea {...register('description')} rows={3} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Add any notes about this part request..." />
                  </div>

                  <div className="flex gap-2 justify-between">
                    <button type="button" onClick={handleBack} className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100">Back</button>
                    <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">Submit Request</button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}

      {/* My Part Requests */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">My Part Requests</h2>
        <DataTable
          isLoading={isLoading}
          data={partRequests || []}
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
    </div>
  )
}