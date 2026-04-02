import { NextRequest, NextResponse } from "next/server"
import { getSessionUser, seedOwnerIfNeeded, SESSION_COOKIE } from "@/lib/auth"

/**
 * GET /api/auth/me
 * Returns the current user from session cookie, or null for guest
 */
export async function GET(req: NextRequest) {
    try {
        // Ensure owner exists
        await seedOwnerIfNeeded()

        const token = req.cookies.get(SESSION_COOKIE)?.value
        if (!token) {
            return NextResponse.json({ user: null }, { status: 200 })
        }

        const user = await getSessionUser(token)
        return NextResponse.json({ user: user || null }, { status: 200 })
    } catch (error) {
        console.error("Auth check error:", error)
        return NextResponse.json({ user: null }, { status: 200 })
    }
}
