import { createClient, type SupabaseClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

// Graceful fallback: if env vars are missing, create a client that will
// return errors at query time instead of crashing on startup
export const supabase: SupabaseClient = supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : createClient("https://placeholder.supabase.co", "placeholder")

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)
