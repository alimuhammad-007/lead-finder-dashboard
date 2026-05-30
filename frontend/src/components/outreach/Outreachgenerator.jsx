/**
 * components/outreach/OutreachGenerator.jsx
 * ===========================================
 * AI-powered cold email generator.
 * Lets users pick tone, enter lead info, and get a personalized message.
 */

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Sparkles, Copy, Check, Trash2, RefreshCw,
  Briefcase, MapPin, User, Building,
} from 'lucide-react'
import { outreachAPI } from '../../lib/api'
import useStore from '../../store/useStore'

const TONE_OPTIONS = [
  {
    value: 'professional',
    label: 'Professional',
    desc:  'Formal, polished, business tone',
    emoji: '🤝',
  },
  {
    value: 'friendly',
    label: 'Friendly',
    desc:  'Warm, conversational, approachable',
    emoji: '😊',
  },
  {
    value: 'sales-focused',
    label: 'Sales Focused',
    desc:  'Persuasive with clear CTA',
    emoji: '🚀',
  },
]

export default function OutreachGenerator({ prefillLead = null }) {
  const { user, isGenerating, setIsGenerating, addMessage, messages, showNotification } = useStore()

  // Form state
  const [businessName,   setBusinessName]   = useState(prefillLead?.business_name || '')
  const [businessType,   setBusinessType]   = useState(prefillLead?.business_type || '')
  const [location,       setLocation]       = useState(prefillLead?.city || '')
  const [tone,           setTone]           = useState('professional')
  const [senderName,     setSenderName]     = useState('')
  const [senderCompany,  setSenderCompany]  = useState('')

  // Generated message state
  const [generatedMsg,  setGeneratedMsg]  = useState(null)
  const [copied,        setCopied]        = useState(false)

  async function handleGenerate() {
    if (!businessName || !businessType || !location) {
      showNotification('error', 'Please fill in business name, type, and location')
      return
    }

    setIsGenerating(true)
    setGeneratedMsg(null)

    const { data, error } = await outreachAPI.generate({
      business_name:  businessName,
      business_type:  businessType,
      location,
      tone,
      sender_name:    senderName || 'Alex',
      sender_company: senderCompany || 'Your Company',
      user_id:        user?.id,
      lead_id:        prefillLead?.id,
    })

    setIsGenerating(false)

    if (error) {
      showNotification('error', error)
    } else {
      setGeneratedMsg(data)
      if (data.id) addMessage(data)
      showNotification('success', 'Message generated!')
    }
  }

  async function copyToClipboard() {
    if (!generatedMsg) return
    const text = `Subject: ${generatedMsg.subject}\n\n${generatedMsg.message}`
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

      {/* ── Input Panel ────────────────────────────────────── */}
      <div className="glass-card p-6 space-y-5">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-purple-400" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-white">AI Outreach Generator</h2>
            <p className="text-xs text-gray-500">Generate personalized cold emails in seconds</p>
          </div>
        </div>

        {/* Tone Selector */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Message Tone</label>
          <div className="grid grid-cols-3 gap-2">
            {TONE_OPTIONS.map(t => (
              <button
                key={t.value}
                onClick={() => setTone(t.value)}
                className={`p-3 rounded-lg border text-left transition-all duration-150 ${
                  tone === t.value
                    ? 'border-purple-400/50 bg-purple-500/10 text-white'
                    : 'border-surface-600 bg-surface-800/40 text-gray-400 hover:border-surface-500'
                }`}
              >
                <div className="text-lg mb-1">{t.emoji}</div>
                <p className="text-xs font-semibold">{t.label}</p>
                <p className="text-xs text-gray-500 leading-tight mt-0.5">{t.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Target Business */}
        <div className="space-y-3">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Target Business</p>

          <div className="relative">
            <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              value={businessName}
              onChange={e => setBusinessName(e.target.value)}
              placeholder="Business name"
              className="input-field pl-10"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="relative">
              <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                value={businessType}
                onChange={e => setBusinessType(e.target.value)}
                placeholder="Business type"
                className="input-field pl-10"
              />
            </div>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                value={location}
                onChange={e => setLocation(e.target.value)}
                placeholder="City / location"
                className="input-field pl-10"
              />
            </div>
          </div>
        </div>

        {/* Sender Info */}
        <div className="space-y-3">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">From (You)</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                value={senderName}
                onChange={e => setSenderName(e.target.value)}
                placeholder="Your name"
                className="input-field pl-10"
              />
            </div>
            <div className="relative">
              <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                value={senderCompany}
                onChange={e => setSenderCompany(e.target.value)}
                placeholder="Your company"
                className="input-field pl-10"
              />
            </div>
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="btn-primary w-full justify-center py-3"
          style={{ background: 'linear-gradient(135deg, #8b5cf6, #00c8ff)', boxShadow: '0 0 20px rgba(139,92,246,0.3)' }}
        >
          {isGenerating ? (
            <>
              <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              Generating...
            </>
          ) : (
            <><Sparkles className="w-4 h-4" /> Generate Message</>
          )}
        </button>
      </div>

      {/* ── Output Panel ───────────────────────────────────── */}
      <div className="glass-card p-6 flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-white">Generated Message</h3>
          {generatedMsg && (
            <div className="flex items-center gap-2">
              <button
                onClick={handleGenerate}
                className="btn-ghost text-xs py-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Regenerate
              </button>
              <button
                onClick={copyToClipboard}
                className="btn-primary text-xs py-1.5"
              >
                {copied
                  ? <><Check className="w-3.5 h-3.5" /> Copied!</>
                  : <><Copy className="w-3.5 h-3.5" /> Copy</>
                }
              </button>
            </div>
          )}
        </div>

        <div className="flex-1">
          <AnimatePresence mode="wait">
            {isGenerating ? (
              // Loading skeleton
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-3"
              >
                <div className="skeleton h-6 w-2/3 rounded" />
                <div className="mt-6 space-y-2">
                  {[1,2,3,4,5].map(i => (
                    <div key={i} className={`skeleton h-4 rounded ${i === 3 ? 'w-4/5' : 'w-full'}`} />
                  ))}
                </div>
              </motion.div>
            ) : generatedMsg ? (
              // Generated message
              <motion.div
                key="message"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="h-full"
              >
                {/* Subject line */}
                <div className="mb-4">
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Subject</p>
                  <p className="text-sm font-semibold text-white bg-surface-800/60 rounded-lg px-3 py-2 border border-surface-700">
                    {generatedMsg.subject}
                  </p>
                </div>

                {/* Message body */}
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Email Body</p>
                  <div className="bg-surface-900/60 rounded-lg p-4 border border-surface-700 min-h-[200px]">
                    <pre className="text-sm text-gray-300 whitespace-pre-wrap font-body leading-relaxed">
                      {generatedMsg.message}
                    </pre>
                  </div>
                </div>

                {/* Meta */}
                <div className="mt-3 flex items-center gap-3 text-xs text-gray-600">
                  <span>Tone: <span className="text-gray-400">{generatedMsg.tone}</span></span>
                  <span>·</span>
                  <span>Model: <span className="text-gray-400 font-mono">{generatedMsg.model}</span></span>
                </div>
              </motion.div>
            ) : (
              // Empty state
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="h-full flex flex-col items-center justify-center text-center py-10"
              >
                <div className="text-4xl mb-3">✨</div>
                <p className="text-gray-400 text-sm">Your AI-generated message will appear here</p>
                <p className="text-gray-600 text-xs mt-1">Fill in the form and click Generate</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}