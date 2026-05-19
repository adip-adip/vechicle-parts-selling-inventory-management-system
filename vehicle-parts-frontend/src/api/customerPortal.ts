import client from './client'
import type {
  UpdateProfileDto, CreateVehicleDto, UpdateVehicleDto, CreateAppointmentDto,
  AppointmentResponseDto, CreatePartRequestDto, PartRequestResponseDto,
  CreateReviewDto, ReviewResponseDto, CustomerHistoryDto, LoyaltyCheckDto,
  CustomerProfileDto, VehicleDto, AvailablePartDto,
} from '../types/api'

export const customerPortalApi = {
  getProfile: () =>
    client.get<CustomerProfileDto>('/Customer/profile').then(r => r.data),

  updateProfile: (data: UpdateProfileDto) =>
    client.put('/Customer/profile', data).then(r => r.data),

  getVehicles: () =>
    client.get<VehicleDto[]>('/Customer/vehicles').then(r => r.data),

  getReviews: () =>
    client.get<ReviewResponseDto[]>('/Customer/reviews').then(r => r.data),

  addVehicle: (data: CreateVehicleDto) =>
    client.post<VehicleDto>('/Customer/vehicles', data).then(r => r.data),

  updateVehicle: (vehicleId: number, data: UpdateVehicleDto) =>
    client.put(`/Customer/vehicles/${vehicleId}`, data).then(r => r.data),

  deleteVehicle: (vehicleId: number) =>
    client.delete(`/Customer/vehicles/${vehicleId}`).then(r => r.data),

  createAppointment: (data: CreateAppointmentDto) =>
    client.post<AppointmentResponseDto>('/Customer/appointments', data).then(r => r.data),

  getAppointments: () =>
    client.get<AppointmentResponseDto[]>('/Customer/appointments').then(r => r.data),

  createPartRequest: (data: CreatePartRequestDto) =>
    client.post<PartRequestResponseDto>('/Customer/part-requests', data).then(r => r.data),

  getPartRequests: () =>
    client.get<PartRequestResponseDto[]>('/Customer/part-requests').then(r => r.data),

  createReview: (data: CreateReviewDto) =>
    client.post<ReviewResponseDto>('/Customer/reviews', data).then(r => r.data),

  getHistory: () =>
    client.get<CustomerHistoryDto>('/Customer/history').then(r => r.data),

  getAvailableParts: () =>
    client.get<AvailablePartDto[]>('/Customer/available-parts').then(r => r.data),

  checkLoyalty: (amount: number) =>
    client.get<LoyaltyCheckDto>('/Customer/loyalty-check', { params: { amount } }).then(r => r.data),
}
