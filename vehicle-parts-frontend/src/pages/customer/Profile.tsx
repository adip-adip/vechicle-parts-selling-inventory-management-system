import { useMutation } from '@tanstack/react-query'
import { customerPortalApi } from '../../api/customerPortal'
import toast from 'react-hot-toast'
import { useForm } from 'react-hook-form'

export default function Profile() {
  const { register, handleSubmit } = useForm()

  const mutation = useMutation({
    mutationFn: (data: any) => customerPortalApi.updateProfile(data),
    onSuccess: () => toast.success('Profile updated'),
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Failed to update'),
  })

  const onSubmit = (data: any) => mutation.mutate(data)

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">My Profile</h1>

      <div className="bg-white rounded-xl shadow-sm p-6 max-w-xl">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">First Name</label>
              <input {...register('firstName')} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Last Name</label>
              <input {...register('lastName')} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
            <input {...register('phone')} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
            <input {...register('address')} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
            Update Profile
          </button>
        </form>
      </div>
    </div>
  )
}
