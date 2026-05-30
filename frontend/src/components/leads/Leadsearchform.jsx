/**
 * components/leads/LeadSearchForm.jsx
 * =====================================
 * Form to search for leads by business type + location.
 * Calls the Flask backend and stores results in Zustand.
 */

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, MapPin, Briefcase, Sparkles } from 'lucide-react'
import { leadsAPI } from '../../lib/api'
import useStore from '../../store/useStore'

// Quick suggestion chips for common searches
const SUGGESTIONS = [
  { type: 'dentist',           location: 'New York' },
  { type: 'plumber',           location: 'Los Angeles' },
  { type: 'marketing agency',  location: 'Chicago' },
  { type: 'restaurant',        location: 'Miami' },
  { type: 'gym',               location: 'Austin' },
  { type: 'real estate agent', location: 'Seattle' },
]

export default function LeadSearchForm() {
  const [businessType, setBusinessType] = useState('')
  const [location,     setLocation]     = useState('')

  const {
    user,
    isSearching,
    setIsSearching,
    setSearchResults,
    showNotification,
  } = useStore()

  async function handleSearch(e) {
    e?.preventDefault()
    if (!businessType.trim() || !location.trim()) {
      showNotification('error', 'Please enter both business type and location')
      return
    }

    setIsSearching(true)
    setSearchResults([])  // clear stale results while loading

    const { data, error } = await leadsAPI.search(
      businessType.trim(),
      location.trim(),
      user?.id,
    )

    // Batch both state updates together so the table never sees
    // isSearching=false with an empty array (which triggers the empty state flash).
    // setSearchResults triggers the re-render; setIsSearching piggybacks on it.
    if (error) {
      setIsSearching(false)
      showNotification('error', error)
    } else {
      // data is already json.data from apiFetch, so the shape is:
      // { leads: [...], count: N, query: {...} }
      const leads = Array.isArray(data?.leads) ? data.leads : []
      setSearchResults(leads)   // update results first
      setIsSearching(false)     // then clear loading flag — one paint cycle, correct order
      showNotification('success', `Found ${leads.length} lead${leads.length !== 1 ? 's' : ''} in ${location}`)
    }
  }

  function useSuggestion(s) {
    setBusinessType(s.type)
    setLocation(s.location)
  }

  return (
    <div className="glass-card p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-8 h-8 rounded-lg bg-brand-400/10 border border-brand-400/20 flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-brand-400" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-white">Find Business Leads</h2>
          <p className="text-xs text-gray-500">Search any business type in any location</p>
        </div>
      </div>

      <form onSubmit={handleSearch} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Business Type */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">
              Business Type
            </label>
            <div className="relative">
              <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                value={businessType}
                onChange={e => setBusinessType(e.target.value)}
                placeholder="e.g. dentist, plumber, gym..."
                className="input-field pl-10"
              />
            </div>
          </div>

          {/* Location */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">
              Location
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                value={location}
                onChange={e => setLocation(e.target.value)}
                placeholder="e.g. New York, London..."
                className="input-field pl-10"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSearching}
          className="btn-primary w-full sm:w-auto justify-center px-8 py-3"
        >
          {isSearching ? (
            <>
              <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              Searching...
            </>
          ) : (
            <><Search className="w-4 h-4" /> Find Leads</>
          )}
        </button>
      </form>

      {/* Quick Suggestions */}
      <div className="mt-4">
        <p className="text-xs text-gray-600 mb-2">Quick searches:</p>
        <div className="flex flex-wrap gap-2">
          {SUGGESTIONS.map((s, i) => (
            <button
              key={i}
              onClick={() => useSuggestion(s)}
              className="text-xs px-3 py-1.5 rounded-full bg-surface-700/50 border border-surface-600/50
                         text-gray-400 hover:text-white hover:border-surface-500 transition-colors"
            >
              {s.type} in {s.location}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}