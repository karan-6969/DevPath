// src/hooks/useLogs.js
import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { fetchLogs } from '../lib/supabase.js'

export function useLogs(limit = null) {
  const { session } = useAuth()
  const [logs, setLogs]       = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  const load = useCallback(async () => {
    if (!session?.user?.id) return
    setLoading(true)
    try {
      const { data, error } = await fetchLogs(session.user.id, limit)
      if (error) throw error
      setLogs(data ?? [])
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [session?.user?.id, limit])

  useEffect(() => {
    load()
  }, [load])

  function addLog(log) {
    setLogs((prev) => [log, ...prev])
  }

  return { logs, loading, error, addLog, reload: load }
}