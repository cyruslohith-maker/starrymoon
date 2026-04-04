import { randomBytes, pbkdf2Sync } from "crypto"
import { supabase } from "@/lib/supabase"

// ─── Types ───────────────────────────────────────

export type UserRole = "owner" | "employee" | "customer" | "guest"

export type AuthProvider = "email" | "google"

export interface User {
    id: string
    name: string
    email: string
    passwordHash: string
    salt: string
    role: UserRole
    phone?: string
    address?: string
    city?: string
    state?: string
    pincode?: string
    createdAt: string
    authProvider: AuthProvider
    googleId?: string
    picture?: string
}

export interface Session {
    token: string
    userId: string
    createdAt: string
    expiresAt: string
}

// Public user shape (no password/salt)
export type SafeUser = Omit<User, "passwordHash" | "salt">

// ─── Supabase Row Mappers ────────────────────────
// Map between camelCase (app) and snake_case (Supabase)

function rowToUser(row: Record<string, unknown>): User {
    return {
        id: row.id as string,
        name: row.name as string,
        email: row.email as string,
        passwordHash: (row.password_hash as string) || "",
        salt: (row.salt as string) || "",
        role: (row.role as UserRole) || "customer",
        phone: (row.phone as string) || "",
        address: (row.address as string) || "",
        city: (row.city as string) || "",
        state: (row.state as string) || "",
        pincode: (row.pincode as string) || "",
        createdAt: (row.created_at as string) || new Date().toISOString(),
        authProvider: (row.auth_provider as AuthProvider) || "email",
        googleId: (row.google_id as string) || undefined,
        picture: (row.picture as string) || undefined,
    }
}

function rowToSession(row: Record<string, unknown>): Session {
    return {
        token: row.token as string,
        userId: row.user_id as string,
        createdAt: row.created_at as string,
        expiresAt: row.expires_at as string,
    }
}

// ─── Password Hashing ────────────────────────────

const ITERATIONS = 100_000
const KEY_LENGTH = 64
const DIGEST = "sha512"

export function hashPassword(password: string, salt?: string): { hash: string; salt: string } {
    const useSalt = salt || randomBytes(16).toString("hex")
    const hash = pbkdf2Sync(password, useSalt, ITERATIONS, KEY_LENGTH, DIGEST).toString("hex")
    return { hash, salt: useSalt }
}

export function verifyPassword(password: string, storedHash: string, salt: string): boolean {
    const { hash } = hashPassword(password, salt)
    return hash === storedHash
}

// ─── Session Tokens ──────────────────────────────

export function generateSessionToken(): string {
    return randomBytes(32).toString("hex")
}

// ─── User CRUD ───────────────────────────────────

export async function readUsers(): Promise<User[]> {
    const { data, error } = await supabase.from("users").select("*")
    if (error || !data) return []
    return data.map(rowToUser)
}

export async function findUserByEmail(email: string): Promise<User | null> {
    const { data, error } = await supabase
        .from("users")
        .select("*")
        .ilike("email", email)
        .limit(1)
        .single()

    if (error || !data) return null
    return rowToUser(data)
}

export async function findUserById(id: string): Promise<User | null> {
    const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", id)
        .limit(1)
        .single()

    if (error || !data) return null
    return rowToUser(data)
}

export async function createUser(data: {
    name: string
    email: string
    password: string
    role?: UserRole
    phone?: string
}): Promise<SafeUser> {
    // Check duplicate email
    const existing = await findUserByEmail(data.email)
    if (existing) {
        throw new Error("Email already registered")
    }

    const { hash, salt } = hashPassword(data.password)
    const id = "USR-" + Date.now().toString(36).toUpperCase() + randomBytes(3).toString("hex").toUpperCase()

    const { error } = await supabase.from("users").insert({
        id,
        name: data.name,
        email: data.email.toLowerCase(),
        password_hash: hash,
        salt,
        role: data.role || "customer",
        phone: data.phone || "",
        auth_provider: "email",
        created_at: new Date().toISOString(),
    })

    if (error) throw new Error(error.message)

    const user = await findUserById(id)
    if (!user) throw new Error("Failed to create user")

    return toSafeUser(user)
}

