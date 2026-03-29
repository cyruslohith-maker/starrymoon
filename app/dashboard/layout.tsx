"use client"

import { useState, useEffect, type ReactNode } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { getDashboardPin } from "@/lib/dashboard-store"
import {
    Package,
    Tag,
    Truck,
    LayoutDashboard,
    Lock,
    LogOut,
    ChevronRight,
    Store,
} from "lucide-react"

const navItems = [
    { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
    { href: "/dashboard/products", label: "Products", icon: Package },
    { href: "/dashboard/discounts", label: "Discounts & Freebies", icon: Tag },
    { href: "/dashboard/orders", label: "Orders & Shipping", icon: Truck },
]

function PinGate({ onAuth }: { onAuth: () => void }) {
    const [pin, setPin] = useState("")
    const [error, setError] = useState(false)

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (pin === getDashboardPin()) {
            onAuth()
        } else {
            setError(true)
            setPin("")
            setTimeout(() => setError(false), 2000)
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center" style={{ background: "#FFF5F7" }}>
            <form
                onSubmit={handleSubmit}
                className="mx-4 w-full max-w-sm rounded-2xl border border-border bg-card p-8 shadow-xl"
            >
                <div className="mb-6 flex flex-col items-center gap-3">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                        <Lock className="h-7 w-7 text-primary" />
                    </div>
                    <h1 className="font-serif text-xl font-bold text-foreground">Owner Dashboard</h1>
                    <p className="text-center text-xs text-muted-foreground">
                        Enter your PIN to access the dashboard
                    </p>
                </div>
                <div className="mb-4">
                    <input
                        type="password"
                        inputMode="numeric"
                        maxLength={8}
                        value={pin}
                        onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
                        placeholder="Enter PIN"
                        className={`w-full rounded-xl border px-4 py-3 text-center text-lg tracking-[0.3em] outline-none transition-colors ${error
                                ? "border-destructive bg-destructive/5 text-destructive"
                                : "border-border bg-background text-foreground focus:border-primary"
                            }`}
                        autoFocus
                    />
                    {error && (
                        <p className="mt-2 text-center text-xs font-semibold text-destructive">
                            Incorrect PIN. Try again.
                        </p>
                    )}
                </div>
                <button
                    type="submit"
                    className="w-full rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90"
                >
                    Unlock Dashboard
                </button>
            </form>
        </div>
    )
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
    const [authed, setAuthed] = useState(false)
    const [sidebarOpen, setSidebarOpen] = useState(true)
    const pathname = usePathname()

    // Persist auth in sessionStorage so refreshes don't log out
    useEffect(() => {
        if (typeof window !== "undefined" && sessionStorage.getItem("st4rry_dash_auth") === "1") {
            setAuthed(true)
        }
    }, [])

    const handleAuth = () => {
        setAuthed(true)
        sessionStorage.setItem("st4rry_dash_auth", "1")
    }

    const handleLogout = () => {
        setAuthed(false)
        sessionStorage.removeItem("st4rry_dash_auth")
    }

    if (!authed) return <PinGate onAuth={handleAuth} />

    return (
        <div className="flex min-h-screen" style={{ background: "#FFF5F7" }}>
            {/* Sidebar */}
            <aside
                className={`fixed left-0 top-0 z-40 flex h-full flex-col border-r border-border bg-card transition-all duration-300 ${sidebarOpen ? "w-56" : "w-16"
                    }`}
            >
                {/* Header */}
                <div className="flex h-14 items-center gap-2 border-b border-border px-4">
                    {sidebarOpen && (
                        <span className="font-serif text-sm font-bold text-foreground">St4rrymoon</span>
                    )}
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="ml-auto flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                        aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
                    >
                        <ChevronRight
                            className={`h-4 w-4 transition-transform ${sidebarOpen ? "rotate-180" : ""}`}
                        />
                    </button>
                </div>

                {/* Nav */}
                <nav className="flex flex-1 flex-col gap-1 p-2">
                    {navItems.map((item) => {
                        const active = pathname === item.href
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors ${active
                                        ? "bg-primary/10 text-primary"
                                        : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                                    }`}
                                title={item.label}
                            >
                                <item.icon className="h-4 w-4 shrink-0" />
                                {sidebarOpen && <span>{item.label}</span>}
                            </Link>
                        )
                    })}
                </nav>

                {/* Footer */}
                <div className="flex flex-col gap-1 border-t border-border p-2">
                    <Link
                        href="/"
                        className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                        title="View Store"
                    >
                        <Store className="h-4 w-4 shrink-0" />
                        {sidebarOpen && <span>View Store</span>}
                    </Link>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                        title="Logout"
                    >
                        <LogOut className="h-4 w-4 shrink-0" />
                        {sidebarOpen && <span>Logout</span>}
                    </button>
                </div>
            </aside>

            {/* Main content */}
            <main
                className={`flex-1 transition-all duration-300 ${sidebarOpen ? "ml-56" : "ml-16"}`}
            >
                <div className="p-6 lg:p-8">{children}</div>
            </main>
        </div>
    )
}
