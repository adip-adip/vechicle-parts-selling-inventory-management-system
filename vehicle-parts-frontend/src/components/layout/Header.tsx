import { useAuth } from '../../contexts/AuthContext'
import { LogOut } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function Header() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-800">
          Welcome, {user?.firstName}
        </h2>
      </div>
      <button
        onClick={handleLogout}
        className="flex items-center gap-2 text-sm text-slate-600 hover:text-red-600 transition-colors"
      >
        <LogOut size={18} />
        Logout
      </button>
    </header>
  )
}