export async function updateUser(id: string, updates: Partial<Omit<User, "id" | "passwordHash" | "salt">>): Promise<void> {
    // Convert camelCase to snake_case for Supabase
    const dbUpdates: Record<string, unknown> = {}
    if (updates.name !== undefined) dbUpdates.name = updates.name
    if (updates.email !== undefined) dbUpdates.email = updates.email
    if (updates.role !== undefined) dbUpdates.role = updates.role
    if (updates.phone !== undefined) dbUpdates.phone = updates.phone
    if (updates.address !== undefined) dbUpdates.address = updates.address
    if (updates.city !== undefined) dbUpdates.city = updates.city
    if (updates.state !== undefined) dbUpdates.state = updates.state
    if (updates.pincode !== undefined) dbUpdates.pincode = updates.pincode
    if (updates.authProvider !== undefined) dbUpdates.auth_provider = updates.authProvider
    if (updates.googleId !== undefined) dbUpdates.google_id = updates.googleId
    if (updates.picture !== undefined) dbUpdates.picture = updates.picture

    const { error } = await supabase.from("users").update(dbUpdates).eq("id", id)
    if (error) throw new Error(error.message)
}

export function toSafeUser(user: User): SafeUser {
    const { passwordHash: _ph, salt: _s, ...safe } = user
    return safe
}

/**
 * Create or find user from Google Sign-In
 */
export async function findOrCreateGoogleUser(data: {
    email: string
    name: string
    googleId: string
    picture?: string
}): Promise<SafeUser> {
    const existing = await findUserByEmail(data.email)

    if (existing) {
        // If user exists, update their Google info and return
        if (!existing.googleId) {
            await supabase
                .from("users")
                .update({
                    google_id: data.googleId,
                    picture: data.picture,
                    auth_provider: existing.authProvider || "google",
                })
                .eq("id", existing.id)
        }
        return toSafeUser(existing)
    }

    // Create new Google user (no password needed)
    const id = "USR-" + Date.now().toString(36).toUpperCase() + randomBytes(3).toString("hex").toUpperCase()

    const { error } = await supabase.from("users").insert({
        id,
        name: data.name,
        email: data.email.toLowerCase(),
        password_hash: "",
        salt: "",
        role: "customer",
        auth_provider: "google",
        google_id: data.googleId,
        picture: data.picture,
        created_at: new Date().toISOString(),
    })

    if (error) throw new Error(error.message)

    const user = await findUserById(id)
    if (!user) throw new Error("Failed to create Google user")

    return toSafeUser(user)
}

// ─── Session CRUD ────────────────────────────────

export async function createSession(userId: string): Promise<Session> {
    // Clean expired sessions
    await supabase
        .from("sessions")
        .delete()
        .lt("expires_at", new Date().toISOString())

    const now = new Date()
    const session: Session = {
        token: generateSessionToken(),
        userId,
        createdAt: now.toISOString(),
        expiresAt: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
    }

    const { error } = await supabase.from("sessions").insert({
        token: session.token,
        user_id: session.userId,
        created_at: session.createdAt,
        expires_at: session.expiresAt,
    })

    if (error) throw new Error(error.message)

    return session
}

export async function getSessionUser(token: string): Promise<SafeUser | null> {
    if (!token) return null

    const { data, error } = await supabase
        .from("sessions")
        .select("*")
        .eq("token", token)
        .limit(1)
        .single()

    if (error || !data) return null

    const session = rowToSession(data)
    if (new Date(session.expiresAt) < new Date()) return null

    const user = await findUserById(session.userId)
    if (!user) return null

    return toSafeUser(user)
}

export async function deleteSession(token: string): Promise<void> {
    await supabase.from("sessions").delete().eq("token", token)
}

// ─── Seed Default Owner ──────────────────────────

export async function seedOwnerIfNeeded(): Promise<void> {
    const { data } = await supabase
        .from("users")
        .select("id")
        .eq("role", "owner")
        .limit(1)

    if (data && data.length > 0) return

    const { hash, salt } = hashPassword("starrymoon2026")

    await supabase.from("users").insert({
        id: "USR-OWNER001",
        name: "Starrymoon Owner",
        email: "owner@starrymoon.in.com",
        password_hash: hash,
        salt,
        role: "owner",
        auth_provider: "email",
        created_at: new Date().toISOString(),
    })
}

// ─── Role Checks ─────────────────────────────────

export function isStaff(role: UserRole): boolean {
    return role === "owner" || role === "employee"
}

export function isOwner(role: UserRole): boolean {
    return role === "owner"
}

// ─── Cookie Name ─────────────────────────────────

export const SESSION_COOKIE = "starrymoon_session"
