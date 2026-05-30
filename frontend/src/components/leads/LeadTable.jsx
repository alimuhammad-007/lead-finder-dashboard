/**
 * components/leads/LeadTable.jsx
 * ================================
 * Displays leads in a sortable, filterable table.
 * Supports: save to DB, delete, generate outreach, export CSV.
 */

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Save, Trash2, MessageSquare, Globe, Phone, Mail,
  Star, ChevronDown, CheckCircle, Download,
} from 'lucide-react'
import { leadsAPI, exportLeadsToCSV } from '../../lib/api'
import useStore from '../../store/useStore'

// Score color helper
function scoreColor(score) {
  if (score >= 70) return 'text-emerald-400 bg-emerald-500/10'
  if (score >= 40) return 'text-amber-400 bg-amber-500/10'
  return 'text-red-400 bg-red-500/10'
}

// Status badge styling
const STATUS_STYLES = {
  new:       'bg-brand-400/10 text-brand-400 border-brand-400/20',
  contacted: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  qualified: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  converted: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  lost:      'bg-red-500/10 text-red-400 border-red-500/20',
}

export default function LeadTable({ leads, mode = 'search', onGenerateMessage }) {
  const [selectedIds, setSelectedIds]     = useState(new Set())
  const [savingIds,   setSavingIds]       = useState(new Set())
  const [savedIds,    setSavedIds]        = useState(new Set())

  const { user, addLeads, removeLead, showNotification } = useStore()

  // Toggle row selection — uses numeric index as the key for search-mode leads
  // (which have no DB id yet) and lead.id for saved leads.
  function toggleSelect(id) {
    setSelectedIds(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  // Toggle all rows
  function toggleAll() {
    if (selectedIds.size === leads.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(leads.map((_, i) => i)))
    }
  }

  // Save selected leads to database
  async function saveSelected() {
    if (!user) return showNotification('error', 'Please log in first')
    if (selectedIds.size === 0) return showNotification('error', 'Select at least one lead')

    const toSave = [...selectedIds].map(i => leads[i])
    const ids    = new Set([...selectedIds])
    setSavingIds(ids)

    const { data, error } = await leadsAPI.save(user.id, toSave)

    setSavingIds(new Set())

    if (error) {
      showNotification('error', error)
    } else {
      setSavedIds(prev => new Set([...prev, ...ids]))
      addLeads(data.saved || toSave)
      showNotification('success', `${toSave.length} lead(s) saved!`)
      setSelectedIds(new Set())
    }
  }

  // Delete a saved lead
  async function deleteLead(leadId) {
    if (!user) return
    const { error } = await leadsAPI.delete(leadId, user.id)
    if (error) {
      showNotification('error', error)
    } else {
      removeLead(leadId)
      showNotification('success', 'Lead removed')
    }
  }

  // Guard: leads prop could be undefined for one render cycle before
  // Zustand initialises or while the parent is building the array.
  // Treating undefined/null the same as [] prevents a TypeError crash
  // that would blank the whole page with no error message.
  const safeLeads = Array.isArray(leads) ? leads : []

  if (safeLeads.length === 0) {
    return (
      <div className="glass-card p-10 text-center">
        <div className="text-4xl mb-3">🔍</div>
        <p className="text-gray-400 text-sm">
          {mode === 'search' ? 'Search above to find leads' : 'No leads saved yet'}
        </p>
      </div>
    )
  }

  return (
    <div className="glass-card overflow-hidden">
      {/* Table Toolbar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-surface-700/50">
        <span className="text-sm text-gray-400">
          <span className="text-white font-medium">{safeLeads.length}</span> leads
          {selectedIds.size > 0 && (
            <span className="ml-2 text-brand-400">({selectedIds.size} selected)</span>
          )}
        </span>

        <div className="flex items-center gap-2">
          {/* Export CSV */}
          <button
            onClick={() => exportLeadsToCSV(safeLeads)}
            className="btn-ghost text-xs py-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>

          {/* Save selected (search mode only) */}
          {mode === 'search' && selectedIds.size > 0 && (
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={saveSelected}
              className="btn-primary text-xs py-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              Save {selectedIds.size} Selected
            </motion.button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="data-table">
          <thead>
            <tr>
              {mode === 'search' && (
                <th className="w-10">
                  <input
                    type="checkbox"
                    checked={selectedIds.size === safeLeads.length && safeLeads.length > 0}
                    onChange={toggleAll}
                    className="accent-brand-400"
                  />
                </th>
              )}
              <th>Business</th>
              <th>Contact</th>
              <th>Location</th>
              <th>Score</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {safeLeads.map((lead, i) => {
                const isSelected = selectedIds.has(i) || selectedIds.has(lead.id)
                const isSaved    = savedIds.has(i)
                const isSaving   = savingIds.has(i)

                return (
                  <motion.tr
                    key={lead.id || i}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ delay: i * 0.02 }}
                    className={isSelected ? 'bg-brand-400/5' : ''}
                  >
                    {/* Checkbox (search mode) */}
                    {mode === 'search' && (
                      <td>
                        {isSaved ? (
                          <CheckCircle className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelect(i)}
                            className="accent-brand-400"
                          />
                        )}
                      </td>
                    )}

                    {/* Business Name + Rating */}
                    <td>
                      <div>
                        <p className="font-medium text-white text-sm">{lead.business_name}</p>
                        <p className="text-xs text-gray-500">{lead.business_type}</p>
                        {lead.rating && (
                          <div className="flex items-center gap-1 mt-1">
                            <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                            <span className="text-xs text-gray-400">
                              {lead.rating} ({lead.review_count || 0})
                            </span>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Contact Info */}
                    <td>
                      <div className="space-y-1">
                        {lead.email && (
                          <a href={`mailto:${lead.email}`} className="flex items-center gap-1.5 text-xs text-brand-400 hover:underline">
                            <Mail className="w-3 h-3" /> {lead.email}
                          </a>
                        )}
                        {lead.phone && (
                          <a href={`tel:${lead.phone}`} className="flex items-center gap-1.5 text-xs text-gray-400">
                            <Phone className="w-3 h-3" /> {lead.phone}
                          </a>
                        )}
                        {lead.website && (
                          <a href={lead.website} target="_blank" rel="noopener noreferrer"
                             className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white">
                            <Globe className="w-3 h-3" /> Website
                          </a>
                        )}
                      </div>
                    </td>

                    {/* Location */}
                    <td>
                      <p className="text-xs text-gray-400">{lead.city || lead.address}</p>
                    </td>

                    {/* Score */}
                    <td>
                      <span className={`badge border text-xs font-bold ${scoreColor(lead.score || 0)}`}>
                        {lead.score || 0}
                      </span>
                    </td>

                    {/* Status */}
                    <td>
                      <span className={`badge border text-xs ${STATUS_STYLES[lead.status] || STATUS_STYLES.new}`}>
                        {lead.status || 'new'}
                      </span>
                    </td>

                    {/* Action Buttons */}
                    <td>
                      <div className="flex items-center gap-1.5">
                        {/* Generate outreach message */}
                        <button
                          onClick={() => onGenerateMessage?.(lead)}
                          title="Generate outreach message"
                          className="p-1.5 rounded hover:bg-purple-500/10 text-gray-400 hover:text-purple-400 transition-colors"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete (saved mode only) */}
                        {mode === 'saved' && lead.id && (
                          <button
                            onClick={() => deleteLead(lead.id)}
                            title="Delete lead"
                            className="p-1.5 rounded hover:bg-red-500/10 text-gray-400 hover:text-red-400 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {/* Save individual (search mode) */}
                        {mode === 'search' && !isSaved && (
                          <button
                            onClick={() => {
                              setSelectedIds(new Set([i]))
                            }}
                            title="Save this lead"
                            disabled={isSaving}
                            className="p-1.5 rounded hover:bg-brand-400/10 text-gray-400 hover:text-brand-400 transition-colors"
                          >
                            <Save className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                )
              })}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    </div>
  )
}