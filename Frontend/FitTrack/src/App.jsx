import { Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'
import LoginPage from './pages/public/LoginPage'
import RegisterPage from './pages/public/RegisterPage'
import DashboardPage from './pages/private/DashboardPage'
import ExercisesPage from './pages/private/ExercisesPage'
import RoutinesPage from './pages/private/RoutinesPage'
import WorkoutSessionsPage from './pages/private/WorkoutSessionsPage'
import PublicRoute from './components/PublicRoute'
import Layout from './components/Layout'
import LandingPage from './pages/public/LandingPage'
import AboutPage from './pages/public/AboutPage'
import PrivacyPage from './pages/public/PrivacyPage'
import TermsPage from './pages/public/TermsPage'
import ProfilePage from './pages/private/ProfilePage'
import ExerciseRequestsPage from './pages/private/ExerciseRequestsPage'
import AdminRequestsPage from './pages/private/AdminRequestsPage'


export default function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
      <Route path="/" element={<PublicRoute><LandingPage /></PublicRoute>} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/privacy" element={<PrivacyPage />} />
      <Route path="/terms" element={<TermsPage />} />

      {/* Protected routes */}
      <Route path="/dashboard" element={
        <ProtectedRoute><Layout><DashboardPage /></Layout></ProtectedRoute>} />
      <Route path="/exercises" element={
        <ProtectedRoute><Layout><ExercisesPage /></Layout></ProtectedRoute>} />
      <Route path="/routines" element={
        <ProtectedRoute><Layout><RoutinesPage /></Layout></ProtectedRoute>} />
      <Route path="/sessions" element={
        <ProtectedRoute><Layout><WorkoutSessionsPage /></Layout></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Layout><ProfilePage /></Layout></ProtectedRoute>} />
      <Route path="/requests" element={
        <ProtectedRoute><Layout><ExerciseRequestsPage /></Layout></ProtectedRoute>
      } />
      <Route path="/admin/requests" element={
        <ProtectedRoute><Layout><AdminRequestsPage /></Layout></ProtectedRoute>
      } />
      {/* Default redirect */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}


