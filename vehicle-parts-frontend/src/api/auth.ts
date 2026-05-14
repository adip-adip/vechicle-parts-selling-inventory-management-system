import client from './client'
import type { LoginDto, LoginResponse, RegisterCustomerDto, RegisterDto } from '../types/api'

export const authApi = {
  login: (data: LoginDto) => client.post<LoginResponse>('/Auth/login', data).then(r => r.data),

  registerAdmin: (data: RegisterDto) => client.post('/Auth/register-admin', data).then(r => r.data),

  registerStaff: (data: RegisterDto) => client.post('/Auth/register-staff', data).then(r => r.data),

  registerCustomer: (data: RegisterCustomerDto) =>
    client.post('/Auth/register-customer', data).then(r => r.data),

  uploadProfile: (file: File) => {
    const form = new FormData()
    form.append('file', file)
    return client.post('/Auth/profile/upload', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then(r => r.data)
  },

  downloadProfile: () =>
    client.get('/Auth/profile/download', { responseType: 'blob' }).then(r => r.data),
}
