// src/lib/xp.js
// XP, level, and streak calculation utilities

/** XP awarded per minute studied. */
export const XP_PER_MINUTE = 1

/** XP bonus for maintaining a streak (studied yesterday). */
export const STREAK_BONUS_XP = 50

/** XP required per level. */
export const XP_PER_LEVEL = 500

/** Human-readable level names, indexed from 1. */
export const LEVEL_NAMES = {
  1:  'Code Newbie',
  2:  'JS Explorer',
  3:  'React Builder',
  4:  'Full Stack Apprentice',
  5:  'API Crafter',
  6:  'Database Wrangler',
  7:  'System Thinker',
  8:  'Interview Ready',
  9:  'Offer Getter',
  10: 'SDE Unlocked',
}

const MAX_LEVEL = 10

/**
 * Calculate the level for a given XP total.
 * @param {number} xp
 * @returns {number} level (1–10)
 */
export function getLevel(xp) {
  return Math.min(Math.floor(xp / XP_PER_LEVEL) + 1, MAX_LEVEL)
}

/**
 * Get the human-readable name for a level.
 * @param {number} level
 * @returns {string}
 */
export function getLevelName(level) {
  return LEVEL_NAMES[level] ?? `Level ${level}`
}

/**
 * Get progress toward the next level (0–1 float).
 * @param {number} xp
 * @returns {{ current: number, needed: number, progress: number, level: number, name: string }}
 */
export function getLevelProgress(xp) {
  const level    = getLevel(xp)
  const levelMin = (level - 1) * XP_PER_LEVEL
  const levelMax = level * XP_PER_LEVEL
  const current  = xp - levelMin
  const needed   = levelMax - levelMin
  const progress = Math.min(current / needed, 1)
  return { current, needed, progress, level, name: getLevelName(level) }
}

/**
 * Calculate XP earned for a log session.
 * @param {number} minutesStudied
 * @param {boolean} streakContinued - true if user logged yesterday too
 * @returns {number} xp earned
 */
export function calcXpEarned(minutesStudied, streakContinued) {
  const base  = minutesStudied * XP_PER_MINUTE
  const bonus = streakContinued ? STREAK_BONUS_XP : 0
  return base + bonus
}

/**
 * Calculate new streak given last_active date.
 * @param {string|null} lastActive - ISO date string of last activity (YYYY-MM-DD)
 * @param {string} today - ISO date string of today (YYYY-MM-DD)
 * @param {number} currentStreak
 * @returns {number} new streak value
 */
export function calcNewStreak(lastActive, today, currentStreak) {
  if (!lastActive) return 1

  const last    = new Date(lastActive)
  const todayD  = new Date(today)
  const diffMs  = todayD - last
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return currentStreak       // Already logged today
  if (diffDays === 1) return currentStreak + 1   // Consecutive day
  return 1                                        // Streak broken
}

/**
 * Returns true if the user studied yesterday (streak continues).
 * @param {string|null} lastActive - ISO date string
 * @param {string} today - ISO date string
 */
export function didStudyYesterday(lastActive, today) {
  if (!lastActive) return false
  const last     = new Date(lastActive)
  const todayD   = new Date(today)
  const diffDays = Math.round((todayD - last) / (1000 * 60 * 60 * 24))
  return diffDays === 1
}

/**
 * Get today's ISO date string (YYYY-MM-DD) in local time.
 */
export function todayISO() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/**
 * Get ISO date string for N days ago.
 */
export function daysAgoISO(n) {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/**
 * Format minutes as "Xh Ym" or "Xm".
 */
export function formatMinutes(minutes) {
  if (minutes < 60) return `${minutes}m`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m > 0 ? `${h}h ${m}m` : `${h}h`
}
