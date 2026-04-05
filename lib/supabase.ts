import { createClient, type SupabaseClient } from "@supabase/supabase-js"

let _supabase: SupabaseClient | null = null

/**
 * Lazy-initialized Supabase client.
 * Must be called as a function — not imported as a constant —
 * to ensure Vercel env vars are available at runtime.
 */
export function getSupabase(): SupabaseClient {
    if (_supabase) return _supabase

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!url || !key) {
        throw new Error(
            "Supabase not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY"
        )
    }

    _supabase = createClient(url, key)
    return _supabase
}

export const isSupabaseConfigured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)
