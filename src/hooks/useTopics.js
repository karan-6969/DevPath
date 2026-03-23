// src/hooks/useTopics.js
import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { fetchTopics } from '../lib/supabase.js'

export function useTopics() {
  const { session } = useAuth()
  const [topics, setTopics]   = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  const load = useCallback(async () => {
    if (!session?.user?.id) return
    setLoading(true)
    try {
      const { data, error } = await fetchTopics(session.user.id)
      if (error) throw error
      setTopics(data ?? [])
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [session?.user?.id])

  useEffect(() => {
    load()
  }, [load])

  function addTopic(topic) {
    setTopics((prev) => [...prev, topic])
  }

  function removeTopic(id) {
    setTopics((prev) => prev.filter((t) => t.id !== id))
  }

  function replaceTopic(updated) {
    setTopics((prev) => prev.map((t) => (t.id === updated.id ? updated : t)))
  }

  return { topics, loading, error, addTopic, removeTopic, replaceTopic, reload: load }
}