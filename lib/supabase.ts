import { createClient, type SupabaseClient } from "@supabase/supabase-js"

let _supabase: SupabaseClient | null = null

/**
 * Get the Supabase client, creating it lazily to ensure
 * environment variables are available at call time (important for Vercel).
 */
function getSupabase(): SupabaseClient {
    if (_supabase) return _supabase

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

    if (url && key) {
        _supabase = createClient(url, key)
    } else {
        // Fallback — won't crash but queries will fail gracefully
        console.warn("Supabase env vars not configured — using placeholder")
        _supabase = createClient("https://placeholder.supabase.co", "placeholder")
    }

    return _supabase
}

// Export a proxy that lazily initializes the client on first access
export const supabase = new Proxy({} as SupabaseClient, {
    get(_target, prop) {
        const client = getSupabase()
        const value = (client as unknown as Record<string | symbol, unknown>)[prop]
        if (typeof value === "function") {
            return value.bind(client)
        }
        return value
    },
})

export const isSupabaseConfigured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)
