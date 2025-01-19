'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { supabase, User } from '../lib/supabase'

type AuthContextType = {
  user: User | null
  loading: boolean
  signIn: () => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        console.log('🔐 User logged in:', {
          userId: session.user.id,
          email: session.user.email,
          event
        });
      } else if (event === 'TOKEN_REFRESHED') {
        console.log('Token refreshed successfully');
      } else if (event === 'SIGNED_OUT') {
        console.log('User signed out');
      }
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          queryParams: {
            prompt: 'select_account'
          },
          redirectTo: window.location.origin
        }
      })

      if (error) {
        console.error('Error during sign in:', {
          error,
          errorMessage: error.message,
          errorStatus: error.status
        });
        
        // If it's a rate limit error, show a user-friendly message
        if (error.status === 429) {
          alert('Too many login attempts. Please wait a moment and try again.');
        } else {
          alert('Failed to sign in. Please try again.');
        }
      }
    } catch (error) {
      console.error('Unexpected error during sign in:', error);
      alert('An unexpected error occurred. Please try again.');
    }
  }

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error('Error during sign out:', {
          error,
          errorMessage: error.message
        });
        alert('Failed to sign out. Please try again.');
      }
    } catch (error) {
      console.error('Unexpected error during sign out:', error);
      alert('An unexpected error occurred while signing out. Please try again.');
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
} 