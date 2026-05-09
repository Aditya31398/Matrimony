import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './context/AuthContext'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import BottomNav from './components/layout/BottomNav'
import HomePage from './pages/HomePage'
import DiscoverPage from './pages/DiscoverPage'
import DashboardPage from './pages/DashboardPage'
import ProfileDetailPage from './pages/ProfileDetailPage'
import RegisterPage from './pages/RegisterPage'
import LoginPage from './pages/LoginPage'
import MessagesPage from './pages/MessagesPage'
import MyProfilePage from './pages/MyProfilePage'
import EditProfilePage from './pages/EditProfilePage'

function RootRedirect() {
  const { isLoggedIn } = useAuth()
  return <Navigate to={isLoggedIn ? '/dashboard' : '/login'} replace />
}

function ProtectedRoute({ children }) {
  const { isLoggedIn } = useAuth()
  return isLoggedIn ? children : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen flex flex-col bg-surface">
          <Toaster
            position="top-center"
            toastOptions={{
              duration: 3000,
              style: { borderRadius: '16px', fontWeight: 600, fontSize: '14px' },
              success: { iconTheme: { primary: '#ae3115', secondary: '#fff' } },
            }}
          />
          <Navbar />
          <AnimatePresence mode="wait">
            <Routes>
              <Route path="/" element={<RootRedirect />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/home" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
              <Route path="/discover" element={<ProtectedRoute><DiscoverPage /></ProtectedRoute>} />
              <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
              <Route path="/profile/:id" element={<ProtectedRoute><ProfileDetailPage /></ProtectedRoute>} />
              <Route path="/messages" element={<ProtectedRoute><MessagesPage /></ProtectedRoute>} />
              <Route path="/messages/:conversationId" element={<ProtectedRoute><MessagesPage /></ProtectedRoute>} />
              <Route path="/my-profile" element={<ProtectedRoute><MyProfilePage /></ProtectedRoute>} />
              <Route path="/edit-profile" element={<ProtectedRoute><EditProfilePage /></ProtectedRoute>} />
            </Routes>
          </AnimatePresence>
          <Footer />
          <BottomNav />
        </div>
      </BrowserRouter>
    </AuthProvider>
  )
}
