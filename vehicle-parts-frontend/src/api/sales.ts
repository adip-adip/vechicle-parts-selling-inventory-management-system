import client from './client'
import type { Sale, CreateSaleDto, CustomerSearchResultDto, StaffPartRequestDto, UpdatePartRequestStatusDto, AppointmentResponseDto } from '../types/api'

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

  getPartRequests: (customerId: number) =>
    client.get<StaffPartRequestDto[]>(`/staff/customers/${customerId}/part-requests`).then(r => r.data),

  getAllPartRequests: () =>
    client.get<StaffPartRequestDto[]>('/staff/part-requests').then(r => r.data),

  updatePartRequestStatus: (id: number, data: UpdatePartRequestStatusDto) =>
    client.patch(`/staff/part-requests/${id}/status`, data).then(r => r.data),

  getAppointments: (customerId: number) =>
    client.get<AppointmentResponseDto[]>(`/staff/customers/${customerId}/appointments`).then(r => r.data),

  getAllAppointments: () =>
    client.get<any[]>('/staff/appointments').then(r => r.data),

  updateAppointmentStatus: (id: number, status: string) =>
    client.patch(`/staff/appointments/${id}/status`, { status }).then(r => r.data),
}
