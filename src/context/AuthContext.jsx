// src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useState, useRef } from 'react'
import { supabase, fetchProfile } from '../lib/supabase.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession]   = useState(undefined) // undefined = not checked yet
  const [profile, setProfile]   = useState(null)
  const initialized             = useRef(false)

  const loading = session === undefined

  useEffect(() => {
    // Prevent double-init from any parent re-renders
    if (initialized.current) return
    initialized.current = true

    // Get initial session from localStorage (instant, no network)
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session ?? null)
      if (session?.user?.id) loadProfile(session.user.id)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session ?? null)
        if (session?.user?.id) {
          loadProfile(session.user.id)
        } else {
          setProfile(null)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  async function loadProfile(userId) {
    try {
      const { data } = await fetchProfile(userId)
      setProfile(data)
    } catch (e) {
      console.error('Profile load error:', e)
    }
  }

  function refreshProfile() {
    if (session?.user?.id) loadProfile(session.user.id)
  }

  return (
    <AuthContext.Provider value={{ session, profile, loading, refreshProfile, setProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}