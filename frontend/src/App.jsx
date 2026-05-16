import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './context/AuthContext'
import { TenantProvider } from './context/TenantContext'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import BottomNav from './components/layout/BottomNav'

// Route-based code splitting: each page is a separate JS chunk loaded on demand
const HomePage         = lazy(() => import('./pages/HomePage'))
const DiscoverPage     = lazy(() => import('./pages/DiscoverPage'))
const DashboardPage    = lazy(() => import('./pages/DashboardPage'))
const ProfileDetailPage = lazy(() => import('./pages/ProfileDetailPage'))
const RegisterPage     = lazy(() => import('./pages/RegisterPage'))
const LoginPage        = lazy(() => import('./pages/LoginPage'))
const MessagesPage     = lazy(() => import('./pages/MessagesPage'))
const MyProfilePage    = lazy(() => import('./pages/MyProfilePage'))
const EditProfilePage  = lazy(() => import('./pages/EditProfilePage'))

function PageLoader() {
  return (
    <div className="flex-1 flex items-center justify-center min-h-[60vh]">
      <div className="w-10 h-10 border-4 border-orange-100 border-t-primary rounded-full animate-spin" />
    </div>
  )
}

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
    <TenantProvider>
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
          <Suspense fallback={<PageLoader />}>
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
          </Suspense>
          <Footer />
          <BottomNav />
        </div>
      </BrowserRouter>
      </AuthProvider>
    </TenantProvider>
  )
}
