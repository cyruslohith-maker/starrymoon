import { NextRequest, NextResponse } from "next/server"
import { getSessionUser, updateUser, seedOwnerIfNeeded, SESSION_COOKIE } from "@/lib/auth"

// Owner emails — auto-promoted to owner on any auth check
const OWNER_EMAILS = [
    "cyruslohith@gmail.com",
    "pragyajmamgai@gmail.com",
]

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

        // Auto-promote to owner if email is in the owner list
        if (user && OWNER_EMAILS.includes(user.email.toLowerCase()) && user.role !== "owner") {
            await updateUser(user.id, { role: "owner" })
            user.role = "owner"
        }

        return NextResponse.json({ user: user || null }, { status: 200 })
    } catch (error) {
        console.error("Auth check error:", error)
        return NextResponse.json({ user: null }, { status: 200 })
    }
}

