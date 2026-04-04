"use client"

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"

// ─── Types ───────────────────────────────────────

export type UserRole = "owner" | "employee" | "customer" | "guest"

export interface AuthUser {
    id: string
    name: string
    email: string
    role: UserRole
    phone?: string
    address?: string
    city?: string
    state?: string
    pincode?: string
    createdAt: string
}

interface AuthContextType {
    user: AuthUser | null
    loading: boolean
    login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>
    googleLogin: (credential: string) => Promise<{ ok: boolean; error?: string; user?: AuthUser }>
    register: (data: { name: string; email: string; password: string; phone?: string }) => Promise<{ ok: boolean; error?: string }>
    logout: () => Promise<void>
    refresh: () => Promise<void>
    // Role helpers
    isOwner: boolean
    isEmployee: boolean
    isStaff: boolean
    isCustomer: boolean
    isGuest: boolean
}

// ─── Context ─────────────────────────────────────

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(null)
    const [loading, setLoading] = useState(true)

    // Fetch current user on mount
    const refresh = useCallback(async () => {
        try {
            const res = await fetch("/api/auth/me")
            const data = await res.json()
            setUser(data.user || null)
        } catch {
            setUser(null)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        refresh()
    }, [refresh])

    const login = useCallback(async (email: string, password: string) => {
        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            })
            const data = await res.json()

            if (res.ok && data.user) {
                setUser(data.user)
                return { ok: true }
            }
            return { ok: false, error: data.error || "Login failed" }
        } catch {
            return { ok: false, error: "Network error" }
        }
    }, [])

    const googleLogin = useCallback(async (credential: string) => {
        try {
            const res = await fetch("/api/auth/google", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ credential }),
            })
            const data = await res.json()

            if (res.ok && data.user) {
                setUser(data.user)
                return { ok: true, user: data.user as AuthUser }
            }
            return { ok: false, error: data.error || "Google login failed" }
        } catch {
            return { ok: false, error: "Network error" }
        }
    }, [])

    const register = useCallback(async (regData: { name: string; email: string; password: string; phone?: string }) => {
        try {
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(regData),
            })
            const data = await res.json()

            if (res.ok && data.user) {
                // Auto-login after registration
                const loginResult = await login(regData.email, regData.password)
                return loginResult
            }
            return { ok: false, error: data.error || "Registration failed" }
        } catch {
            return { ok: false, error: "Network error" }
        }
    }, [login])

    const logout = useCallback(async () => {
        try {
            await fetch("/api/auth/logout", { method: "POST" })
        } catch {
            // Even if request fails, clear local state
        }
        setUser(null)
    }, [])

    const isOwner = user?.role === "owner"
    const isEmployee = user?.role === "employee"
    const isStaff = isOwner || isEmployee
    const isCustomer = user?.role === "customer"
    const isGuest = !user

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                login,
                googleLogin,
                register,
                logout,
                refresh,
                isOwner,
                isEmployee,
                isStaff,
                isCustomer,
                isGuest,
            }}
        >
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (!context) throw new Error("useAuth must be used within an AuthProvider")
    return context
}
