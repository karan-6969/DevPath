// src/hooks/useTopics.js
import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { fetchTopics } from '../lib/supabase.js'

export function useTopics() {
  const { session } = useAuth()
  const [topics, setTopics]   = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  useEffect(() => {
    if (!session?.user?.id) return
    setLoading(true)
    fetchTopics(session.user.id).then(({ data, error }) => {
      if (error) setError(error.message)
      else setTopics(data ?? [])
      setLoading(false)
    })
  }, [session?.user?.id])

  function addTopic(topic) {
    setTopics((prev) => [...prev, topic])
  }

  function removeTopic(id) {
    setTopics((prev) => prev.filter((t) => t.id !== id))
  }

  function replaceTopic(updated) {
    setTopics((prev) => prev.map((t) => (t.id === updated.id ? updated : t)))
  }

  return { topics, loading, error, addTopic, removeTopic, replaceTopic }
}
