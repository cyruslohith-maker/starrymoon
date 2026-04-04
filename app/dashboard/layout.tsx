"use client"

import { type ReactNode } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import {
    Package,
    Tag,
    Truck,
    LayoutDashboard,
    Shield,
    LogOut,
    ChevronRight,
    Store,
    Users,
    Loader2,
} from "lucide-react"

const navItems = [
    { href: "/dashboard", label: "Overview", icon: LayoutDashboard, roles: ["owner", "employee"] },
    { href: "/dashboard/products", label: "Products", icon: Package, roles: ["owner", "employee"] },
    { href: "/dashboard/discounts", label: "Discounts & Freebies", icon: Tag, roles: ["owner"] },
    { href: "/dashboard/orders", label: "Orders & Shipping", icon: Truck, roles: ["owner", "employee"] },
    { href: "/dashboard/users", label: "User Management", icon: Users, roles: ["owner"] },
]

export default function DashboardLayout({ children }: { children: ReactNode }) {
    const { user, loading, logout, isStaff, isOwner } = useAuth()
    const pathname = usePathname()
    const router = useRouter()

    // Show loading while checking auth
    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center" style={{ background: "#FFF5F7" }}>
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground">Loading...</p>
                </div>
            </div>
        )
    }

    // Not logged in or not staff → redirect to login
    if (!user || !isStaff) {
        router.push("/login")
        return null
    }

    const handleLogout = async () => {
        await logout()
        router.push("/")
    }

    // Filter nav items by role
    const visibleNav = navItems.filter((item) =>
        item.roles.includes(user.role)
    )

    return (
        <div className="flex min-h-screen" style={{ background: "#FFF5F7" }}>
            {/* Sidebar */}
            <aside className="fixed left-0 top-0 z-40 flex h-full w-56 flex-col border-r border-border bg-card">
                {/* Header */}
                <div className="flex h-14 items-center gap-2 border-b border-border px-4">
                    <span className="font-serif text-sm font-bold text-foreground">Starrymoon</span>
                    <ChevronRight className="ml-auto h-4 w-4 text-muted-foreground" />
                </div>

                {/* User info */}
                <div className="border-b border-border px-4 py-3">
                    <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                            <Shield className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <p className="truncate text-xs font-bold text-foreground">{user.name}</p>
                            <p className="text-[10px] font-semibold capitalize text-muted-foreground">{user.role}</p>
                        </div>
                    </div>
                </div>

                {/* Nav */}
                <nav className="flex flex-1 flex-col gap-1 p-2">
                    {visibleNav.map((item) => {
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
                                <span>{item.label}</span>
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
                        <span>View Store</span>
                    </Link>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                        title="Logout"
                    >
                        <LogOut className="h-4 w-4 shrink-0" />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main content */}
            <main className="ml-56 flex-1">
                <div className="p-6 lg:p-8">
                    {/* Employee restriction notice */}
                    {!isOwner && (
                        <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5">
                            <p className="text-xs font-semibold text-amber-700">
                                👤 Employee view — Some features are restricted to the owner account.
                            </p>
                        </div>
                    )}
                    {children}
                </div>
            </main>
        </div>
    )
}
