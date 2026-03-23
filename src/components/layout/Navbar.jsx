// src/components/layout/Navbar.jsx
import { Moon, Sun, LogOut } from 'lucide-react'
import { useAuth } from '../../context/AuthContext.jsx'
import { signOut } from '../../lib/supabase.js'

export function Navbar({ darkMode, onToggleDark }) {
  const { profile, session } = useAuth()

  const initials = profile?.full_name
    ? profile.full_name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : (session?.user?.email?.[0] ?? 'U').toUpperCase()

  return (
    <header className="md:hidden flex items-center justify-between px-4 py-3 bg-surface-card border-b border-surface-border sticky top-0 z-30">
      <span className="font-display font-bold text-lg text-white">
        Dev<span className="text-brand-400">Path</span>
      </span>
      <div className="flex items-center gap-2">
        <button
          onClick={onToggleDark}
          className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-surface-muted transition-colors"
        >
          {darkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        <div className="w-8 h-8 rounded-full bg-brand-500/20 border border-brand-500/30 flex items-center justify-center text-brand-400 text-xs font-bold">
          {initials}
        </div>
        <button
          onClick={() => signOut()}
          className="p-2 rounded-lg text-slate-400 hover:text-red-400 transition-colors"
        >
          <LogOut size={18} />
        </button>
      </div>
    </header>
  )
}
