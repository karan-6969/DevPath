// src/hooks/useProfile.js
import { useAuth } from '../context/AuthContext.jsx'
export function useProfile() {
  const { profile, loading, refreshProfile } = useAuth()
  return { profile, loading, refreshProfile }
}
