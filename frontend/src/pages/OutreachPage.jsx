/**
 * pages/OutreachPage.jsx
 * =======================
 * AI Outreach Generator page: message builder + saved message history.
 */

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { MessageSquare, History, Trash2, Copy, Check } from 'lucide-react'
import OutreachGenerator from '../components/outreach/OutreachGenerator.jsx'
import { outreachAPI }   from '../lib/api'
import useStore          from '../store/useStore'

export default function OutreachPage() {
  const [activeTab,     setActiveTab]     = useState('generator')
  const [loadingMsgs,   setLoadingMsgs]   = useState(false)
  const [copiedId,      setCopiedId]      = useState(null)

  const {
    user,
    messages,
    setMessages,
    removeMessage,
    showNotification,
  } = useStore()

  // Check if we navigated here from the Leads page with a prefill lead
  const prefillLead = (() => {
    try {
      const stored = sessionStorage.getItem('prefillLead')
      if (stored) {
        sessionStorage.removeItem('prefillLead')
        return JSON.parse(stored)
      }
    } catch {}
    return null
  })()

  // Load saved messages when history tab opens
  useEffect(() => {
    if (activeTab === 'history' && user?.id) {
      loadMessages()
    }
  }, [activeTab, user?.id])

  async function loadMessages() {
    setLoadingMsgs(true)
    const { data, error } = await outreachAPI.getAll(user.id)
    setLoadingMsgs(false)
    if (error) {
      showNotification('error', error)
    } else {
      setMessages(data.messages || [])
    }
  }

  async function deleteMessage(id) {
    const { error } = await outreachAPI.delete(id, user.id)
    if (error) {
      showNotification('error', error)
    } else {
      removeMessage(id)
      showNotification('success', 'Message deleted')
    }
  }

  async function copyMessage(msg) {
    const text = `Subject: ${msg.subject}\n\n${msg.message}`
    await navigator.clipboard.writeText(text)
    setCopiedId(msg.id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const TABS = [
    { id: 'generator', label: 'Generator',       icon: MessageSquare },
    { id: 'history',   label: 'Saved Messages',  icon: History },
  ]

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">

      {/* Page Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-display font-bold text-white">AI Outreach</h1>
        <p className="text-gray-400 text-sm mt-1">
          Generate personalized cold outreach emails with AI — choose your tone and go.
        </p>
      </motion.div>

      {/* Tab Bar */}
      <div className="flex items-center gap-1 border-b border-surface-700/50">
        {TABS.map(tab => {
          const Icon   = tab.icon
          const active = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors
                ${active
                  ? 'border-purple-400 text-purple-400'
                  : 'border-transparent text-gray-500 hover:text-gray-300'
                }
              `}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
              {tab.id === 'history' && messages.length > 0 && (
                <span className="ml-1 px-1.5 py-0.5 text-xs rounded-full bg-surface-700 text-gray-400">
                  {messages.length}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Generator Tab */}
      {activeTab === 'generator' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <OutreachGenerator prefillLead={prefillLead} />
        </motion.div>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-4"
        >
          {loadingMsgs ? (
            <div className="space-y-3">
              {[1,2,3].map(i => (
                <div key={i} className="glass-card p-5">
                  <div className="skeleton h-4 w-1/2 rounded mb-3" />
                  <div className="skeleton h-3 w-full rounded mb-2" />
                  <div className="skeleton h-3 w-4/5 rounded" />
                </div>
              ))}
            </div>
          ) : messages.length === 0 ? (
            <div className="glass-card p-10 text-center">
              <div className="text-4xl mb-3">💬</div>
              <p className="text-gray-400 text-sm">No saved messages yet</p>
              <p className="text-gray-600 text-xs mt-1">Generated messages are saved automatically</p>
            </div>
          ) : (
            messages.map((msg, i) => (
              <motion.div
                key={msg.id || i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="glass-card p-5"
              >
                {/* Message Header */}
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-sm font-semibold text-white">
                      {msg.subject || 'No subject'}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
                        {msg.tone}
                      </span>
                      {msg.leads?.business_name && (
                        <span className="text-xs text-gray-500">
                          → {msg.leads.business_name}
                        </span>
                      )}
                      <span className="text-xs text-gray-600">
                        {new Date(msg.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => copyMessage(msg)}
                      className="btn-ghost text-xs py-1.5"
                    >
                      {copiedId === msg.id
                        ? <><Check className="w-3.5 h-3.5 text-emerald-400" /> Copied</>
                        : <><Copy className="w-3.5 h-3.5" /> Copy</>
                      }
                    </button>
                    <button
                      onClick={() => deleteMessage(msg.id)}
                      className="btn-danger text-xs py-1.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Message Preview */}
                <pre className="text-xs text-gray-400 whitespace-pre-wrap font-body leading-relaxed
                                bg-surface-900/50 rounded-lg p-3 border border-surface-700/50
                                max-h-40 overflow-y-auto no-scrollbar">
                  {msg.message}
                </pre>
              </motion.div>
            ))
          )}
        </motion.div>
      )}
    </div>
  )
}