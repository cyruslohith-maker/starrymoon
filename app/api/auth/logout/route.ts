import { NextRequest, NextResponse } from "next/server"
import { deleteSession, SESSION_COOKIE } from "@/lib/auth"

/**
 * POST /api/auth/logout
 * Destroys the session and clears the cookie
 */
export async function POST(req: NextRequest) {
    try {
        const token = req.cookies.get(SESSION_COOKIE)?.value

        if (token) {
            await deleteSession(token)
        }

        const response = NextResponse.json({ ok: true }, { status: 200 })
        response.cookies.set(SESSION_COOKIE, "", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: 0, // Delete immediately
        })

        return response
    } catch (error) {
        console.error("Logout error:", error)
        return NextResponse.json({ error: "Logout failed" }, { status: 500 })
    }
}
