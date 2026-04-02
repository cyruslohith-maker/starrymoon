import { NextRequest, NextResponse } from "next/server"
import { findOrCreateGoogleUser, createSession, SESSION_COOKIE } from "@/lib/auth"

/**
 * POST /api/auth/google
 * Body: { credential } — the Google ID token JWT
 * Decodes the JWT payload (base64), extracts user info,
 * finds or creates the user, and sets a session cookie.
 */
export async function POST(req: NextRequest) {
    try {
        const { credential } = await req.json()

        if (!credential) {
            return NextResponse.json({ error: "Missing Google credential" }, { status: 400 })
        }

        // Decode the JWT payload (Google ID tokens are JWTs — header.payload.signature)
        // We decode the payload to extract user info. Full signature verification
        // should be done via Google's tokeninfo endpoint in production.
        const parts = credential.split(".")
        if (parts.length !== 3) {
            return NextResponse.json({ error: "Invalid credential format" }, { status: 400 })
        }

        const payload = JSON.parse(
            Buffer.from(parts[1], "base64url").toString("utf-8")
        )

        const { sub: googleId, email, name, picture } = payload

        if (!email || !googleId) {
            return NextResponse.json({ error: "Invalid Google token payload" }, { status: 400 })
        }

        // Verify the token audience matches our client ID
        const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
        if (clientId && payload.aud !== clientId) {
            return NextResponse.json({ error: "Token audience mismatch" }, { status: 401 })
        }

        // Verify the token hasn't expired
        const now = Math.floor(Date.now() / 1000)
        if (payload.exp && payload.exp < now) {
            return NextResponse.json({ error: "Token expired" }, { status: 401 })
        }

        // Find or create the user
        const user = await findOrCreateGoogleUser({
            email,
            name: name || email.split("@")[0],
            googleId,
            picture,
        })

        // Create session
        const session = await createSession(user.id)

        // Set HTTP-only cookie (same pattern as email login)
        const response = NextResponse.json({ user }, { status: 200 })
        response.cookies.set(SESSION_COOKIE, session.token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: 7 * 24 * 60 * 60, // 7 days
        })

        return response
    } catch (error) {
        console.error("Google auth error:", error)
        return NextResponse.json({ error: "Google authentication failed" }, { status: 500 })
    }
}
