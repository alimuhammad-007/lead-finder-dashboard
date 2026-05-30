/**
 * pages/DashboardPage.jsx
 * ========================
 * Main overview dashboard: stats, charts, and activity log.
 */

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowRight, Users, MessageSquare } from 'lucide-react'
import StatsCards    from '../components/dashboard/StatsCards.jsx'
import DashboardCharts from '../components/dashboard/DashboardCharts.jsx'
import ActivityLog   from '../components/dashboard/ActivityLog.jsx'
import { analyticsAPI } from '../lib/api.js'
import useStore from '../store/useStore.js'

export default function DashboardPage() {
  const {
    user, stats, activity,
    setStats, setActivity,
  } = useStore()

  // Load stats when page mounts
  useEffect(() => {
    if (!user?.id) return

    analyticsAPI.getStats(user.id).then(({ data }) => {
      if (data) setStats(data)
    })

    analyticsAPI.getActivity(user.id).then(({ data }) => {
      if (data) setActivity(data.activity || [])
    })
  }, [user?.id])

  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'there'

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">

      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-between"
      >
        <div>
          <h1 className="text-2xl font-display font-bold text-white">
            Good {getGreeting()}, {userName} 👋
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Here's what's happening with your leads today.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/leads" className="btn-primary text-sm">
            <Users className="w-4 h-4" />
            Find Leads
          </Link>
          <Link to="/outreach" className="btn-ghost text-sm">
            <MessageSquare className="w-4 h-4" />
            Generate Message
          </Link>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <StatsCards stats={stats} />

      {/* Charts + Activity */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-4">
          <DashboardCharts stats={stats} />
        </div>
        <div>
          <ActivityLog activity={activity} />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          to="/leads"
          className="glass-card p-5 flex items-center justify-between group hover:border-brand-400/30 transition-all duration-300"
        >
          <div>
            <p className="font-semibold text-white text-sm">Find New Leads</p>
            <p className="text-xs text-gray-500 mt-1">Search businesses by type and location</p>
          </div>
          <ArrowRight className="w-4 h-4 text-gray-500 group-hover:text-brand-400 group-hover:translate-x-1 transition-all" />
        </Link>

        <Link
          to="/outreach"
          className="glass-card p-5 flex items-center justify-between group hover:border-purple-400/30 transition-all duration-300"
        >
          <div>
            <p className="font-semibold text-white text-sm">Generate Outreach</p>
            <p className="text-xs text-gray-500 mt-1">Create personalized cold emails with AI</p>
          </div>
          <ArrowRight className="w-4 h-4 text-gray-500 group-hover:text-purple-400 group-hover:translate-x-1 transition-all" />
        </Link>
      </div>
    </div>
  )
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'morning'
  if (h < 17) return 'afternoon'
  return 'evening'
}