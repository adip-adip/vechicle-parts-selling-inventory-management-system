import client from './client'
import type { VehiclePart, CreatePartDto, UpdatePartDto } from '../types/api'

export const partsApi = {
  getAll: () => client.get<VehiclePart[]>('/Parts').then(r => r.data),

  getById: (id: number) => client.get<VehiclePart>(`/Parts/${id}`).then(r => r.data),

  getLowStock: () => client.get<VehiclePart[]>('/Parts/low-stock').then(r => r.data),

  create: (data: CreatePartDto) => client.post<VehiclePart>('/Parts', data).then(r => r.data),

  update: (id: number, data: UpdatePartDto) =>
    client.put<VehiclePart>(`/Parts/${id}`, data).then(r => r.data),

  delete: (id: number) => client.delete(`/Parts/${id}`).then(r => r.data),
}
