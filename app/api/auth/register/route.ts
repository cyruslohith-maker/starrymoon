import { NextRequest, NextResponse } from "next/server"
import { createUser, findUserByEmail, getSessionUser, SESSION_COOKIE, type UserRole } from "@/lib/auth"

/**
 * POST /api/auth/register
 * Body: { name, email, password, phone?, role? }
 *
 * Public registration creates "customer" accounts.
 * Only an existing owner can create "employee" or "owner" accounts.
 */
export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const { name, email, password, phone, role } = body

        if (!name || !email || !password) {
            return NextResponse.json({ error: "Name, email, and password are required" }, { status: 400 })
        }

        if (password.length < 6) {
            return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 })
        }

        // Check if email already taken
        const existing = await findUserByEmail(email)
        if (existing) {
            return NextResponse.json({ error: "Email already registered" }, { status: 409 })
        }

        // Role escalation check — only owners can create staff accounts
        let assignedRole: UserRole = "customer"
        if (role === "employee" || role === "owner") {
            const sessionToken = req.cookies.get(SESSION_COOKIE)?.value
            const currentUser = sessionToken ? await getSessionUser(sessionToken) : null

            if (!currentUser || currentUser.role !== "owner") {
                return NextResponse.json(
                    { error: "Only owners can create employee or owner accounts" },
                    { status: 403 }
                )
            }
            assignedRole = role
        }

        const user = await createUser({
            name,
            email,
            password,
            role: assignedRole,
            phone,
        })

        return NextResponse.json({ user }, { status: 201 })
    } catch (error) {
        console.error("Register error:", error)
        const message = error instanceof Error ? error.message : "Registration failed"
        return NextResponse.json({ error: message }, { status: 500 })
    }
}
