// src/lib/supabase.js
// Supabase client + all database query functions
// All components should import from here — no inline Supabase calls elsewhere.

import { createClient } from '@supabase/supabase-js'

const supabaseUrl  = import.meta.env.VITE_SUPABASE_URL
const supabaseKey  = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env')
}

export const supabase = createClient(supabaseUrl, supabaseKey)

// ─── AUTH ────────────────────────────────────────────────────

/** Sign up with email + password. Passes full_name via metadata for the trigger. */
export async function signUp({ email, password, fullName, username }) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName, username },
    },
  })
  return { data, error }
}

/** Sign in with email + password. */
export async function signIn({ email, password }) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  return { data, error }
}

/** Sign out current user. */
export async function signOut() {
  const { error } = await supabase.auth.signOut()
  return { error }
}

/** Get the current session. */
export async function getSession() {
  const { data: { session } } = await supabase.auth.getSession()
  return session
}

// ─── PROFILES ────────────────────────────────────────────────

/** Fetch a user's profile by user id. */
export async function fetchProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  return { data, error }
}

/** Update profile fields (xp, streak, last_active, etc.) */
export async function updateProfile(userId, updates) {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single()
  return { data, error }
}

// ─── TOPICS ──────────────────────────────────────────────────

/** Fetch all topics for a user. */
export async function fetchTopics(userId) {
  const { data, error } = await supabase
    .from('topics')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true })
  return { data, error }
}

/** Create a new topic. */
export async function createTopic(userId, { name, category, totalLessons }) {
  const { data, error } = await supabase
    .from('topics')
    .insert({
      user_id: userId,
      name,
      category,
      total_lessons: totalLessons,
      completed_lessons: 0,
    })
    .select()
    .single()
  return { data, error }
}

/** Update a topic (e.g. edit name/category/lessons). */
export async function updateTopic(topicId, updates) {
  const { data, error } = await supabase
    .from('topics')
    .update(updates)
    .eq('id', topicId)
    .select()
    .single()
  return { data, error }
}

/** Delete a topic by id. */
export async function deleteTopic(topicId) {
  const { error } = await supabase
    .from('topics')
    .delete()
    .eq('id', topicId)
  return { error }
}

// ─── DAILY LOGS ──────────────────────────────────────────────

/** Fetch all daily logs for a user, newest first. */
export async function fetchLogs(userId, limit = null) {
  let query = supabase
    .from('daily_logs')
    .select('*, topics(name, category)')
    .eq('user_id', userId)
    .order('date', { ascending: false })

  if (limit) query = query.limit(limit)
  const { data, error } = await query
  return { data, error }
}

/** Fetch logs for a specific date range (ISO date strings). */
export async function fetchLogsInRange(userId, from, to) {
  const { data, error } = await supabase
    .from('daily_logs')
    .select('*, topics(name, category)')
    .eq('user_id', userId)
    .gte('date', from)
    .lte('date', to)
    .order('date', { ascending: true })
  return { data, error }
}

/** Fetch logs for a specific topic. */
export async function fetchLogsByTopic(userId, topicId) {
  const { data, error } = await supabase
    .from('daily_logs')
    .select('*')
    .eq('user_id', userId)
    .eq('topic_id', topicId)
    .order('date', { ascending: false })
  return { data, error }
}

/** Insert a new daily log entry. */
export async function createLog(userId, { date, topicId, minutesStudied, notes, mood, xpEarned }) {
  const { data, error } = await supabase
    .from('daily_logs')
    .insert({
      user_id: userId,
      date,
      topic_id: topicId,
      minutes_studied: minutesStudied,
      notes: notes || null,
      mood,
      xp_earned: xpEarned,
    })
    .select()
    .single()
  return { data, error }
}

/** Delete a log entry. */
export async function deleteLog(logId) {
  const { error } = await supabase
    .from('daily_logs')
    .delete()
    .eq('id', logId)
  return { error }
}

// ─── ACHIEVEMENTS ────────────────────────────────────────────

/** Fetch all unlocked achievements for a user. */
export async function fetchAchievements(userId) {
  const { data, error } = await supabase
    .from('achievements')
    .select('*')
    .eq('user_id', userId)
    .order('unlocked_at', { ascending: false })
  return { data, error }
}

/** Insert a new achievement (called after unlock check). */
export async function createAchievement(userId, { title, description, icon }) {
  const { data, error } = await supabase
    .from('achievements')
    .insert({ user_id: userId, title, description, icon })
    .select()
    .single()
  return { data, error }
}

// ─── REALTIME ────────────────────────────────────────────────

/**
 * Subscribe to INSERT events on daily_logs for a given user.
 * @param {string} userId
 * @param {function} callback - receives the new log row
 * @returns Supabase channel (call .unsubscribe() to clean up)
 */
export function subscribeToDailyLogs(userId, callback) {
  const channel = supabase
    .channel(`daily_logs:user:${userId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'daily_logs',
        filter: `user_id=eq.${userId}`,
      },
      (payload) => callback(payload.new)
    )
    .subscribe()
  return channel
}
