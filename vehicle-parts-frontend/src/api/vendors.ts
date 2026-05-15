import client from './client'
import type { Vendor, CreateVendorDto, UpdateVendorDto } from '../types/api'

export const vendorsApi = {
  getAll: (search?: string) =>
    client.get<Vendor[]>('/Vendor', { params: { search } }).then(r => r.data),

  getById: (id: number) => client.get<Vendor>(`/Vendor/${id}`).then(r => r.data),

  create: (data: CreateVendorDto) => client.post<Vendor>('/Vendor', data).then(r => r.data),

  update: (id: number, data: UpdateVendorDto) =>
    client.put<Vendor>(`/Vendor/${id}`, data).then(r => r.data),

  delete: (id: number) => client.delete(`/Vendor/${id}`).then(r => r.data),
}
