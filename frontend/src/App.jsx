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
              <Route path="/home" element={<HomePage />} />
              <Route path="/discover" element={<DiscoverPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/profile/:id" element={<ProfileDetailPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/messages" element={<MessagesPage />} />
              <Route path="/messages/:conversationId" element={<MessagesPage />} />
              <Route path="/my-profile" element={<MyProfilePage />} />
              <Route path="/edit-profile" element={<EditProfilePage />} />
            </Routes>
          </AnimatePresence>
          <Footer />
          <BottomNav />
        </div>
      </BrowserRouter>
    </AuthProvider>
  )
}
