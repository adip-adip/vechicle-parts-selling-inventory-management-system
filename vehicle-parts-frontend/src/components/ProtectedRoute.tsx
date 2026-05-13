import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

interface Props {
  role?: string | string[]
}

export default function ProtectedRoute({ role }: Props) {
  const { isAuthenticated, user } = useAuth()

  if (!isAuthenticated) return <Navigate to="/login" replace />

  if (role) {
    const allowed = Array.isArray(role) ? role : [role]
    if (!user || !allowed.some(r => r.toLowerCase() === user.role.toLowerCase())) {
      return <Navigate to="/login" replace />
    }
  }

  return <Outlet />
}
