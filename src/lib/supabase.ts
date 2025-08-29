// This file is kept for compatibility but authentication is now handled by the backend
// The frontend no longer needs direct Supabase client access for auth

export const supabase = null

// Auth types (simplified for frontend use)
export type AuthUser = {
  id: string
  email: string
  full_name?: string
}

export type AuthSession = {
  user: AuthUser
} 