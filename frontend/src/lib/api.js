/**
 * lib/api.js
 * ===========
 * Centralized API calls to the Flask backend.
 * All functions return { data, error } objects — never throw.
 */

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

/**
 * Core fetch wrapper with error handling.
 * Returns { data: ..., error: null } on success
 * Returns { data: null, error: "message" } on failure
 */
async function apiFetch(path, options = {}) {
  try {
    const response = await fetch(`${BASE_URL}${path}`, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    })

    const json = await response.json()

    if (!response.ok || !json.success) {
      return { data: null, error: json.message || 'Request failed' }
    }

    return { data: json.data, error: null }
  } catch (err) {
    return { data: null, error: err.message || 'Network error' }
  }
}

// ─── Leads API ────────────────────────────────────────────

export const leadsAPI = {
  /** Search for leads by business type + location */
  search: (businessType, location, userId) =>
    apiFetch('/api/leads/search', {
      method: 'POST',
      body: JSON.stringify({ business_type: businessType, location, user_id: userId }),
    }),

  /** Get saved leads for a user */
  getAll: (userId, status = 'all', search = '') =>
    apiFetch(`/api/leads/?user_id=${userId}&status=${status}&search=${search}`),

  /** Save a batch of leads */
  save: (userId, leads) =>
    apiFetch('/api/leads/save', {
      method: 'POST',
      body: JSON.stringify({ user_id: userId, leads }),
    }),

  /** Delete a lead */
  delete: (leadId, userId) =>
    apiFetch(`/api/leads/${leadId}?user_id=${userId}`, { method: 'DELETE' }),

  /** Update lead status or notes */
  update: (leadId, userId, updates) =>
    apiFetch(`/api/leads/${leadId}`, {
      method: 'PATCH',
      body: JSON.stringify({ user_id: userId, ...updates }),
    }),
}

// ─── Outreach API ─────────────────────────────────────────

export const outreachAPI = {
  /** Generate an AI outreach message */
  generate: (params) =>
    apiFetch('/api/outreach/generate', {
      method: 'POST',
      body: JSON.stringify(params),
    }),

  /** Get saved messages */
  getAll: (userId) =>
    apiFetch(`/api/outreach/?user_id=${userId}`),

  /** Delete a message */
  delete: (messageId, userId) =>
    apiFetch(`/api/outreach/${messageId}?user_id=${userId}`, { method: 'DELETE' }),
}

// ─── Analytics API ────────────────────────────────────────

export const analyticsAPI = {
  /** Get dashboard stats */
  getStats: (userId) =>
    apiFetch(`/api/db/stats/${userId}`),

  /** Get activity log */
  getActivity: (userId) =>
    apiFetch(`/api/db/activity/${userId}`),
}

// ─── Auth API ────────────────────────────────────────────

export const authAPI = {
  getProfile: (userId) =>
    apiFetch(`/api/auth/profile/${userId}`),

  updateProfile: (userId, updates) =>
    apiFetch(`/api/auth/profile/${userId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    }),
}

// ─── CSV Export Utility ───────────────────────────────────

/**
 * Export an array of lead objects to a downloadable CSV file.
 * No backend needed — pure client-side.
 */
export function exportLeadsToCSV(leads, filename = 'leads.csv') {
  if (!leads || leads.length === 0) return

  const headers = ['Business Name', 'Email', 'Phone', 'Website', 'Address', 'City', 'Type', 'Score', 'Status', 'Rating']
  const keys    = ['business_name', 'email', 'phone', 'website', 'address', 'city', 'business_type', 'score', 'status', 'rating']

  const rows = leads.map(lead =>
    keys.map(key => {
      const val = lead[key] ?? ''
      // Escape commas and quotes in CSV values
      return `"${String(val).replace(/"/g, '""')}"`
    }).join(',')
  )

  const csv     = [headers.join(','), ...rows].join('\n')
  const blob    = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url     = URL.createObjectURL(blob)
  const link    = document.createElement('a')
  link.href     = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}