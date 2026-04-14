"use client"

import { type ReactNode, useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import {
    Package,
    Tag,
    Truck,
    LayoutDashboard,
    Shield,
    LogOut,
    ChevronDown,
    ChevronRight,
    Store,
    Users,
    Loader2,
    Menu,
    X,
    Sparkles,
} from "lucide-react"

/* ─── Nav structure with collapsible groups ─── */

type NavItem = {
    href: string
    label: string
    icon: typeof LayoutDashboard
    roles: string[]
}

type NavGroup = {
    label: string
    items: NavItem[]
}

const navGroups: NavGroup[] = [
    {
        label: "Main",
        items: [
            { href: "/dashboard", label: "Overview", icon: LayoutDashboard, roles: ["owner", "employee"] },
        ],
    },
    {
        label: "Store Management",
        items: [
            { href: "/dashboard/products", label: "Products", icon: Package, roles: ["owner", "employee"] },
            { href: "/dashboard/discounts", label: "Discounts & Freebies", icon: Tag, roles: ["owner"] },
        ],
    },
    {
        label: "Operations",
        items: [
            { href: "/dashboard/orders", label: "Orders & Shipping", icon: Truck, roles: ["owner", "employee"] },
        ],
    },
    {
        label: "Administration",
        items: [
            { href: "/dashboard/users", label: "User Management", icon: Users, roles: ["owner"] },
        ],
    },
]

export default function DashboardLayout({ children }: { children: ReactNode }) {
    const { user, loading, logout, isStaff, isOwner } = useAuth()
    const pathname = usePathname()
    const router = useRouter()
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({})

    // Lock body scroll on mobile when sidebar open
    useEffect(() => {
        if (sidebarOpen) {
            document.body.style.overflow = "hidden"
        } else {
            document.body.style.overflow = ""
        }
        return () => { document.body.style.overflow = "" }
    }, [sidebarOpen])

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

    const closeSidebar = () => setSidebarOpen(false)

    const toggleGroup = (label: string) => {
        setCollapsedGroups((prev) => ({ ...prev, [label]: !prev[label] }))
    }

    // Filter groups to only show items the user can see
    const visibleGroups = navGroups
        .map((g) => ({
            ...g,
            items: g.items.filter((item) => item.roles.includes(user.role)),
        }))
        .filter((g) => g.items.length > 0)

    // Find current page label
    const currentPage = visibleGroups
        .flatMap((g) => g.items)
        .find((item) => pathname === item.href)

    return (
        <div className="flex min-h-screen" style={{ background: "#FFF5F7" }}>
            {/* Mobile overlay — smooth fade */}
            <div
                className={`fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ease-out lg:hidden ${
                    sidebarOpen ? "opacity-100" : "pointer-events-none opacity-0"
                }`}
                onClick={closeSidebar}
                aria-hidden="true"
            />

            {/* Sidebar — smooth slide with spring-like easing */}
            <aside
                className={`fixed left-0 top-0 z-50 flex h-full w-72 flex-col border-r border-border bg-card shadow-2xl shadow-black/5 transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] lg:z-40 lg:w-60 lg:translate-x-0 lg:shadow-none ${
                    sidebarOpen ? "translate-x-0" : "-translate-x-full"
                }`}
            >
                {/* Header */}
                <div className="flex h-16 items-center gap-3 border-b border-border px-5">
                    <Image
                        src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/WhatsApp%20Image%202026-02-19%20at%2023.02.22%20%281%29-p2RkRsGEwMqFoSLVEFVzaUpp6WWpyx.jpeg"
                        alt="Starrymoon"
                        width={32}
                        height={32}
                        className="rounded-full"
                        style={{ width: "32px", height: "auto" }}
                    />
                    <span className="font-serif text-sm font-bold text-foreground">Starrymoon</span>
                    <span className="ml-auto hidden rounded-full bg-primary/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-primary lg:block">
                        Admin
                    </span>
                    {/* Close button for mobile */}
                    <button
                        onClick={closeSidebar}
                        className="ml-auto flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary lg:hidden"
                        aria-label="Close menu"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                {/* User info card */}
                <div className="border-b border-border px-4 py-3">
                    <div className="flex items-center gap-3 rounded-xl bg-gradient-to-r from-primary/5 to-pink-50 p-2.5">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-pink-400 shadow-sm">
                            <Shield className="h-4 w-4 text-white" />
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <p className="truncate text-xs font-bold text-foreground">{user.name}</p>
                            <p className="text-[10px] font-semibold capitalize text-primary/70">{user.role}</p>
                        </div>
                    </div>
                </div>

                {/* Nav Groups — Collapsible */}
                <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-3 scrollbar-none">
                    {visibleGroups.map((group, gi) => {
                        const isCollapsed = collapsedGroups[group.label]
                        // "Main" group is never collapsible — always visible
                        const isMainGroup = group.label === "Main"

                        return (
                            <div key={group.label} className={gi > 0 ? "mt-1" : ""}>
                                {/* Group Label — clickable to collapse (except Main) */}
                                {!isMainGroup && (
                                    <button
                                        onClick={() => toggleGroup(group.label)}
                                        className="mb-0.5 flex w-full items-center gap-1 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70 transition-colors hover:text-muted-foreground"
                                    >
                                        <ChevronDown
                                            className={`h-3 w-3 transition-transform duration-200 ${
                                                isCollapsed ? "-rotate-90" : ""
                                            }`}
                                        />
                                        {group.label}
                                    </button>
                                )}

                                {/* Items — animated collapse */}
                                <div
                                    className={`flex flex-col gap-0.5 overflow-hidden transition-all duration-300 ease-out ${
                                        isCollapsed && !isMainGroup
                                            ? "max-h-0 opacity-0"
                                            : "max-h-[500px] opacity-100"
                                    }`}
                                >
                                    {group.items.map((item) => {
                                        const active = pathname === item.href
                                        return (
                                            <Link
                                                key={item.href}
                                                href={item.href}
                                                onClick={closeSidebar}
                                                className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-200 ${
                                                    active
                                                        ? "bg-primary/10 text-primary shadow-sm shadow-primary/5"
                                                        : "text-muted-foreground hover:bg-secondary hover:text-foreground hover:translate-x-0.5"
                                                }`}
                                                title={item.label}
                                            >
                                                <item.icon className={`h-4 w-4 shrink-0 transition-colors ${
                                                    active ? "text-primary" : "text-muted-foreground/70 group-hover:text-foreground"
                                                }`} />
                                                <span>{item.label}</span>
                                                {active && (
                                                    <div className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />
                                                )}
                                            </Link>
                                        )
                                    })}
                                </div>
                            </div>
                        )
                    })}
                </nav>

                {/* Footer */}
                <div className="flex flex-col gap-1 border-t border-border p-3">
                    <Link
                        href="/"
                        onClick={closeSidebar}
                        className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-muted-foreground transition-all duration-200 hover:bg-secondary hover:text-foreground hover:translate-x-0.5"
                        title="View Store"
                    >
                        <Store className="h-4 w-4 shrink-0" />
                        <span>View Store</span>
                        <ChevronRight className="ml-auto h-3 w-3 text-muted-foreground/50" />
                    </Link>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-muted-foreground transition-all duration-200 hover:bg-destructive/10 hover:text-destructive"
                        title="Logout"
                    >
                        <LogOut className="h-4 w-4 shrink-0" />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main content */}
            <main className="flex-1 lg:ml-60">
                {/* Mobile top bar — premium glass effect */}
                <div className="sticky top-0 z-30 flex items-center gap-3 border-b border-border bg-card/80 px-4 py-3 backdrop-blur-lg lg:hidden">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary text-foreground transition-all hover:bg-primary/10 hover:text-primary active:scale-95"
                        aria-label="Open menu"
                    >
                        <Menu className="h-5 w-5" />
                    </button>
                    <div className="flex flex-1 flex-col">
                        <span className="font-serif text-sm font-bold text-foreground">Starrymoon</span>
                        {currentPage && (
                            <span className="text-[10px] font-semibold text-muted-foreground">
                                {currentPage.label}
                            </span>
                        )}
                    </div>
                    <span className="rounded-full bg-gradient-to-r from-primary/10 to-pink-100 px-2.5 py-1 text-[10px] font-bold capitalize text-primary">
                        {user.role}
                    </span>
                </div>

                <div className="p-4 sm:p-6 lg:p-8">
                    {/* Employee restriction notice */}
                    {!isOwner && (
                        <div className="mb-4 flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5">
                            <Sparkles className="h-4 w-4 shrink-0 text-amber-600" />
                            <p className="text-xs font-semibold text-amber-700">
                                Employee view — Some features are restricted to the owner account.
                            </p>
                        </div>
                    )}
                    {children}
                </div>
            </main>
        </div>
    )
}
