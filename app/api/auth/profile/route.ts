import { NextRequest, NextResponse } from "next/server"
import { getSessionUser, updateUser, SESSION_COOKIE } from "@/lib/auth"

/**
 * GET /api/auth/profile — get current user profile
 */
export async function GET(req: NextRequest) {
    try {
        const token = req.cookies.get(SESSION_COOKIE)?.value
        if (!token) {
            return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
        }

        const user = await getSessionUser(token)
        if (!user) {
            return NextResponse.json({ error: "Session expired" }, { status: 401 })
        }

        return NextResponse.json({ user }, { status: 200 })
    } catch (error) {
        console.error("Profile GET error:", error)
        return NextResponse.json({ error: "Failed to load profile" }, { status: 500 })
    }
}

/**
 * PATCH /api/auth/profile — update current user's profile
 */
export async function PATCH(req: NextRequest) {
    try {
        const token = req.cookies.get(SESSION_COOKIE)?.value
        if (!token) {
            return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
        }

        const user = await getSessionUser(token)
        if (!user) {
            return NextResponse.json({ error: "Session expired" }, { status: 401 })
        }

        const body = await req.json()
        const allowedFields = ["name", "phone", "address", "city", "state", "pincode", "picture"] as const
        const updates: Record<string, string> = {}

        for (const field of allowedFields) {
            if (body[field] !== undefined) {
                updates[field] = body[field]
            }
        }

        if (Object.keys(updates).length === 0) {
            return NextResponse.json({ error: "No fields to update" }, { status: 400 })
        }

        await updateUser(user.id, updates)

        // Return updated user
        const updatedUser = await getSessionUser(token)
        return NextResponse.json({ user: updatedUser }, { status: 200 })
    } catch (error) {
        console.error("Profile PATCH error:", error)
        return NextResponse.json({ error: "Failed to update profile" }, { status: 500 })
    }
}
