import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import AdminLayout from './layouts/AdminLayout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Rooms from './pages/Rooms'
import Seats from './pages/Seats'
import Genres from './pages/Genres'
import Movies from './pages/Movies'
import Showtimes from './pages/Showtimes'
import Sliders from './pages/Sliders'
import Combos from './pages/Combos'
import Promotions from './pages/Promotions'
import Members from './pages/Members'
import Staff from './pages/Staff'
import Invoices from './pages/Invoices'
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--bg-primary)' }}>
        <div className="spinner" style={{ width: 40, height: 40 }}></div>
      </div>
    )
  }
  return user ? children : <Navigate to="/login" replace />
}

function AdminRoute({ children }) {
  const { isAdmin } = useAuth()
  return isAdmin ? children : <Navigate to="/" replace />
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={
        <ProtectedRoute>
          <AdminLayout />
        </ProtectedRoute>
      }>
        <Route index element={<Dashboard />} />
        <Route path="rooms" element={<Rooms />} />
        <Route path="seats" element={<Seats />} />
        <Route path="genres" element={<Genres />} />
        <Route path="movies" element={<Movies />} />
        <Route path="showtimes" element={<Showtimes />} />
        <Route path="sliders" element={<Sliders />} />
        <Route path="combos" element={<Combos />} />
        <Route path="promotions" element={<Promotions />} />
        <Route path="members" element={<Members />} />
        <Route path="staff" element={
          <AdminRoute><Staff /></AdminRoute>
        } />
        <Route path="invoices" element={<Invoices />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
