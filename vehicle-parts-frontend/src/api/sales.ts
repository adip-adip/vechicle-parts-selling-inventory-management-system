import client from './client'
import type { Sale, CreateSaleDto, CustomerSearchResultDto } from '../types/api'

export const salesApi = {
  getAll: () => client.get<Sale[]>('/staff/sales').then(r => r.data),

  getById: (id: number) => client.get<Sale>(`/staff/sales/${id}`).then(r => r.data),

  create: (data: CreateSaleDto) => client.post('/staff/sales', data).then(r => r.data),

  emailInvoice: (id: number) => client.post(`/staff/sales/${id}/email`).then(r => r.data),
}

export const staffCustomersApi = {
  search: (params: { term?: string; customerId?: number; phone?: string; vehicleNo?: string }) =>
    client.get<CustomerSearchResultDto[]>('/staff/customers/search', { params }).then(r => r.data),

  getDetails: (id: number) =>
    client.get(`/staff/customers/${id}`).then(r => r.data),

  getHistory: (id: number) =>
    client.get(`/staff/customers/${id}/history`).then(r => r.data),

  getVehicles: (id: number) =>
    client.get(`/staff/customers/${id}/vehicles`).then(r => r.data),

  getRegularCustomers: (count?: number) =>
    client.get('/staff/customers/reports/regular', { params: { count } }).then(r => r.data),

  getHighSpenders: (count?: number) =>
    client.get('/staff/customers/reports/high-spenders', { params: { count } }).then(r => r.data),

  getPendingCredits: () =>
    client.get('/staff/customers/reports/pending-credits').then(r => r.data),
}

export const staffApi = {
  createCustomerWithVehicle: (data: import('../types/api').CreateCustomerWithVehicleDto) =>
    client.post('/staff/customers', data).then(r => r.data),
}
