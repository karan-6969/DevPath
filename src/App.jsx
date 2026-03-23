// src/App.jsx
import { useEffect, useState, lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate, Outlet, useOutletContext } from 'react-router-dom'

import { AuthProvider, useAuth } from './context/AuthContext.jsx'
import { useToast, ToastContainer } from './components/ui/Toast.jsx'
import { Sidebar }   from './components/layout/Sidebar.jsx'
import { Navbar }    from './components/layout/Navbar.jsx'
import { BottomTab } from './components/layout/BottomTab.jsx'
import { Skeleton }  from './components/ui/Skeleton.jsx'

// ── Lazy load all pages (code splitting — only download when visited) ──
const Login        = lazy(() => import('./pages/Login.jsx'))
const Signup       = lazy(() => import('./pages/Signup.jsx'))
const Dashboard    = lazy(() => import('./pages/Dashboard.jsx'))
const Topics       = lazy(() => import('./pages/Topics.jsx'))
const Log          = lazy(() => import('./pages/Log.jsx'))
const Stats        = lazy(() => import('./pages/Stats.jsx'))
const Achievements = lazy(() => import('./pages/Achievements.jsx'))

// ── Page loading fallback ────────────────────────────────────
function PageLoader() {
  return (
    <div className="space-y-4 animate-pulse p-2">
      <Skeleton className="h-8 w-48" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-40 w-full rounded-xl" />
      <Skeleton className="h-40 w-full rounded-xl" />
    </div>
  )
}

// ── Protected layout wrapper ─────────────────────────────────
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
      <Sidebar darkMode={darkMode} onToggleDark={onToggleDark} />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar darkMode={darkMode} onToggleDark={onToggleDark} />
        <main className="flex-1 px-4 md:px-8 py-6 pb-24 md:pb-8 max-w-5xl w-full mx-auto">
          <Suspense fallback={<PageLoader />}>
            <Outlet context={{ showToast }} />
          </Suspense>
        </main>
      </div>
      <BottomTab />
    </div>
  )
}

// ── Redirect logged-in users away from auth pages ────────────
function AuthGuard({ children }) {
  const { session, loading } = useAuth()
  if (loading) return null
  if (session) return <Navigate to="/dashboard" replace />
  return children
}

// ── Inject showToast into pages via Outlet context ───────────
function WithToast({ Component }) {
  const { showToast } = useOutletContext()
  return <Component showToast={showToast} />
}

// ── Root app ─────────────────────────────────────────────────
export default function App() {
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
          <Route path="/login"  element={<AuthGuard><Suspense fallback={null}><Login /></Suspense></AuthGuard>} />
          <Route path="/signup" element={<AuthGuard><Suspense fallback={null}><Signup /></Suspense></AuthGuard>} />

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

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>

      <ToastContainer toasts={toasts} onRemove={remove} />
    </AuthProvider>
  )
}
