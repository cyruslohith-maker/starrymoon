import { NextResponse } from "next/server"

/**
 * GET /api/instagram/followers
 *
 * Fetches the live Instagram follower count for @starrymoon.in
 * by reading the public profile page metadata.
 *
 * Caches the result for 1 hour to avoid rate limiting.
 * Falls back to a hardcoded value if the fetch fails.
 */

const INSTAGRAM_USERNAME = "starrymoon.in"
const FALLBACK_COUNT = "3,266"
const CACHE_DURATION_MS = 60 * 60 * 1000 // 1 hour

let cachedCount: string | null = null
let cachedAt = 0

function formatNumber(n: number): string {
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M"
    if (n >= 10_000) return (n / 1_000).toFixed(1).replace(/\.0$/, "") + "K"
    return n.toLocaleString("en-IN")
}

async function fetchFollowerCount(): Promise<string> {
    // Return cached if fresh
    if (cachedCount && Date.now() - cachedAt < CACHE_DURATION_MS) {
        return cachedCount
    }

    try {
        // Fetch the public Instagram profile page
        const res = await fetch(`https://www.instagram.com/${INSTAGRAM_USERNAME}/`, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                "Accept": "text/html,application/xhtml+xml",
                "Accept-Language": "en-US,en;q=0.9",
            },
            next: { revalidate: 3600 }, // Next.js cache for 1 hour
        })

        if (!res.ok) throw new Error(`HTTP ${res.status}`)

        const html = await res.text()

        // Try to find follower count from meta description
        // Instagram meta description format: "3,266 Followers, 100 Following, 50 Posts ..."
        const metaMatch = html.match(
            /content="([\d,\.]+[KMkm]?)\s*Followers/i
        )

        if (metaMatch) {
            const raw = metaMatch[1].replace(/,/g, "")
            const num = parseFloat(raw)

            let count: number
            if (raw.toLowerCase().endsWith("m")) {
                count = num * 1_000_000
            } else if (raw.toLowerCase().endsWith("k")) {
                count = num * 1_000
            } else {
                count = num
            }

            if (!isNaN(count) && count > 0) {
                cachedCount = formatNumber(count)
                cachedAt = Date.now()
                return cachedCount
            }
        }

        // Try og:description as fallback
        const ogMatch = html.match(
            /property="og:description"[^>]*content="([\d,\.]+[KMkm]?)\s*Followers/i
        )

        if (ogMatch) {
            const raw = ogMatch[1].replace(/,/g, "")
            const num = parseFloat(raw)
            if (!isNaN(num) && num > 0) {
                cachedCount = formatNumber(num)
                cachedAt = Date.now()
                return cachedCount
            }
        }

        // Try JSON-LD or shared data
        const jsonMatch = html.match(/"edge_followed_by":\{"count":(\d+)\}/)
        if (jsonMatch) {
            const num = parseInt(jsonMatch[1], 10)
            if (!isNaN(num) && num > 0) {
                cachedCount = formatNumber(num)
                cachedAt = Date.now()
                return cachedCount
            }
        }

        throw new Error("Could not parse follower count")
    } catch (err) {
        console.error("Instagram follower fetch error:", err)
        // Return cached value if available, otherwise fallback
        return cachedCount || FALLBACK_COUNT
    }
}

export async function GET() {
    const count = await fetchFollowerCount()

    return NextResponse.json(
        { count, username: INSTAGRAM_USERNAME },
        {
            headers: {
                "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200",
            },
        }
    )
}
