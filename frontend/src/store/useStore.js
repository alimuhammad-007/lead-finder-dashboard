/**
 * store/useStore.js
 * ==================
 * Global state management with Zustand.
 * Keeps user, leads, messages, and UI state in one place.
 *
 * Zustand is simpler than Redux — just create a store with get/set.
 */

import { create } from 'zustand'

const useStore = create((set, get) => ({

  // ── Auth State ─────────────────────────────────────────
  user:    null,     // Supabase user object
  profile: null,     // Our custom profile from DB

  setUser:    (user)    => set({ user }),
  setProfile: (profile) => set({ profile }),
  clearUser:  ()        => set({ user: null, profile: null }),

  // ── Leads State ───────────────────────────────────────
  leads:          [],     // Saved leads from database
  searchResults:  [],     // Leads from current search (not yet saved)
  isSearching:    false,  // Loading state for search

  setLeads:         (leads)         => set({ leads }),
  setSearchResults: (searchResults) => set({ searchResults }),
  setIsSearching:   (isSearching)   => set({ isSearching }),

  addLeads: (newLeads) =>
    set(state => ({ leads: [...newLeads, ...state.leads] })),

  removeLead: (id) =>
    set(state => ({ leads: state.leads.filter(l => l.id !== id) })),

  updateLead: (id, updates) =>
    set(state => ({
      leads: state.leads.map(l => l.id === id ? { ...l, ...updates } : l)
    })),

  // ── Outreach Messages State ───────────────────────────
  messages:       [],
  isGenerating:   false,

  setMessages:     (messages)     => set({ messages }),
  setIsGenerating: (isGenerating) => set({ isGenerating }),

  addMessage: (message) =>
    set(state => ({ messages: [message, ...state.messages] })),

  removeMessage: (id) =>
    set(state => ({ messages: state.messages.filter(m => m.id !== id) })),

  // ── Dashboard Stats State ─────────────────────────────
  stats: {
    total_leads:    0,
    total_messages: 0,
    total_searches: 0,
    hot_leads:      0,
    average_score:  0,
    leads_by_status: {},
  },
  activity: [],

  setStats:    (stats)    => set({ stats }),
  setActivity: (activity) => set({ activity }),

  // ── UI State ──────────────────────────────────────────
  sidebarOpen:    true,
  activeTab:      'dashboard',
  notification:   null,   // { type: 'success'|'error', message: '' }

  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
  setActiveTab:   (activeTab)   => set({ activeTab }),

  /** Show a toast notification for 3 seconds */
  showNotification: (type, message) => {
    set({ notification: { type, message } })
    setTimeout(() => set({ notification: null }), 3500)
  },
}))

export default useStore