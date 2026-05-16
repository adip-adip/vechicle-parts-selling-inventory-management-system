import client from './client'
import type { PurchaseInvoice, CreatePurchaseInvoiceDto } from '../types/api'

export const invoicesApi = {
  getAll: () => client.get<PurchaseInvoice[]>('/purchase-invoices').then(r => r.data),

  getById: (id: number) => client.get<PurchaseInvoice>(`/purchase-invoices/${id}`).then(r => r.data),

  create: (data: CreatePurchaseInvoiceDto) =>
    client.post<PurchaseInvoice>('/purchase-invoices', data).then(r => r.data),

  updateStatus: (id: number, status: string) =>
    client.patch<PurchaseInvoice>(`/purchase-invoices/${id}/status`, status, {
      headers: { 'Content-Type': 'application/json' },
    }).then(r => r.data),

  delete: (id: number) => client.delete(`/purchase-invoices/${id}`).then(r => r.data),
}
