"use client"

import { useEffect, useState } from "react"

const FALLBACK = "3,266"

/**
 * Fetches the live Instagram follower count from our API.
 * Falls back to the hardcoded value if the fetch fails.
 */
export function useInstagramFollowers(): string {
    const [count, setCount] = useState(FALLBACK)

    useEffect(() => {
        let cancelled = false

        async function load() {
            try {
                const res = await fetch("/api/instagram/followers")
                if (!res.ok) throw new Error("fetch failed")
                const data = await res.json()
                if (!cancelled && data?.count) {
                    setCount(data.count + "+")
                }
            } catch {
                // Keep fallback
            }
        }

        load()

        return () => { cancelled = true }
    }, [])

    return count
}
