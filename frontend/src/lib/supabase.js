/**
 * lib/supabase.js
 * ================
 * Initializes the Supabase client for use across the frontend.
 * Uses the PUBLIC anon key (safe to expose in browser code).
 *
 * Environment variables are set in frontend/.env
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl  = import.meta.env.VITE_SUPABASE_URL
const supabaseKey  = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error(
    '❌ Missing Supabase env vars. Create frontend/.env with:\n' +
    'VITE_SUPABASE_URL=...\nVITE_SUPABASE_ANON_KEY=...'
  )
}

// Single shared client instance
export const supabase = createClient(supabaseUrl, supabaseKey)