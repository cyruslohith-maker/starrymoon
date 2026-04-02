import { randomBytes, pbkdf2Sync } from "crypto"
import { promises as fs } from "fs"
import path from "path"

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

// ─── File Paths ──────────────────────────────────

const USERS_FILE = path.join(process.cwd(), "data", "users.json")
const SESSIONS_FILE = path.join(process.cwd(), "data", "sessions.json")

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

async function ensureDataDir() {
    await fs.mkdir(path.dirname(USERS_FILE), { recursive: true })
}

export async function readUsers(): Promise<User[]> {
    try {
        const raw = await fs.readFile(USERS_FILE, "utf-8")
        return JSON.parse(raw)
    } catch {
        return []
    }
}

async function writeUsers(users: User[]): Promise<void> {
    await ensureDataDir()
    await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2), "utf-8")
}

export async function findUserByEmail(email: string): Promise<User | null> {
    const users = await readUsers()
    return users.find((u) => u.email.toLowerCase() === email.toLowerCase()) || null
}

export async function findUserById(id: string): Promise<User | null> {
    const users = await readUsers()
    return users.find((u) => u.id === id) || null
}

export async function createUser(data: {
    name: string
    email: string
    password: string
    role?: UserRole
    phone?: string
}): Promise<SafeUser> {
    const users = await readUsers()

    // Check duplicate email
    if (users.some((u) => u.email.toLowerCase() === data.email.toLowerCase())) {
        throw new Error("Email already registered")
    }

    const { hash, salt } = hashPassword(data.password)
    const newUser: User = {
        id: "USR-" + Date.now().toString(36).toUpperCase() + randomBytes(3).toString("hex").toUpperCase(),
        name: data.name,
        email: data.email.toLowerCase(),
        passwordHash: hash,
        salt,
        role: data.role || "customer",
        phone: data.phone || "",
        createdAt: new Date().toISOString(),
        authProvider: "email",
    }

    users.push(newUser)
    await writeUsers(users)

    return toSafeUser(newUser)
}

export async function updateUser(id: string, updates: Partial<Omit<User, "id" | "passwordHash" | "salt">>): Promise<void> {
    const users = await readUsers()
    const index = users.findIndex((u) => u.id === id)
    if (index === -1) throw new Error("User not found")
    users[index] = { ...users[index], ...updates }
    await writeUsers(users)
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
    const users = await readUsers()
    const existing = users.find((u) => u.email.toLowerCase() === data.email.toLowerCase())

    if (existing) {
        // If user exists, update their Google info and return
        if (!existing.googleId) {
            existing.googleId = data.googleId
            existing.picture = data.picture
            existing.authProvider = existing.authProvider || "google"
            await writeUsers(users)
        }
        return toSafeUser(existing)
    }

    // Create new Google user (no password needed)
    const newUser: User = {
        id: "USR-" + Date.now().toString(36).toUpperCase() + randomBytes(3).toString("hex").toUpperCase(),
        name: data.name,
        email: data.email.toLowerCase(),
        passwordHash: "",
        salt: "",
        role: "customer",
        createdAt: new Date().toISOString(),
        authProvider: "google",
        googleId: data.googleId,
        picture: data.picture,
    }

    users.push(newUser)
    await writeUsers(users)

    return toSafeUser(newUser)
}

// ─── Session CRUD ────────────────────────────────

export async function readSessions(): Promise<Session[]> {
    try {
        const raw = await fs.readFile(SESSIONS_FILE, "utf-8")
        return JSON.parse(raw)
    } catch {
        return []
    }
}

async function writeSessions(sessions: Session[]): Promise<void> {
    await ensureDataDir()
    await fs.writeFile(SESSIONS_FILE, JSON.stringify(sessions, null, 2), "utf-8")
}

export async function createSession(userId: string): Promise<Session> {
    const sessions = await readSessions()

    // Clean expired sessions
    const now = new Date()
    const active = sessions.filter((s) => new Date(s.expiresAt) > now)

    const session: Session = {
        token: generateSessionToken(),
        userId,
        createdAt: now.toISOString(),
        expiresAt: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
    }

    active.push(session)
    await writeSessions(active)

    return session
}

export async function getSessionUser(token: string): Promise<SafeUser | null> {
    if (!token) return null

    const sessions = await readSessions()
    const session = sessions.find((s) => s.token === token)

    if (!session) return null
    if (new Date(session.expiresAt) < new Date()) return null

    const user = await findUserById(session.userId)
    if (!user) return null

    return toSafeUser(user)
}

export async function deleteSession(token: string): Promise<void> {
    const sessions = await readSessions()
    const filtered = sessions.filter((s) => s.token !== token)
    await writeSessions(filtered)
}

// ─── Seed Default Owner ──────────────────────────

export async function seedOwnerIfNeeded(): Promise<void> {
    const users = await readUsers()
    const hasOwner = users.some((u) => u.role === "owner")
    if (hasOwner) return

    const { hash, salt } = hashPassword("st4rry2026")
    const owner: User = {
        id: "USR-OWNER001",
        name: "St4rrymoon Owner",
        email: "owner@st4rrymoon.com",
        passwordHash: hash,
        salt,
        role: "owner",
        createdAt: new Date().toISOString(),
        authProvider: "email",
    }

    users.push(owner)
    await writeUsers(users)
}

// ─── Role Checks ─────────────────────────────────

export function isStaff(role: UserRole): boolean {
    return role === "owner" || role === "employee"
}

export function isOwner(role: UserRole): boolean {
    return role === "owner"
}

// ─── Cookie Name ─────────────────────────────────

export const SESSION_COOKIE = "st4rry_session"
