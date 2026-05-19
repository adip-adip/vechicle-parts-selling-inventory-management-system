import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import AppLayout from './components/layout/AppLayout'

import { useAuth } from './contexts/AuthContext'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'

import AdminDashboard from './pages/admin/Dashboard'
import AdminParts from './pages/admin/Parts'
import AdminVendors from './pages/admin/Vendors'
import AdminStaff from './pages/admin/StaffManagement'
import AdminInvoices from './pages/admin/PurchaseInvoices'
import AdminReports from './pages/admin/Reports'

import StaffDashboard from './pages/staff/Dashboard'
import StaffCustomers from './pages/staff/Customers'
import StaffCustomerDetail from './pages/staff/CustomerDetail'
import StaffSales from './pages/staff/Sales'
import StaffCreateSale from './pages/staff/CreateSale'

import CustomerDashboard from './pages/customer/Dashboard'
import CustomerProfile from './pages/customer/Profile'
import CustomerVehicles from './pages/customer/Vehicles'
import CustomerAppointments from './pages/customer/Appointments'
import CustomerPartRequests from './pages/customer/PartRequests'
import CustomerReviews from './pages/customer/Reviews'

const queryClient = new QueryClient()

function RootRedirect() {
  const { user, isAuthenticated } = useAuth()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  const role = user?.role?.toLowerCase()
  if (role === 'admin') return <Navigate to="/admin" replace />
  if (role === 'staff') return <Navigate to="/staff" replace />
  if (role === 'customer') return <Navigate to="/customer" replace />
  return <Navigate to="/login" replace />
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<RootRedirect />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Admin */}
            <Route element={<ProtectedRoute role="Admin" />}>
              <Route element={<AppLayout />}>
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/parts" element={<AdminParts />} />
                <Route path="/admin/vendors" element={<AdminVendors />} />
                <Route path="/admin/staff" element={<AdminStaff />} />
                <Route path="/admin/invoices" element={<AdminInvoices />} />
                <Route path="/admin/reports" element={<AdminReports />} />
              </Route>
            </Route>

            {/* Staff */}
            <Route element={<ProtectedRoute role="Staff" />}>
              <Route element={<AppLayout />}>
                <Route path="/staff" element={<StaffDashboard />} />
                <Route path="/staff/customers" element={<StaffCustomers />} />
                <Route path="/staff/customers/:id" element={<StaffCustomerDetail />} />
                <Route path="/staff/sales" element={<StaffSales />} />
                <Route path="/staff/sales/new" element={<StaffCreateSale />} />
              </Route>
            </Route>

            {/* Customer */}
            <Route element={<ProtectedRoute role="Customer" />}>
              <Route element={<AppLayout />}>
                <Route path="/customer" element={<CustomerDashboard />} />
                <Route path="/customer/profile" element={<CustomerProfile />} />
                <Route path="/customer/vehicles" element={<CustomerVehicles />} />
                <Route path="/customer/appointments" element={<CustomerAppointments />} />
                <Route path="/customer/part-requests" element={<CustomerPartRequests />} />
                <Route path="/customer/reviews" element={<CustomerReviews />} />
              </Route>
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <Toaster position="top-right" />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
