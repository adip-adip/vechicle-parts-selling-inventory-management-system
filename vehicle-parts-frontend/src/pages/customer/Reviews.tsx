import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { customerPortalApi } from '../../api/customerPortal'
import DataTable from '../../components/ui/DataTable'
import toast from 'react-hot-toast'
import { useForm } from 'react-hook-form'
import { formatDate } from '../../utils/format'
import { Plus, Star } from 'lucide-react'
import client from '../../api/client'

const averageRating = (reviews: any[]) => {
  if (!reviews.length) return 0
  return reviews.reduce((s: number, r: any) => s + r.rating, 0) / reviews.length
}

export default function Reviews() {
  const queryClient = useQueryClient()
  const [showForm, setShowForm] = useState(false)

  const { data: reviews, isLoading } = useQuery({
    queryKey: ['customer-reviews'],
    queryFn: () => client.get('/Customer/reviews').then(r => r.data),
  })

  const { register, handleSubmit, reset } = useForm()

  const createMutation = useMutation({
    mutationFn: (data: any) => customerPortalApi.createReview({ rating: Number(data.rating), comment: data.comment }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer-reviews'] })
      toast.success('Review submitted')
      setShowForm(false)
      reset()
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Failed to submit'),
  })

  const onSubmit = (data: any) => createMutation.mutate(data)

  const avg = Array.isArray(reviews) ? averageRating(reviews) : 0

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">My Reviews</h1>
          {Array.isArray(reviews) && reviews.length > 0 && (
            <p className="text-sm text-slate-500 mt-1">
              Average rating: {avg.toFixed(1)} / 5 ({reviews.length} review{reviews.length !== 1 ? 's' : ''})
            </p>
          )}
        </div>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
          <Plus size={16} /> Write Review
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6 max-w-lg">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Write a Review</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Rating (1-5)</label>
              <input type="number" min={1} max={5} {...register('rating')} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Comment</label>
              <textarea {...register('comment')} rows={4} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
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
        data={Array.isArray(reviews) ? reviews : []}
        keyExtractor={(r: any) => r.id}
        columns={[
          { header: 'Rating', accessor: (r: any) => (
            <span className="flex items-center gap-1">
              <Star size={14} className="text-yellow-500 fill-yellow-500" />
              {r.rating}/5
            </span>
          ), sortable: true },
          { header: 'Comment', accessor: 'comment' },
          { header: 'Date', accessor: (r: any) => formatDate(r.createdAt), sortable: true },
        ]}
      />
    </div>
  )
}
