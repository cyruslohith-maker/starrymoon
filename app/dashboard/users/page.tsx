"use client"

import { useEffect, useState } from "react"
import { useAuth, type AuthUser } from "@/lib/auth-context"
import {
    Users, UserPlus, Shield, ShieldCheck, User, UserX,
    X, Loader2, Eye, EyeOff,
} from "lucide-react"

const roleBadges = {
    owner: { label: "Owner", color: "bg-violet-500/10 text-violet-600", icon: ShieldCheck },
    employee: { label: "Employee", color: "bg-blue-500/10 text-blue-600", icon: Shield },
    customer: { label: "Customer", color: "bg-emerald-500/10 text-emerald-600", icon: User },
    guest: { label: "Guest", color: "bg-gray-500/10 text-gray-500", icon: UserX },
}

export default function UsersPage() {
    const { user: currentUser, isOwner } = useAuth()
    const [users, setUsers] = useState<AuthUser[]>([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)

    // New employee form state
    const [formName, setFormName] = useState("")
    const [formEmail, setFormEmail] = useState("")
    const [formPhone, setFormPhone] = useState("")
    const [formPassword, setFormPassword] = useState("")
    const [formRole, setFormRole] = useState<"employee" | "owner">("employee")
    const [showPassword, setShowPassword] = useState(false)
    const [formError, setFormError] = useState("")
    const [formLoading, setFormLoading] = useState(false)

    useEffect(() => {
        loadUsers()
    }, [])

    const loadUsers = async () => {
        try {
            const res = await fetch("/api/auth/users")
            const data = await res.json()
            setUsers(data.users || [])
        } catch {
            setUsers([])
        } finally {
            setLoading(false)
        }
    }

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault()
        setFormError("")
        setFormLoading(true)

        try {
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: formName,
                    email: formEmail,
                    phone: formPhone,
                    password: formPassword,
                    role: formRole,
                }),
            })
            const data = await res.json()

            if (res.ok) {
                setShowForm(false)
                setFormName("")
                setFormEmail("")
                setFormPhone("")
                setFormPassword("")
                await loadUsers()
            } else {
                setFormError(data.error || "Failed to create user")
            }
        } catch {
            setFormError("Network error")
        } finally {
            setFormLoading(false)
        }
    }

    if (!isOwner) {
        return (
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-card py-16">
                <Shield className="h-10 w-10 text-muted-foreground/40" />
                <p className="text-sm font-semibold text-muted-foreground">Owner access required</p>
            </div>
        )
    }

    const owners = users.filter((u) => u.role === "owner")
    const employees = users.filter((u) => u.role === "employee")
    const customers = users.filter((u) => u.role === "customer")

    return (
        <div>
            {/* Header */}
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="font-serif text-2xl font-bold text-foreground">User Management</h1>
                    <p className="text-sm text-muted-foreground">
                        {users.length} total users — {owners.length} owner{owners.length !== 1 ? "s" : ""}, {employees.length} employee{employees.length !== 1 ? "s" : ""}, {customers.length} customer{customers.length !== 1 ? "s" : ""}
                    </p>
                </div>
                <button
                    onClick={() => setShowForm(true)}
                    className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-primary-foreground hover:bg-primary/90"
                >
                    <UserPlus className="h-4 w-4" />
                    Add Staff
                </button>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-16">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
            ) : (
                <div className="flex flex-col gap-6">
                    {/* Staff section */}
                    <div>
                        <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">Staff</h2>
                        <div className="flex flex-col gap-2">
                            {[...owners, ...employees].map((u) => {
                                const badge = roleBadges[u.role]
                                const BadgeIcon = badge.icon
                                const isCurrentUser = currentUser?.id === u.id
                                return (
                                    <div key={u.id} className="flex items-center justify-between rounded-2xl border border-border bg-card p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                                                <BadgeIcon className="h-5 w-5 text-primary" />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <p className="text-sm font-bold text-foreground">{u.name}</p>
                                                    {isCurrentUser && (
                                                        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[9px] font-bold text-primary">You</span>
                                                    )}
                                                </div>
                                                <p className="text-xs text-muted-foreground">{u.email}</p>
                                            </div>
                                        </div>
                                        <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${badge.color}`}>
                                            {badge.label}
                                        </span>
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    {/* Customers section */}
                    {customers.length > 0 && (
                        <div>
                            <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                Customers ({customers.length})
                            </h2>
                            <div className="flex flex-col gap-2">
                                {customers.map((u) => (
                                    <div key={u.id} className="flex items-center justify-between rounded-2xl border border-border bg-card p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/10">
                                                <User className="h-5 w-5 text-emerald-600" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-foreground">{u.name}</p>
                                                <p className="text-xs text-muted-foreground">{u.email} {u.phone && `· ${u.phone}`}</p>
                                            </div>
                                        </div>
                                        <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-[10px] font-bold text-emerald-600">
                                            Customer
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Add Staff Modal */}
            {showForm && (
                <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4 pt-16 backdrop-blur-sm">
                    <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl">
                        <div className="mb-5 flex items-center justify-between">
                            <h2 className="font-serif text-lg font-bold text-foreground">Add Staff Account</h2>
                            <button onClick={() => setShowForm(false)} className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:bg-secondary">
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        {formError && (
                            <div className="mb-4 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-2.5">
                                <p className="text-xs font-semibold text-destructive">{formError}</p>
                            </div>
                        )}

                        <form onSubmit={handleCreateUser} className="flex flex-col gap-4">
                            <div>
                                <label className="mb-1 block text-xs font-bold text-muted-foreground">Name</label>
                                <input
                                    type="text" required value={formName} onChange={(e) => setFormName(e.target.value)}
                                    className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary"
                                    placeholder="Employee name"
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-xs font-bold text-muted-foreground">Email</label>
                                <input
                                    type="email" required value={formEmail} onChange={(e) => setFormEmail(e.target.value)}
                                    className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary"
                                    placeholder="employee@st4rrymoon.com"
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-xs font-bold text-muted-foreground">Phone</label>
                                <input
                                    type="tel" value={formPhone} onChange={(e) => setFormPhone(e.target.value)}
                                    className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary"
                                    placeholder="+91 XXXXX XXXXX"
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-xs font-bold text-muted-foreground">Password</label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"} required minLength={6}
                                        value={formPassword} onChange={(e) => setFormPassword(e.target.value)}
                                        className="w-full rounded-xl border border-border bg-background px-4 py-2.5 pr-10 text-sm outline-none focus:border-primary"
                                        placeholder="Min. 6 characters"
                                    />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                    >
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className="mb-1 block text-xs font-bold text-muted-foreground">Role</label>
                                <select
                                    value={formRole} onChange={(e) => setFormRole(e.target.value as "employee" | "owner")}
                                    className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary"
                                >
                                    <option value="employee">Employee</option>
                                    <option value="owner">Owner</option>
                                </select>
                            </div>

                            <div className="mt-2 flex gap-3">
                                <button type="submit" disabled={formLoading}
                                    className="flex-1 rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                                >
                                    {formLoading ? "Creating..." : "Create Account"}
                                </button>
                                <button type="button" onClick={() => setShowForm(false)}
                                    className="rounded-xl bg-secondary px-6 py-3 text-sm font-bold text-secondary-foreground hover:bg-secondary/80"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
