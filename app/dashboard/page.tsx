"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { getProducts, getDiscounts, getFreebies, getOrders } from "@/lib/dashboard-store"
import { Package, Tag, Gift, Truck, ArrowRight } from "lucide-react"

export default function DashboardPage() {
    const [stats, setStats] = useState({ products: 0, discounts: 0, freebies: 0, orders: 0, pending: 0 })

    useEffect(() => {
        const products = getProducts()
        const discounts = getDiscounts()
        const freebies = getFreebies()
        const orders = getOrders()
        setStats({
            products: products.length,
            discounts: discounts.filter((d) => d.active).length,
            freebies: freebies.filter((f) => f.active).length,
            orders: orders.length,
            pending: orders.filter((o) => o.status === "pending" || o.status === "confirmed").length,
        })
    }, [])

    const cards = [
        { label: "Total Products", value: stats.products, icon: Package, href: "/dashboard/products", color: "bg-primary/10 text-primary" },
        { label: "Active Discounts", value: stats.discounts, icon: Tag, href: "/dashboard/discounts", color: "bg-emerald-500/10 text-emerald-600" },
        { label: "Active Freebies", value: stats.freebies, icon: Gift, href: "/dashboard/discounts", color: "bg-violet-500/10 text-violet-600" },
        { label: "Pending Orders", value: stats.pending, icon: Truck, href: "/dashboard/orders", color: "bg-amber-500/10 text-amber-600" },
    ]

    return (
        <div>
            <div className="mb-8">
                <h1 className="font-serif text-2xl font-bold text-foreground">Dashboard</h1>
                <p className="mt-1 text-sm text-muted-foreground">Welcome back to St4rrymoon management</p>
            </div>

            {/* Stats grid */}
            <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {cards.map((card) => (
                    <Link
                        key={card.label}
                        href={card.href}
                        className="group flex items-center gap-4 rounded-2xl border border-border bg-card p-5 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/5"
                    >
                        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${card.color}`}>
                            <card.icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                            <p className="text-2xl font-bold text-foreground">{card.value}</p>
                            <p className="text-xs font-semibold text-muted-foreground">{card.label}</p>
                        </div>
                        <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                    </Link>
                ))}
            </div>

            {/* Quick actions */}
            <div className="rounded-2xl border border-border bg-card p-6">
                <h2 className="mb-4 text-sm font-bold text-foreground">Quick Actions</h2>
                <div className="flex flex-wrap gap-3">
                    <Link
                        href="/dashboard/products"
                        className="rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-primary-foreground transition-colors hover:bg-primary/90"
                    >
                        <Package className="mr-1.5 inline h-3.5 w-3.5" />
                        Manage Products
                    </Link>
                    <Link
                        href="/dashboard/discounts"
                        className="rounded-xl bg-secondary px-4 py-2.5 text-xs font-bold text-secondary-foreground transition-colors hover:bg-secondary/80"
                    >
                        <Tag className="mr-1.5 inline h-3.5 w-3.5" />
                        Create Discount
                    </Link>
                    <Link
                        href="/dashboard/orders"
                        className="rounded-xl bg-secondary px-4 py-2.5 text-xs font-bold text-secondary-foreground transition-colors hover:bg-secondary/80"
                    >
                        <Truck className="mr-1.5 inline h-3.5 w-3.5" />
                        View Orders
                    </Link>
                </div>
            </div>
        </div>
    )
}
