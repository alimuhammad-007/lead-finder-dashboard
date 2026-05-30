/**
 * components/dashboard/DashboardShell.jsx
 * =========================================
 * Persistent layout shell: sidebar + main content area.
 * All protected pages render as children via <Outlet />.
 */

import { Outlet, Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, Users, MessageSquare, LogOut,
  Zap, Menu, X, ChevronRight, Bell,
} from 'lucide-react'
import useStore from '../../store/useStore'
import { supabase } from '../../lib/supabase'
import { useNavigate } from 'react-router-dom'

// Sidebar navigation items
const NAV_ITEMS = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/leads',     icon: Users,           label: 'Lead Finder' },
  { path: '/outreach',  icon: MessageSquare,   label: 'AI Outreach' },
]

export default function DashboardShell() {
  const { sidebarOpen, setSidebarOpen, user } = useStore()
  const location = useNavigate ? useLocation() : { pathname: '' }
  const navigate = useNavigate()

  async function handleLogout() {
    await supabase.auth.signOut()
    navigate('/login')
  }

  const userEmail     = user?.email || ''
  const userInitial   = (user?.user_metadata?.full_name || userEmail || 'U')[0].toUpperCase()
  const userName      = user?.user_metadata?.full_name || userEmail.split('@')[0]

  return (
    <div className="flex h-screen overflow-hidden bg-surface-950">

      {/* ── Sidebar ─────────────────────────────────────────── */}
      <motion.aside
        animate={{ width: sidebarOpen ? 240 : 64 }}
        transition={{ duration: 0.25, ease: 'easeInOut' }}
        className="relative flex flex-col bg-surface-900/80 border-r border-surface-700/50
                   backdrop-blur-md z-30 overflow-hidden"
      >
        {/* Logo + Toggle */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-surface-700/50 shrink-0">
          <AnimatePresence>
            {sidebarOpen && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="flex items-center gap-2.5"
              >
                <div className="w-7 h-7 rounded-lg bg-brand-400/20 flex items-center justify-center">
                  <Zap className="w-4 h-4 text-brand-400" />
                </div>
                <span className="font-display font-bold text-white text-base tracking-tight">
                  LeadFlow
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          {!sidebarOpen && (
            <div className="mx-auto w-7 h-7 rounded-lg bg-brand-400/20 flex items-center justify-center">
              <Zap className="w-4 h-4 text-brand-400" />
            </div>
          )}

          {sidebarOpen && (
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-1 rounded hover:bg-surface-700/60 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Nav Links */}
        <nav className="flex-1 px-2 py-4 space-y-1">
          {NAV_ITEMS.map(({ path, icon: Icon, label }) => {
            const active = location.pathname === path
            return (
              <Link
                key={path}
                to={path}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                  transition-all duration-150 group relative
                  ${active
                    ? 'bg-brand-400/10 text-brand-400 border border-brand-400/20'
                    : 'text-gray-400 hover:text-white hover:bg-surface-700/50'
                  }
                `}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <AnimatePresence>
                  {sidebarOpen && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="truncate"
                    >
                      {label}
                    </motion.span>
                  )}
                </AnimatePresence>
                {active && sidebarOpen && (
                  <ChevronRight className="w-3 h-3 ml-auto text-brand-400" />
                )}
              </Link>
            )
          })}
        </nav>

        {/* User + Logout */}
        <div className="p-2 border-t border-surface-700/50 space-y-1">
          {sidebarOpen && (
            <div className="flex items-center gap-3 px-3 py-2 rounded-lg">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-brand-400 to-blue-500 flex items-center justify-center text-xs font-bold text-white shrink-0">
                {userInitial}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-white truncate">{userName}</p>
                <p className="text-xs text-gray-500 truncate">{userEmail}</p>
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm
                       text-gray-400 hover:text-red-400 hover:bg-red-500/5 transition-colors"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </motion.aside>

      {/* ── Main Content ─────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Top bar */}
        <header className="h-16 flex items-center justify-between px-6
                           border-b border-surface-700/50 bg-surface-900/40 backdrop-blur-sm shrink-0">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-surface-700/50 text-gray-400 hover:text-white transition-colors"
          >
            <Menu className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3">
            <button className="relative p-2 rounded-lg hover:bg-surface-700/50 text-gray-400 hover:text-white transition-colors">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-brand-400 rounded-full" />
            </button>
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-brand-400 to-blue-500 flex items-center justify-center text-xs font-bold text-white">
              {userInitial}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="h-full"
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  )
}