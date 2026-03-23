// src/context/AuthContext.jsx
// Global auth context. Wrap <App> with <AuthProvider>.

import { createContext, useContext, useEffect, useState } from 'react'
import { supabase, fetchProfile } from '../lib/supabase.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession]   = useState(null)       // Supabase session
  const [profile, setProfile]   = useState(null)       // profiles row
  const [loading, setLoading]   = useState(true)       // initial auth check

  // ─── Load session + profile on mount ────────────────────────
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session) loadProfile(session.user.id)
      else setLoading(false)
    })

    // Listen for auth changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session)
        if (session) {
          await loadProfile(session.user.id)
        } else {
          setProfile(null)
          setLoading(false)
        }
      }
    )
    return () => subscription.unsubscribe()
  }, [])

  async function loadProfile(userId) {
    const { data } = await fetchProfile(userId)
    setProfile(data)
    setLoading(false)
  }

  /** Call this after logging a session to keep profile in sync. */
  function refreshProfile() {
    if (session?.user?.id) loadProfile(session.user.id)
  }

  return (
    <AuthContext.Provider value={{ session, profile, loading, refreshProfile, setProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

/** Hook to access auth context. */
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
