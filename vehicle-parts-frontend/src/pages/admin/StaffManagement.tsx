import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '../../api/reports'
import { authApi } from '../../api/auth'
import DataTable from '../../components/ui/DataTable'
import toast from 'react-hot-toast'
import { useForm } from 'react-hook-form'
import { Plus } from 'lucide-react'

export default function StaffManagement() {
  const queryClient = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const { register, handleSubmit, reset } = useForm()

  const { data, isLoading } = useQuery({ queryKey: ['staff'], queryFn: adminApi.getStaff })

  const deleteMutation = useMutation({
    mutationFn: adminApi.deleteStaff,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff'] })
      toast.success('Staff member removed')
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Failed to delete'),
  })

  const createMutation = useMutation({
    mutationFn: (data: any) => authApi.registerStaff(data),
    onSuccess: () => {
      toast.success('Staff member created')
      queryClient.invalidateQueries({ queryKey: ['staff'] })
      setShowForm(false)
      reset()
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Failed to create'),
  })

  const onSubmit = (data: any) => createMutation.mutate(data)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Staff Management</h1>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
          <Plus size={16} /> Add Staff
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Register New Staff</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">First Name</label>
              <input {...register('firstName', { required: true })} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Last Name</label>
              <input {...register('lastName', { required: true })} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <input type="email" {...register('email', { required: true })} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
              <input type="password" {...register('password', { required: true })} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
            </div>
            <div className="flex gap-2">
              <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">Create</button>
              <button type="button" onClick={() => { setShowForm(false); reset() }} className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <DataTable
        isLoading={isLoading}
        data={data || []}
        keyExtractor={s => s.id}
        columns={[
          { header: 'First Name', accessor: 'firstName', sortable: true },
          { header: 'Last Name', accessor: 'lastName', sortable: true },
          { header: 'Email', accessor: 'email' },
          { header: 'Username', accessor: 'userName' },
        ]}
        onDelete={s => {
          if (confirm(`Remove ${s.firstName} ${s.lastName} from staff?`)) deleteMutation.mutate(s.id)
        }}
      />
    </div>
  )
}
