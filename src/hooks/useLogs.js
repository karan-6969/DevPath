// src/hooks/useLogs.js
import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { fetchLogs } from '../lib/supabase.js'

export function useLogs(limit = null) {
  const { session } = useAuth()
  const [logs, setLogs]       = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  useEffect(() => {
    if (!session?.user?.id) return
    setLoading(true)
    fetchLogs(session.user.id, limit).then(({ data, error }) => {
      if (error) setError(error.message)
      else setLogs(data ?? [])
      setLoading(false)
    })
  }, [session?.user?.id, limit])

  function addLog(log) {
    setLogs((prev) => [log, ...prev])
  }

  return { logs, loading, error, addLog }
}
