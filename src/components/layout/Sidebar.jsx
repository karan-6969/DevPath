// src/components/layout/Sidebar.jsx
import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, BookOpen, PenLine,
  BarChart2, Trophy, LogOut, Moon, Sun,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext.jsx'
import { signOut } from '../../lib/supabase.js'
import { getLevelProgress } from '../../lib/xp.js'
import { ProgressBar } from '../ui/ProgressBar.jsx'

const NAV = [
  { to: '/dashboard',    icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/topics',       icon: BookOpen,        label: 'Topics'    },
  { to: '/log',          icon: PenLine,         label: 'Log'       },
  { to: '/stats',        icon: BarChart2,       label: 'Stats'     },
  { to: '/achievements', icon: Trophy,          label: 'Achievements' },
]

export function Sidebar({ darkMode, onToggleDark }) {
  const { profile, session } = useAuth()

  async function handleLogout() {
    await signOut()
  }

  const initials = profile?.full_name
    ? profile.full_name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : (session?.user?.email?.[0] ?? 'U').toUpperCase()

  const lvl = profile ? getLevelProgress(profile.xp) : null

  return (
    <aside className="hidden md:flex flex-col w-60 shrink-0 bg-surface-card border-r border-surface-border min-h-screen">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-surface-border">
        <span className="font-display font-bold text-xl text-white tracking-tight">
          Dev<span className="text-brand-400">Path</span>
        </span>
        <p className="text-xs text-slate-500 mt-0.5">SDE Learning Tracker</p>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {NAV.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150
              ${isActive
                ? 'bg-brand-500/15 text-brand-400 border border-brand-500/20'
                : 'text-slate-400 hover:text-white hover:bg-surface-muted'
              }`
            }
          >
            <Icon size={17} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Level badge */}
      {lvl && (
        <div className="mx-3 mb-3 p-3 bg-surface-muted rounded-xl border border-surface-border">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-medium text-white">Lv {lvl.level}</span>
            <span className="text-xs text-slate-500">{lvl.current}/{lvl.needed} XP</span>
          </div>
          <ProgressBar value={lvl.progress * 100} size="sm" animated />
          <p className="text-xs text-slate-500 mt-1.5 truncate">{lvl.name}</p>
        </div>
      )}

      {/* User + controls */}
      <div className="px-3 pb-4 border-t border-surface-border pt-3 space-y-1">
        {/* Dark mode toggle */}
        <button
          onClick={onToggleDark}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-surface-muted transition-colors"
        >
          {darkMode ? <Sun size={16} /> : <Moon size={16} />}
          {darkMode ? 'Light mode' : 'Dark mode'}
        </button>

        {/* User row */}
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-8 h-8 rounded-full bg-brand-500/20 border border-brand-500/30 flex items-center justify-center text-brand-400 text-xs font-bold shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-white truncate">
              {profile?.full_name ?? profile?.username ?? 'User'}
            </p>
            <p className="text-xs text-slate-500 truncate">{session?.user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            title="Log out"
            className="p-1 rounded text-slate-500 hover:text-red-400 transition-colors"
          >
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </aside>
  )
}
