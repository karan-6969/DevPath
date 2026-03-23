// src/pages/Topics.jsx
import { useState } from 'react'
import { Plus, Pencil, Trash2, ChevronDown, ChevronUp } from 'lucide-react'

import { useAuth }   from '../context/AuthContext.jsx'
import { useTopics } from '../hooks/useTopics.js'
import { deleteTopic } from '../lib/supabase.js'
import { fetchLogsByTopic } from '../lib/supabase.js'

import { Card }       from '../components/ui/Card.jsx'
import { Button }     from '../components/ui/Button.jsx'
import { Badge }      from '../components/ui/Badge.jsx'
import { Modal }      from '../components/ui/Modal.jsx'
import { ProgressBar } from '../components/ui/ProgressBar.jsx'
import { CardSkeleton } from '../components/ui/Skeleton.jsx'
import { TopicForm }  from '../components/forms/TopicForm.jsx'

export default function Topics({ showToast }) {
  const { session } = useAuth()
  const { topics, loading, addTopic, removeTopic, replaceTopic } = useTopics()

  const [showAddModal, setShowAddModal]   = useState(false)
  const [editTopic, setEditTopic]         = useState(null)
  const [expandedId, setExpandedId]       = useState(null)
  const [topicLogs, setTopicLogs]         = useState({})
  const [logsLoading, setLogsLoading]     = useState({})

  async function handleDelete(topic) {
    if (!confirm(`Delete "${topic.name}"? This cannot be undone.`)) return
    const { error } = await deleteTopic(topic.id)
    if (error) {
      showToast?.(`Error: ${error.message}`, 'error')
    } else {
      removeTopic(topic.id)
      showToast?.(`"${topic.name}" deleted.`, 'info')
    }
  }

  async function handleExpand(topicId) {
    if (expandedId === topicId) { setExpandedId(null); return }
    setExpandedId(topicId)
    if (topicLogs[topicId]) return // Already loaded
    setLogsLoading((prev) => ({ ...prev, [topicId]: true }))
    const { data } = await fetchLogsByTopic(session.user.id, topicId)
    setTopicLogs((prev) => ({ ...prev, [topicId]: data ?? [] }))
    setLogsLoading((prev) => ({ ...prev, [topicId]: false }))
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-2xl text-white">Topics</h1>
          <p className="text-slate-400 text-sm mt-0.5">{topics.length} topic{topics.length !== 1 ? 's' : ''} tracked</p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus size={16} /> Add Topic
        </Button>
      </div>

      {/* Topic list */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} lines={2} />)}
        </div>
      ) : topics.length === 0 ? (
        <Card className="text-center py-16">
          <p className="text-5xl mb-4">🗂️</p>
          <h3 className="font-display font-semibold text-white mb-2">No topics yet</h3>
          <p className="text-slate-400 text-sm mb-5">Add topics to start tracking your progress across different areas.</p>
          <Button onClick={() => setShowAddModal(true)}>
            <Plus size={16} /> Add Your First Topic
          </Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {topics.map((topic) => {
            const pct       = topic.total_lessons > 0
              ? Math.round((topic.completed_lessons / topic.total_lessons) * 100) : 0
            const isExpanded = expandedId === topic.id
            const logs       = topicLogs[topic.id] ?? []

            return (
              <Card key={topic.id} className="!p-0 overflow-hidden">
                {/* Main row */}
                <div className="p-5">
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-white">{topic.name}</h3>
                        <Badge label={topic.category} variant={topic.category} />
                      </div>
                      <ProgressBar value={pct} size="sm" className="mt-2 mb-1.5" />
                      <p className="text-xs text-slate-500">
                        {topic.completed_lessons}/{topic.total_lessons} lessons · {pct}% complete
                      </p>
                    </div>
                    {/* Actions */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => setEditTopic(topic)}
                        className="p-2 rounded-lg text-slate-500 hover:text-white hover:bg-surface-muted transition-colors"
                        title="Edit"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => handleDelete(topic)}
                        className="p-2 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={15} />
                      </button>
                      <button
                        onClick={() => handleExpand(topic.id)}
                        className="p-2 rounded-lg text-slate-500 hover:text-white hover:bg-surface-muted transition-colors"
                        title="View logs"
                      >
                        {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expanded log history */}
                {isExpanded && (
                  <div className="border-t border-surface-border bg-surface-muted px-5 py-4">
                    <p className="text-xs font-medium text-slate-400 mb-3 uppercase tracking-widest">Log History</p>
                    {logsLoading[topic.id] ? (
                      <p className="text-sm text-slate-500">Loading…</p>
                    ) : logs.length === 0 ? (
                      <p className="text-sm text-slate-500">No sessions logged for this topic yet.</p>
                    ) : (
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {logs.map((l) => (
                          <div key={l.id} className="flex items-center justify-between text-sm">
                            <span className="text-slate-400">{l.date}</span>
                            <span className="text-white">{l.minutes_studied} min</span>
                            <span className="text-xs font-mono text-brand-400">+{l.xp_earned} XP</span>
                            <span className="text-slate-500 text-xs">{l.mood}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </Card>
            )
          })}
        </div>
      )}

      {/* Add Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add New Topic">
        <TopicForm
          onSuccess={(t) => { addTopic(t); setShowAddModal(false); showToast?.('Topic added!', 'success') }}
          onCancel={() => setShowAddModal(false)}
        />
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={!!editTopic} onClose={() => setEditTopic(null)} title="Edit Topic">
        {editTopic && (
          <TopicForm
            existing={editTopic}
            onSuccess={(t) => { replaceTopic(t); setEditTopic(null); showToast?.('Topic updated!', 'success') }}
            onCancel={() => setEditTopic(null)}
          />
        )}
      </Modal>
    </div>
  )
}
