// Auth
export interface LoginDto {
  email: string
  password: string
}

export interface LoginResponse {
  success: boolean
  message?: string
  token?: string
  userId?: string
  email?: string
  firstName?: string
  lastName?: string
  role?: string
}

export interface RegisterDto {
  firstName: string
  lastName: string
  email: string
  password: string
}

export interface RegisterCustomerDto extends RegisterDto {
  phone: string
  address?: string
}

// Parts
export interface VehiclePart {
  id: number
  name: string
  description?: string
  price: number
  stockQuantity: number
  category?: string
  createdAt: string
  updatedAt: string
}

export interface CreatePartDto {
  name: string
  description?: string
  price: number
  stockQuantity: number
  category?: string
}

export type UpdatePartDto = CreatePartDto

// Vendors
export interface Vendor {
  id: number
  name: string
  contactPerson?: string
  phone: string
  email?: string
  address?: string
  paymentTerms?: string
  purchaseInvoices?: PurchaseInvoice[]
}

export interface CreateVendorDto {
  name: string
  contactPerson?: string
  phone: string
  email?: string
  address?: string
  paymentTerms?: string
}

export type UpdateVendorDto = CreateVendorDto

// Purchase Invoices
export interface PurchaseInvoice {
  id: number
  invoiceNumber: string
  vendorId: number
  vendor?: Vendor
  totalCost: number
  invoiceDate: string
  status: string
  items?: PurchaseInvoiceItem[]
}

export interface PurchaseInvoiceItem {
  id: number
  purchaseInvoiceId: number
  vehiclePartId: number
  vehiclePart?: VehiclePart
  quantity: number
  unitCost: number
  subtotal: number
}

export interface CreatePurchaseInvoiceDto {
  vendorId: number
  invoiceDate?: string
  status: string
  items: CreatePurchaseInvoiceItemDto[]
}

export interface CreatePurchaseInvoiceItemDto {
  vehiclePartId: number
  quantity: number
  unitCost: number
}

// Sales
export interface Sale {
  id: number
  invoiceNumber?: string
  totalAmount: number
  saleDate: string
  customerId: number
  customer?: Customer
  paymentStatus: string
  saleItems?: SaleItem[]
}

export interface SaleItem {
  id: number
  saleId: number
  vehiclePartId: number
  vehiclePart?: VehiclePart
  quantity: number
  unitPrice: number
  subtotal: number
}

export interface CreateSaleDto {
  customerId: number
  items: CreateSaleItemDto[]
}

export interface CreateSaleItemDto {
  vehiclePartId: number
  quantity: number
}

// Customers
export interface Customer {
  id: number
  firstName: string
  lastName: string
  email: string
  phone: string
  address?: string
  userId?: string
}

export interface CustomerDetailsDto extends Customer {
  vehicles: VehicleDto[]
}

export interface VehicleDto {
  id: number
  registrationNumber: string
  make: string
  model: string
  year: number
  vin?: string
}

export interface VehicleEntry {
  registrationNumber: string
  make: string
  model: string
  year: number
  vin?: string
}

export interface CreateCustomerWithVehicleDto {
  firstName: string
  lastName: string
  email: string
  phone: string
  address?: string
  vehicles: VehicleEntry[]
}

export interface CustomerSearchResultDto {
  id: number
  firstName: string
  lastName: string
  email: string
  phone: string
  vehicleCount: number
  saleCount: number
  registrationNumbers: string[]
}

export interface CustomerProfileDto {
  id: number
  firstName: string
  lastName: string
  email: string
  phone: string
  address?: string
  totalSales: number
  totalSpent: number
}

export interface CustomerHistoryDto {
  id: number
  firstName: string
  lastName: string
  email: string
  phone: string
  totalSales: number
  totalSpent: number
  sales: SaleSummaryDto[]
}

export interface SaleSummaryDto {
  saleId: number
  invoiceNumber?: string
  totalAmount: number
  saleDate: string
  paymentStatus: string
  itemCount: number
  partsPurchased: string[]
}

export interface RegularCustomerDto {
  id: number
  firstName: string
  lastName: string
  email: string
  phone: string
  totalPurchases: number
  totalSpent: number
}

export interface HighSpenderDto {
  id: number
  firstName: string
  lastName: string
  email: string
  phone: string
  totalSpent: number
  totalPurchases: number
  averagePerPurchase: number
}

export interface PendingCreditDto {
  id: number
  firstName: string
  lastName: string
  email: string
  phone: string
  pendingSales: PendingSaleDto[]
  totalPendingAmount: number
}

export interface PendingSaleDto {
  saleId: number
  invoiceNumber?: string
  totalAmount: number
  saleDate: string
}

// Staff
export interface StaffMember {
  id: string
  firstName: string
  lastName: string
  email: string
  userName: string
}

export interface StaffDetails {
  id: string
  firstName: string
  lastName: string
  email: string
  roles: string[]
}

// Reports
export interface DailyReport {
  date: string
  totalSales: number
  transactionCount: number
  sales: Sale[]
}

export interface MonthlyReport {
  year: number
  month: number
  totalSales: number
  transactionCount: number
  dailyBreakdown: DailyReport[]
}

export interface YearlyReport {
  year: number
  totalSales: number
  transactionCount: number
  monthlyBreakdown: MonthlyReport[]
}

// Customer Portal
export interface UpdateProfileDto {
  firstName?: string
  lastName?: string
  phone?: string
  address?: string
}

export interface CreateVehicleDto {
  registrationNumber: string
  make: string
  model: string
  year: number
  vin?: string
}

export interface UpdateVehicleDto {
  make?: string
  model?: string
  year?: number
  vin?: string
}

export interface CreateAppointmentDto {
  vehicleId?: number
  serviceType: string
  appointmentDate: string
  notes?: string
}

export interface AppointmentResponseDto {
  id: number
  serviceType: string
  appointmentDate: string
  status: string
  notes?: string
  vehicleRegistration?: string
  createdAt: string
}

export interface AvailablePartDto {
  id: number
  name: string
  category?: string
  price: number
  stockQuantity: number
}

export interface CreatePartRequestDto {
  partName: string
  description?: string
}

export interface PartRequestResponseDto {
  id: number
  partName: string
  description?: string
  status: string
  requestedAt: string
}

export interface CreateReviewDto {
  rating: number
  comment?: string
  appointmentId?: number
}

export interface ReviewResponseDto {
  id: number
  rating: number
  comment?: string
  createdAt: string
  appointmentId?: number
  serviceType?: string
}

export interface LoyaltyCheckDto {
  originalAmount: number
  discountApplied: number
  discountedAmount: number
  youSave: number
}

export interface StaffPartRequestDto {
  id: number
  customerId: number
  customerName: string
  customerEmail: string
  partName: string
  description?: string
  status: string
  requestedAt: string
}

export interface UpdatePartRequestStatusDto {
  status: string
}
