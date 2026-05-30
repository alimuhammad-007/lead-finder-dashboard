/**
 * App.jsx
 * ========
 * Root component. Sets up routing and global layout.
 * Protected routes require authentication.
 */

import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { supabase } from './lib/supabase.js'
import useStore from './store/useStore.js'

// Pages
import LoginPage     from './pages/LoginPage.jsx'
import SignupPage    from './pages/SignupPage.jsx'
import DashboardPage from './pages/DashboardPage.jsx'
import LeadsPage     from './pages/LeadsPage.jsx'
import OutreachPage  from './pages/OutreachPage.jsx'

// Shared components
import Notification from "./components/shared/Notification.jsx";
import DashboardShell from "./components/dashboard/DashboardShell.jsx"

/**
 * ProtectedRoute — redirects to /login if not authenticated
 */
function ProtectedRoute({ children }) {
  const user = useStore(s => s.user)
  if (user === undefined) return null // Still loading
  if (!user) return <Navigate to="/login" replace />
  return children
}

export default function App() {
  const { setUser, notification } = useStore()

  // Restore session on page reload
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_, session) => setUser(session?.user ?? null)
    )
    return () => subscription.unsubscribe()
  }, [])

  return (
    <>
      {/* Global toast notification */}
      {notification && <Notification {...notification} />}

      <Routes>
        {/* Public routes */}
        <Route path="/login"  element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        {/* Protected dashboard routes — wrapped in sidebar shell */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <DashboardShell />
            </ProtectedRoute>
          }
        >
          <Route index             element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard"  element={<DashboardPage />} />
          <Route path="leads"      element={<LeadsPage />} />
          <Route path="outreach"   element={<OutreachPage />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </>
  )
}