import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { customerPortalApi } from '../../api/customerPortal'
import DataTable from '../../components/ui/DataTable'
import toast from 'react-hot-toast'
import { Car, Plus, Pencil, Trash2 } from 'lucide-react'
import type { VehicleDto, CreateVehicleDto } from '../../types/api'

export default function Vehicles() {
  const queryClient = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<VehicleDto | null>(null)

  const { data: vehicles, isLoading } = useQuery({
    queryKey: ['customer-vehicles'],
    queryFn: () => customerPortalApi.getVehicles(),
  })

  const addMutation = useMutation({
    mutationFn: (data: CreateVehicleDto) => customerPortalApi.addVehicle(data),
    onSuccess: () => {
      toast.success('Vehicle added')
      queryClient.invalidateQueries({ queryKey: ['customer-vehicles'] })
      setShowForm(false)
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Failed to add vehicle'),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => customerPortalApi.updateVehicle(id, data),
    onSuccess: () => {
      toast.success('Vehicle updated')
      queryClient.invalidateQueries({ queryKey: ['customer-vehicles'] })
      setEditing(null)
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Failed to update vehicle'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => customerPortalApi.deleteVehicle(id),
    onSuccess: () => {
      toast.success('Vehicle deleted')
      queryClient.invalidateQueries({ queryKey: ['customer-vehicles'] })
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Failed to delete vehicle'),
  })

  const [form, setForm] = useState({ registrationNumber: '', make: '', model: '', year: '', vin: '' })

  const resetForm = () => setForm({ registrationNumber: '', make: '', model: '', year: '', vin: '' })

  const handleEdit = (v: VehicleDto) => {
    setEditing(v)
    setForm({
      registrationNumber: v.registrationNumber,
      make: v.make,
      model: v.model,
      year: String(v.year),
      vin: v.vin || '',
    })
  }

  const handleSubmit = () => {
    const data = {
      registrationNumber: form.registrationNumber,
      make: form.make,
      model: form.model,
      year: Number(form.year),
      vin: form.vin || undefined,
    }

    if (editing) {
      updateMutation.mutate({ id: editing.id, data })
    } else {
      addMutation.mutate(data)
    }
  }

  const isMutating = addMutation.isPending || updateMutation.isPending

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-800">My Vehicles</h1>
        <button
          onClick={() => { setShowForm(!showForm); setEditing(null); resetForm() }}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
        >
          <Plus size={16} /> Add Vehicle
        </button>
      </div>

      {(showForm || editing) && (
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Car size={20} className="text-blue-600" />
            <h2 className="text-lg font-semibold text-slate-800">
              {editing ? 'Edit Vehicle' : 'Add Vehicle'}
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Registration #</label>
              <input
                value={form.registrationNumber}
                onChange={e => setForm(f => ({ ...f, registrationNumber: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Make</label>
              <input
                value={form.make}
                onChange={e => setForm(f => ({ ...f, make: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Model</label>
              <input
                value={form.model}
                onChange={e => setForm(f => ({ ...f, model: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Year</label>
              <input
                type="number"
                value={form.year}
                onChange={e => setForm(f => ({ ...f, year: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">VIN</label>
              <input
                value={form.vin}
                onChange={e => setForm(f => ({ ...f, vin: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              />
            </div>
            <div className="flex items-end gap-2">
              <button
                onClick={handleSubmit}
                disabled={isMutating}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
              >
                {editing ? 'Update' : 'Add'} Vehicle
              </button>
              <button
                onClick={() => { setShowForm(false); setEditing(null); resetForm() }}
                className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <DataTable
        isLoading={isLoading}
        data={Array.isArray(vehicles) ? vehicles : []}
        keyExtractor={(v: VehicleDto) => v.id}
        columns={[
          { header: 'Registration #', accessor: 'registrationNumber', sortable: true },
          { header: 'Make', accessor: 'make', sortable: true },
          { header: 'Model', accessor: 'model', sortable: true },
          { header: 'Year', accessor: 'year', sortable: true },
          { header: 'VIN', accessor: 'vin' },
        ]}
        onEdit={(v: VehicleDto) => handleEdit(v)}
        onDelete={(v: VehicleDto) => {
          if (confirm(`Delete vehicle ${v.registrationNumber}?`)) deleteMutation.mutate(v.id)
        }}
      />
    </div>
  )
}
