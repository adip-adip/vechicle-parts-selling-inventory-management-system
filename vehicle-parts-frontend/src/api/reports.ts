import client from './client'
import type { StaffMember, StaffDetails, DailyReport, MonthlyReport, YearlyReport } from '../types/api'

export const adminApi = {
  getStaff: () => client.get<StaffMember[]>('/admin/staff').then(r => r.data),

  getStaffDetails: (id: string) =>
    client.get<StaffDetails>(`/admin/staff/${id}`).then(r => r.data),

  deleteStaff: (id: string) => client.delete(`/admin/staff/${id}`).then(r => r.data),
}

export const reportsApi = {
  getDaily: (date?: string) =>
    client.get<DailyReport>('/reports/daily', { params: { date } }).then(r => r.data),

  getMonthly: (year?: number, month?: number) =>
    client.get<MonthlyReport>('/reports/monthly', { params: { year, month } }).then(r => r.data),

  getYearly: (year?: number) =>
    client.get<YearlyReport>('/reports/yearly', { params: { year } }).then(r => r.data),
}
