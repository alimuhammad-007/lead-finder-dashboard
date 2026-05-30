/**
 * hooks/useAuth.js
 * =================
 * Custom hook that wraps Supabase auth.
 * Provides login, signup, logout, and session listening.
 */

import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import useStore from '../store/useStore'

export function useAuth() {
  const { user, setUser, setProfile, clearUser, showNotification } = useStore()
  const navigate = useNavigate()

  /** Listen for auth state changes (login, logout, token refresh) */
  useEffect(() => {
    // Get current session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
    })

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  /** Sign up with email + password */
  async function signUp(email, password, fullName) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    })

    if (error) return { error: error.message }

    showNotification('success', 'Account created! Check your email to verify.')
    return { data }
  }

  /** Sign in with email + password */
  async function signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) return { error: error.message }

    showNotification('success', `Welcome back!`)
    navigate('/dashboard')
    return { data }
  }

  /** Sign out */
  async function signOut() {
    await supabase.auth.signOut()
    clearUser()
    navigate('/login')
  }

  return { user, signUp, signIn, signOut }
}