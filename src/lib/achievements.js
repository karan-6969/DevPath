// src/lib/achievements.js
// Achievement definitions and unlock logic

import { getLevel } from './xp.js'

/** All possible achievements with their unlock conditions. */
export const ACHIEVEMENT_DEFINITIONS = [
  {
    id: 'first_step',
    title: 'First Step',
    description: 'Log your very first study session.',
    icon: '🚀',
    check: ({ totalLogs }) => totalLogs >= 1,
  },
  {
    id: 'on_fire',
    title: 'On Fire',
    description: 'Maintain a 3-day streak.',
    icon: '🔥',
    check: ({ streak }) => streak >= 3,
  },
  {
    id: 'week_warrior',
    title: 'Week Warrior',
    description: 'Log sessions for 7 consecutive days.',
    icon: '⚔️',
    check: ({ streak }) => streak >= 7,
  },
  {
    id: 'century',
    title: 'Century',
    description: 'Earn 100 total XP.',
    icon: '💯',
    check: ({ xp }) => xp >= 100,
  },
  {
    id: 'react_rookie',
    title: 'React Rookie',
    description: 'Complete all lessons in a React topic.',
    icon: '⚛️',
    check: ({ topics }) =>
      topics.some(
        (t) =>
          t.name.toLowerCase().includes('react') &&
          t.completed_lessons >= t.total_lessons &&
          t.total_lessons > 0
      ),
  },
  {
    id: 'night_owl',
    title: 'Night Owl',
    description: 'Log a single study session of 120+ minutes.',
    icon: '🦉',
    check: ({ logs }) => logs.some((l) => l.minutes_studied >= 120),
  },
  {
    id: 'consistent',
    title: 'Consistent',
    description: 'Log study sessions on 5 days in a row.',
    icon: '📅',
    check: ({ streak }) => streak >= 5,
  },
  {
    id: 'halfway_there',
    title: 'Halfway There',
    description: 'Reach Level 5.',
    icon: '🏔️',
    check: ({ xp }) => getLevel(xp) >= 5,
  },
  {
    id: 'sde_unlocked',
    title: 'SDE Unlocked',
    description: 'Reach Level 10 — you made it!',
    icon: '🏆',
    check: ({ xp }) => getLevel(xp) >= 10,
  },
]

/**
 * Check which achievements should be newly unlocked.
 * @param {object} context - { xp, streak, totalLogs, logs, topics }
 * @param {string[]} alreadyUnlocked - array of achievement ids already in DB
 * @returns {object[]} list of achievement definitions to newly unlock
 */
export function getNewAchievements(context, alreadyUnlocked = []) {
  return ACHIEVEMENT_DEFINITIONS.filter(
    (def) => !alreadyUnlocked.includes(def.id) && def.check(context)
  )
}
