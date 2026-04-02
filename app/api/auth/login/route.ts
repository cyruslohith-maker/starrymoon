import { NextRequest, NextResponse } from "next/server"
import { findUserByEmail, verifyPassword, createSession, toSafeUser, SESSION_COOKIE, seedOwnerIfNeeded } from "@/lib/auth"

/**
 * POST /api/auth/login
 * Body: { email, password }
 * Returns: { user } + sets session cookie
 */
export async function POST(req: NextRequest) {
    try {
        // Seed owner on first ever login attempt
        await seedOwnerIfNeeded()

        const { email, password } = await req.json()

        if (!email || !password) {
            return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
        }

        const user = await findUserByEmail(email)
        if (!user) {
            return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
        }

        const valid = verifyPassword(password, user.passwordHash, user.salt)
        if (!valid) {
            return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
        }

        // Create session
        const session = await createSession(user.id)

        // Set HTTP-only cookie
        const response = NextResponse.json({ user: toSafeUser(user) }, { status: 200 })
        response.cookies.set(SESSION_COOKIE, session.token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: 7 * 24 * 60 * 60, // 7 days
        })

        return response
    } catch (error) {
        console.error("Login error:", error)
        return NextResponse.json({ error: "Login failed" }, { status: 500 })
    }
}
