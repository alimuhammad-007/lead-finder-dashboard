/**
 * pages/LeadsPage.jsx
 * ====================
 * Lead Finder page: search form + results table + saved leads tab.
 */

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Search, BookMarked, RefreshCw } from 'lucide-react'
import LeadSearchForm from '../components/leads/LeadSearchForm.jsx'
import LeadTable      from '../components/leads/LeadTable.jsx'
import { leadsAPI }   from '../lib/api'
import useStore       from '../store/useStore'

const TABS = [
  { id: 'search', label: 'Search Results', icon: Search },
  { id: 'saved',  label: 'Saved Leads',    icon: BookMarked },
]

export default function LeadsPage() {
  const [activeTab,    setActiveTab]    = useState('search')
  const [loadingSaved, setLoadingSaved] = useState(false)
  const [statusFilter, setStatusFilter] = useState('all')
  const [searchFilter, setSearchFilter] = useState('')

  const {
    user,
    searchResults,
    leads,
    isSearching,
    setLeads,
    showNotification,
  } = useStore()

  const navigate = useNavigate()

  // Load saved leads when tab switches to "saved"
  useEffect(() => {
    if (activeTab === 'saved' && user?.id) {
      loadSavedLeads()
    }
  }, [activeTab, statusFilter, user?.id])

  async function loadSavedLeads() {
    setLoadingSaved(true)
    const { data, error } = await leadsAPI.getAll(user.id, statusFilter, searchFilter)
    setLoadingSaved(false)
    if (error) {
      showNotification('error', error)
    } else {
      setLeads(data.leads || [])
    }
  }

  // When user clicks "Generate Message" on a lead → navigate to outreach page
  function handleGenerateMessage(lead) {
    // Store prefill data in sessionStorage so OutreachPage can pick it up
    sessionStorage.setItem('prefillLead', JSON.stringify(lead))
    navigate('/outreach')
  }

  // Display data depending on active tab
  const displayLeads   = activeTab === 'search' ? searchResults : leads
  const isLoading      = activeTab === 'search' ? isSearching : loadingSaved

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">

      {/* Page Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-display font-bold text-white">Lead Finder</h1>
        <p className="text-gray-400 text-sm mt-1">
          Discover businesses and save the most promising ones to your pipeline.
        </p>
      </motion.div>

      {/* Search Form */}
      <LeadSearchForm />

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
                  ? 'border-brand-400 text-brand-400'
                  : 'border-transparent text-gray-500 hover:text-gray-300'
                }
              `}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
              {tab.id === 'search' && searchResults.length > 0 && (
                <span className="ml-1 px-1.5 py-0.5 text-xs rounded-full bg-brand-400/10 text-brand-400">
                  {searchResults.length}
                </span>
              )}
              {tab.id === 'saved' && leads.length > 0 && (
                <span className="ml-1 px-1.5 py-0.5 text-xs rounded-full bg-surface-700 text-gray-400">
                  {leads.length}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Saved Leads Filters */}
      {activeTab === 'saved' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-wrap items-center gap-3"
        >
          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="select-field w-auto text-sm"
          >
            <option value="all">All Statuses</option>
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="qualified">Qualified</option>
            <option value="converted">Converted</option>
            <option value="lost">Lost</option>
          </select>

          {/* Text search */}
          <input
            type="text"
            value={searchFilter}
            onChange={e => setSearchFilter(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && loadSavedLeads()}
            placeholder="Search by name, city..."
            className="input-field w-56 text-sm"
          />

          {/* Refresh */}
          <button
            onClick={loadSavedLeads}
            disabled={loadingSaved}
            className="btn-ghost text-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingSaved ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </motion.div>
      )}

      {/* Loading skeleton — shown above the table, not instead of it.
          The table stays mounted so its internal selection state is preserved
          across searches. We pass an empty array while loading so it renders
          its own empty state rather than crashing on undefined. */}
      {isLoading && (
        <div className="glass-card overflow-hidden">
          <div className="p-4 space-y-3">
            {[1,2,3,4,5].map(i => (
              <div key={i} className="flex gap-4">
                <div className="skeleton h-4 w-48 rounded" />
                <div className="skeleton h-4 w-32 rounded" />
                <div className="skeleton h-4 w-24 rounded" />
                <div className="skeleton h-4 w-16 rounded" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lead Table — always rendered (never conditionally unmounted).
          Passing an empty array while loading instead of unmounting prevents
          internal state resets (checkbox selections, savedIds) on every search. */}
      {!isLoading && (
        <LeadTable
          leads={Array.isArray(displayLeads) ? displayLeads : []}
          mode={activeTab === 'saved' ? 'saved' : 'search'}
          onGenerateMessage={handleGenerateMessage}
        />
      )}
    </div>
  )
}