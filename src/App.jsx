// src/App.jsx
import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate, Outlet, useOutletContext } from 'react-router-dom'

import { AuthProvider, useAuth } from './context/AuthContext.jsx'
import { useToast }              from './components/ui/Toast.jsx'
import { ToastContainer }        from './components/ui/Toast.jsx'
import { Sidebar }               from './components/layout/Sidebar.jsx'
import { Navbar }                from './components/layout/Navbar.jsx'
import { BottomTab }             from './components/layout/BottomTab.jsx'

import Login        from './pages/Login.jsx'
import Signup       from './pages/Signup.jsx'
import Dashboard    from './pages/Dashboard.jsx'
import Topics       from './pages/Topics.jsx'
import Log          from './pages/Log.jsx'
import Stats        from './pages/Stats.jsx'
import Achievements from './pages/Achievements.jsx'

// ─── Protected layout wrapper ────────────────────────────────
function AppLayout({ darkMode, onToggleDark, showToast }) {
  const { session, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-500 text-sm">Loading DevPath…</p>
        </div>
      </div>
    )
  }

  if (!session) return <Navigate to="/login" replace />

  return (
    <div className="flex min-h-screen bg-surface">
      {/* Desktop sidebar */}
      <Sidebar darkMode={darkMode} onToggleDark={onToggleDark} />

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile top navbar */}
        <Navbar darkMode={darkMode} onToggleDark={onToggleDark} />

        <main className="flex-1 px-4 md:px-8 py-6 pb-24 md:pb-8 max-w-5xl w-full mx-auto">
          <Outlet context={{ showToast }} />
        </main>
      </div>

      {/* Mobile bottom tabs */}
      <BottomTab />
    </div>
  )
}

// ─── Redirect logged-in users away from auth pages ───────────
function AuthGuard({ children }) {
  const { session, loading } = useAuth()
  if (loading) return null
  if (session) return <Navigate to="/dashboard" replace />
  return children
}

// ─── Page wrapper to inject showToast from Outlet context ────
function WithToast({ Component }) {
  const { showToast } = useOutletContext()
  return <Component showToast={showToast} />
}

// ─── Root app with providers ─────────────────────────────────
export default function App() {
  // Persist dark mode preference
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('devpath-dark') !== 'false'
  })

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode)
    localStorage.setItem('devpath-dark', String(darkMode))
  }, [darkMode])

  const { toasts, show: showToast, remove } = useToast()

  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Auth pages */}
          <Route path="/login"  element={<AuthGuard><Login /></AuthGuard>} />
          <Route path="/signup" element={<AuthGuard><Signup /></AuthGuard>} />

          {/* Protected app */}
          <Route
            element={
              <AppLayout
                darkMode={darkMode}
                onToggleDark={() => setDarkMode((d) => !d)}
                showToast={showToast}
              />
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard"    element={<WithToast Component={Dashboard} />} />
            <Route path="/topics"       element={<WithToast Component={Topics} />} />
            <Route path="/log"          element={<WithToast Component={Log} />} />
            <Route path="/stats"        element={<Stats />} />
            <Route path="/achievements" element={<WithToast Component={Achievements} />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>

      {/* Global toast container */}
      <ToastContainer toasts={toasts} onRemove={remove} />
    </AuthProvider>
  )
}
