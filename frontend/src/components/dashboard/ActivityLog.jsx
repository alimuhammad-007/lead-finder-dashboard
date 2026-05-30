/**
 * components/dashboard/ActivityLog.jsx
 * ======================================
 * Shows recent user activity (lead saved, message generated, etc.)
 */

import { motion } from 'framer-motion'
import { UserPlus, MessageSquare, Search, Edit3 } from 'lucide-react'

// Map action strings to icons and colors
const ACTION_CONFIG = {
  lead_saved:          { icon: UserPlus,      color: 'text-brand-400',   bg: 'bg-brand-400/10',   label: 'Lead saved' },
  message_generated:   { icon: MessageSquare, color: 'text-purple-400',  bg: 'bg-purple-500/10',  label: 'Message generated' },
  search_completed:    { icon: Search,        color: 'text-amber-400',   bg: 'bg-amber-500/10',   label: 'Search run' },
  lead_updated:        { icon: Edit3,         color: 'text-emerald-400', bg: 'bg-emerald-500/10', label: 'Lead updated' },
}

function timeAgo(isoString) {
  const now  = Date.now()
  const then = new Date(isoString).getTime()
  const diff = Math.floor((now - then) / 1000)

  if (diff < 60)    return 'just now'
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

export default function ActivityLog({ activity = [] }) {
  if (activity.length === 0) {
    return (
      <div className="glass-card p-5">
        <h3 className="text-sm font-semibold text-white mb-4">Recent Activity</h3>
        <div className="h-32 flex items-center justify-center">
          <p className="text-sm text-gray-500">No activity yet</p>
        </div>
      </div>
    )
  }

  return (
    <div className="glass-card p-5">
      <h3 className="text-sm font-semibold text-white mb-4">Recent Activity</h3>
      <div className="space-y-3">
        {activity.slice(0, 8).map((item, i) => {
          const config = ACTION_CONFIG[item.action] || ACTION_CONFIG.lead_saved
          const Icon   = config.icon

          return (
            <motion.div
              key={item.id || i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center gap-3"
            >
              <div className={`w-7 h-7 rounded-lg ${config.bg} flex items-center justify-center shrink-0`}>
                <Icon className={`w-3.5 h-3.5 ${config.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-300 truncate">
                  {config.label}
                  {item.metadata?.business_name && (
                    <span className="text-gray-400"> — {item.metadata.business_name}</span>
                  )}
                </p>
              </div>
              <span className="text-xs text-gray-600 shrink-0">
                {timeAgo(item.created_at)}
              </span>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}