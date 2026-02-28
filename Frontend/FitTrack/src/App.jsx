import { Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import ExercisesPage from './pages/ExercisesPage'
import RoutinesPage from './pages/RoutinesPage'
import WorkoutSessionsPage from './pages/WorkoutSessionsPage'
import PublicRoute from './components/PublicRoute'
import Layout from './components/Layout'


export default function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />

      {/* Protected routes */}
      <Route path="/dashboard" element={
        <ProtectedRoute><Layout><DashboardPage /></Layout></ProtectedRoute>} />
      <Route path="/exercises" element={
        <ProtectedRoute><Layout><ExercisesPage /></Layout></ProtectedRoute>} />
      <Route path="/routines" element={
        <ProtectedRoute><Layout><RoutinesPage /></Layout></ProtectedRoute>} />
      <Route path="/sessions" element={
        <ProtectedRoute><Layout><WorkoutSessionsPage /></Layout></ProtectedRoute>} />

      {/* Default redirect */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}


