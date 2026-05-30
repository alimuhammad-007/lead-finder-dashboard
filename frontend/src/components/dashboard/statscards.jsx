/**
 * components/dashboard/StatsCards.jsx
 * =====================================
 * Four animated stat cards at the top of the dashboard.
 */

import { motion } from 'framer-motion'
import { Users, MessageSquare, Search, TrendingUp } from 'lucide-react'

const CARD_VARIANTS = {
  hidden: { opacity: 0, y: 20 },
  show:   { opacity: 1, y: 0 },
}

export default function StatsCards({ stats }) {
  const cards = [
    {
      label:    'Total Leads',
      value:    stats.total_leads,
      icon:     Users,
      color:    'text-brand-400',
      bg:       'bg-brand-400/10',
      border:   'border-brand-400/20',
      change:   '+12%',
      positive: true,
    },
    {
      label:    'Messages Sent',
      value:    stats.total_messages,
      icon:     MessageSquare,
      color:    'text-purple-400',
      bg:       'bg-purple-500/10',
      border:   'border-purple-500/20',
      change:   '+8%',
      positive: true,
    },
    {
      label:    'Searches Run',
      value:    stats.total_searches,
      icon:     Search,
      color:    'text-amber-400',
      bg:       'bg-amber-500/10',
      border:   'border-amber-500/20',
      change:   '+5%',
      positive: true,
    },
    {
      label:    'Hot Leads',
      value:    stats.hot_leads,
      icon:     TrendingUp,
      color:    'text-emerald-400',
      bg:       'bg-emerald-500/10',
      border:   'border-emerald-500/20',
      change:   `Avg ${stats.average_score}`,
      positive: true,
    },
  ]

  return (
    <motion.div
      variants={{ show: { transition: { staggerChildren: 0.08 } } }}
      initial="hidden"
      animate="show"
      className="grid grid-cols-2 lg:grid-cols-4 gap-4"
    >
      {cards.map((card, i) => {
        const Icon = card.icon
        return (
          <motion.div key={i} variants={CARD_VARIANTS} className="stat-card group">
            <div className="flex items-start justify-between mb-4">
              <div className={`w-9 h-9 rounded-lg ${card.bg} border ${card.border} flex items-center justify-center`}>
                <Icon className={`w-4 h-4 ${card.color}`} />
              </div>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                card.positive ? 'text-emerald-400 bg-emerald-500/10' : 'text-red-400 bg-red-500/10'
              }`}>
                {card.change}
              </span>
            </div>
            <p className="text-2xl font-display font-bold text-white mb-1">
              {typeof card.value === 'number' ? card.value.toLocaleString() : card.value}
            </p>
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">{card.label}</p>
          </motion.div>
        )
      })}
    </motion.div>
  )
}