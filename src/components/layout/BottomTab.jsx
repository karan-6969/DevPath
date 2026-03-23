// src/components/layout/BottomTab.jsx
import { NavLink } from 'react-router-dom'
import { LayoutDashboard, BookOpen, PenLine, BarChart2, Trophy } from 'lucide-react'

const TABS = [
  { to: '/dashboard',    icon: LayoutDashboard, label: 'Home'   },
  { to: '/topics',       icon: BookOpen,        label: 'Topics' },
  { to: '/log',          icon: PenLine,         label: 'Log'    },
  { to: '/stats',        icon: BarChart2,       label: 'Stats'  },
  { to: '/achievements', icon: Trophy,          label: 'Awards' },
]

export function BottomTab() {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-surface-card border-t border-surface-border z-40 flex">
      {TABS.map(({ to, icon: Icon, label }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            `flex-1 flex flex-col items-center gap-0.5 py-2.5 text-xs font-medium transition-colors
            ${isActive ? 'text-brand-400' : 'text-slate-500'}`
          }
        >
          <Icon size={20} />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
