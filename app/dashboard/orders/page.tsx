"use client"

import { useEffect, useState } from "react"
import {
    getOrders, addOrder, updateOrder, deleteOrder,
    getProducts,
    type Order,
} from "@/lib/dashboard-store"
import type { Product } from "@/lib/data"
import {
    Plus, Pencil, Trash2, X, Truck, Package,
    ExternalLink, ChevronDown, Search, MapPin, Loader2,
} from "lucide-react"

const statusLabels = {
    pending: "Pending",
    confirmed: "Confirmed",
    shipped: "Shipped",
    delivered: "Delivered",
    cancelled: "Cancelled",
} as const

const statusColors = {
    pending: "bg-amber-500/10 text-amber-600",
    confirmed: "bg-blue-500/10 text-blue-600",
    shipped: "bg-violet-500/10 text-violet-600",
    delivered: "bg-emerald-500/10 text-emerald-600",
    cancelled: "bg-destructive/10 text-destructive",
} as const

const emptyOrder: Omit<Order, "id" | "createdAt"> = {
    customerName: "",
    phone: "",
    address: "",
    items: [],
    total: 0,
    status: "pending",
    awbNumber: "",
    notes: "",
}

interface TrackingCheckpoint {
    status?: string
    location?: string
    date?: string
    remark?: string
}

interface TrackingData {
    currentStatus?: string
    checkpoints?: TrackingCheckpoint[]
    [key: string]: unknown
}

export default function OrdersPage() {
    const [orders, setOrders] = useState<Order[]>([])
    const [products, setProducts] = useState<Product[]>([])
    const [search, setSearch] = useState("")
    const [filterStatus, setFilterStatus] = useState("all")
    const [showForm, setShowForm] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [form, setForm] = useState(emptyOrder)
    const [showStatusDropdown, setShowStatusDropdown] = useState<string | null>(null)

    // Live tracking state
    const [trackingAwb, setTrackingAwb] = useState<string | null>(null)
    const [trackingData, setTrackingData] = useState<TrackingData | null>(null)
    const [trackingLoading, setTrackingLoading] = useState(false)
    const [trackingError, setTrackingError] = useState<string | null>(null)

    useEffect(() => {
        setOrders(getOrders())
        setProducts(getProducts())
    }, [])

    const refresh = () => setOrders(getOrders())

    const filtered = orders
        .filter((o) => {
            const matchesSearch =
                o.customerName.toLowerCase().includes(search.toLowerCase()) ||
                o.awbNumber?.toLowerCase().includes(search.toLowerCase()) ||
                o.id.includes(search)
            const matchesStatus = filterStatus === "all" || o.status === filterStatus
            return matchesSearch && matchesStatus
        })
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    const openAdd = () => {
        setEditingId(null)
        setForm(emptyOrder)
        setShowForm(true)
    }

    const openEdit = (o: Order) => {
        setEditingId(o.id)
        setForm({ ...o })
        setShowForm(true)
    }

    const handleSave = () => {
        if (!form.customerName) return
        const total = form.items.reduce((sum, i) => sum + i.price * i.quantity, 0)
        if (editingId) {
            updateOrder(editingId, { ...form, total })
        } else {
            addOrder({ ...form, total })
        }
        setShowForm(false)
        refresh()
    }

    const changeStatus = (id: string, status: Order["status"]) => {
        updateOrder(id, { status })
        setShowStatusDropdown(null)
        refresh()
    }

    const addItemToOrder = (product: Product) => {
        const existing = form.items.find((i) => i.productId === product.id)
        if (existing) {
            setForm({
                ...form,
                items: form.items.map((i) =>
                    i.productId === product.id ? { ...i, quantity: i.quantity + 1 } : i
                ),
            })
        } else {
            setForm({
                ...form,
                items: [
                    ...form.items,
                    { productId: product.id, productName: product.name, quantity: 1, price: product.price },
                ],
            })
        }
    }

    const removeItemFromOrder = (productId: string) => {
        setForm({ ...form, items: form.items.filter((i) => i.productId !== productId) })
    }

    // ── Live tracking via secure API route ──
    const trackShipment = async (awb: string) => {
        setTrackingAwb(awb)
        setTrackingData(null)
        setTrackingError(null)
        setTrackingLoading(true)

        try {
            const res = await fetch("/api/fship/track", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ waybill: awb }),
            })
            const data = await res.json()
            if (!res.ok) {
                setTrackingError(data.error || "Failed to fetch tracking data")
            } else {
                setTrackingData(data)
            }
        } catch {
            setTrackingError("Network error — check your connection")
        } finally {
            setTrackingLoading(false)
        }
    }

    return (
        <div>
            {/* Header */}
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="font-serif text-2xl font-bold text-foreground">Orders & Shipping</h1>
                    <p className="text-sm text-muted-foreground">{orders.length} orders total</p>
                </div>
                <div className="flex gap-3">
                    <a
                        href="https://app.fship.in"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 rounded-xl bg-secondary px-4 py-2.5 text-xs font-bold text-secondary-foreground hover:bg-secondary/80"
                    >
                        <ExternalLink className="h-3.5 w-3.5" />
                        Open Fship Dashboard
                    </a>
                    <button
                        onClick={openAdd}
                        className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-primary-foreground hover:bg-primary/90"
                    >
                        <Plus className="h-4 w-4" />
                        Add Order
                    </button>
                </div>
            </div>

            {/* Fship Info Banner */}
            <div className="mb-6 rounded-2xl border border-violet-200 bg-violet-50 p-4">
                <div className="flex items-start gap-3">
                    <Truck className="mt-0.5 h-5 w-5 shrink-0 text-violet-600" />
                    <div>
                        <p className="text-sm font-bold text-violet-900">Fship Logistics — Live Tracking Enabled</p>
                        <p className="mt-1 text-xs text-violet-700">
                            Add AWB numbers to orders and click &quot;Track&quot; for real-time shipment status.
                            Your API key is stored securely on the server and never exposed to browsers.
                        </p>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="mb-6 flex flex-wrap gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search by name, AWB, or order ID..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full rounded-xl border border-border bg-card py-2.5 pl-9 pr-4 text-sm outline-none focus:border-primary"
                    />
                </div>
                <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="rounded-xl border border-border bg-card px-4 py-2.5 text-sm outline-none focus:border-primary"
                >
                    <option value="all">All Statuses</option>
                    {Object.entries(statusLabels).map(([k, v]) => (
                        <option key={k} value={k}>{v}</option>
                    ))}
                </select>
            </div>

            {/* Orders list */}
            {filtered.length === 0 ? (
                <div className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-card py-16">
                    <Package className="h-10 w-10 text-muted-foreground/40" />
                    <p className="text-sm text-muted-foreground">No orders found</p>
                </div>
            ) : (
                <div className="flex flex-col gap-3">
                    {filtered.map((o) => (
                        <div key={o.id} className="rounded-2xl border border-border bg-card p-5 transition-all hover:shadow-sm">
                            <div className="flex flex-wrap items-start justify-between gap-4">
                                <div className="flex-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <h3 className="text-sm font-bold text-foreground">{o.customerName}</h3>
                                        <span className="text-[10px] text-muted-foreground">#{o.id}</span>

                                        {/* Status badge with dropdown */}
                                        <div className="relative">
                                            <button
                                                onClick={() => setShowStatusDropdown(showStatusDropdown === o.id ? null : o.id)}
                                                className={`flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${statusColors[o.status]}`}
                                            >
                                                {statusLabels[o.status]}
                                                <ChevronDown className="h-3 w-3" />
                                            </button>
                                            {showStatusDropdown === o.id && (
                                                <div className="absolute left-0 top-full z-10 mt-1 w-36 rounded-xl border border-border bg-card p-1 shadow-xl">
                                                    {(Object.keys(statusLabels) as Order["status"][]).map((s) => (
                                                        <button
                                                            key={s}
                                                            onClick={() => changeStatus(o.id, s)}
                                                            className={`w-full rounded-lg px-3 py-1.5 text-left text-xs font-semibold transition-colors hover:bg-secondary ${o.status === s ? "text-primary" : "text-foreground"}`}
                                                        >
                                                            {statusLabels[s]}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <p className="mt-1 text-xs text-muted-foreground">
                                        📞 {o.phone} · 📍 {o.address}
                                    </p>

                                    {/* Items */}
                                    <div className="mt-2 flex flex-wrap gap-1.5">
                                        {o.items.map((item) => (
                                            <span key={item.productId} className="rounded-full bg-secondary px-2.5 py-1 text-[10px] font-semibold text-secondary-foreground">
                                                {item.productName} ×{item.quantity}
                                            </span>
                                        ))}
                                    </div>

                                    {o.awbNumber && (
                                        <div className="mt-2 flex flex-wrap items-center gap-2">
                                            <p className="text-xs text-muted-foreground">
                                                📦 AWB: <span className="font-bold text-foreground">{o.awbNumber}</span>
                                            </p>
                                            <button
                                                onClick={() => trackShipment(o.awbNumber!)}
                                                className="flex items-center gap-1 rounded-lg bg-violet-500/10 px-2.5 py-1 text-[10px] font-bold text-violet-600 transition-colors hover:bg-violet-500/20"
                                            >
                                                <MapPin className="h-3 w-3" />
                                                Track Live
                                            </button>
                                            <a
                                                href={`https://www.fship.in/tracking/${o.awbNumber}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-[10px] font-bold text-primary hover:underline"
                                            >
                                                Fship page ↗
                                            </a>
                                        </div>
                                    )}

                                    {o.notes && (
                                        <p className="mt-1 text-xs italic text-muted-foreground">Note: {o.notes}</p>
                                    )}
                                </div>

                                <div className="flex flex-col items-end gap-2">
                                    <span className="text-lg font-bold text-foreground">₹{o.total}</span>
                                    <span className="text-[10px] text-muted-foreground">
                                        {new Date(o.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                                    </span>
                                    <div className="flex gap-1.5">
                                        <button onClick={() => openEdit(o)} className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground">
                                            <Pencil className="h-3.5 w-3.5" />
                                        </button>
                                        <button onClick={() => { deleteOrder(o.id); refresh() }} className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive">
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* ─── LIVE TRACKING MODAL ─── */}
            {trackingAwb && (
                <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4 pt-16 backdrop-blur-sm">
                    <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl">
                        <div className="mb-5 flex items-center justify-between">
                            <h2 className="font-serif text-lg font-bold text-foreground">
                                Shipment Tracking
                            </h2>
                            <button onClick={() => { setTrackingAwb(null); setTrackingData(null); setTrackingError(null) }} className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:bg-secondary">
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        <p className="mb-4 text-xs text-muted-foreground">
                            AWB: <span className="font-bold text-foreground">{trackingAwb}</span>
                        </p>

                        {trackingLoading && (
                            <div className="flex items-center justify-center gap-2 py-8">
                                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                                <span className="text-sm text-muted-foreground">Fetching tracking data...</span>
                            </div>
                        )}

                        {trackingError && (
                            <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4">
                                <p className="text-sm font-semibold text-destructive">{trackingError}</p>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    Make sure your Fship API key is set in .env.local and the AWB is correct.
                                </p>
                            </div>
                        )}

                        {trackingData && !trackingError && (
                            <div>
                                {trackingData.currentStatus && (
                                    <div className="mb-4 rounded-xl bg-emerald-500/10 p-3">
                                        <p className="text-xs font-bold text-emerald-700">Current Status</p>
                                        <p className="text-sm font-bold text-emerald-900">{trackingData.currentStatus}</p>
                                    </div>
                                )}

                                {trackingData.checkpoints && trackingData.checkpoints.length > 0 ? (
                                    <div>
                                        <p className="mb-2 text-xs font-bold text-muted-foreground">Tracking History</p>
                                        <div className="flex flex-col gap-2">
                                            {trackingData.checkpoints.map((cp: TrackingCheckpoint, i: number) => (
                                                <div key={i} className="flex gap-3 rounded-lg bg-secondary/50 p-3">
                                                    <div className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
                                                    <div>
                                                        <p className="text-xs font-bold text-foreground">{cp.status || cp.remark || "Update"}</p>
                                                        {cp.location && <p className="text-[10px] text-muted-foreground">📍 {cp.location}</p>}
                                                        {cp.date && <p className="text-[10px] text-muted-foreground">{cp.date}</p>}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="rounded-xl bg-secondary/50 p-4">
                                        <p className="text-xs text-muted-foreground">Raw API response:</p>
                                        <pre className="mt-2 max-h-48 overflow-auto text-[10px] text-foreground">
                                            {JSON.stringify(trackingData, null, 2)}
                                        </pre>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Add/Edit Order Modal */}
            {showForm && (
                <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4 pt-16 backdrop-blur-sm">
                    <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl">
                        <div className="mb-5 flex items-center justify-between">
                            <h2 className="font-serif text-lg font-bold text-foreground">
                                {editingId ? "Edit Order" : "Add Order"}
                            </h2>
                            <button onClick={() => setShowForm(false)} className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:bg-secondary">
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        <div className="flex flex-col gap-4">
                            <div>
                                <label className="mb-1 block text-xs font-bold text-muted-foreground">Customer Name *</label>
                                <input type="text" value={form.customerName} onChange={(e) => setForm({ ...form, customerName: e.target.value })} className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary" placeholder="Customer name" />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="mb-1 block text-xs font-bold text-muted-foreground">Phone</label>
                                    <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary" placeholder="+91 XXXXX XXXXX" />
                                </div>
                                <div>
                                    <label className="mb-1 block text-xs font-bold text-muted-foreground">Status</label>
                                    <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as Order["status"] })} className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary">
                                        {Object.entries(statusLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="mb-1 block text-xs font-bold text-muted-foreground">Address</label>
                                <input type="text" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary" placeholder="Full shipping address" />
                            </div>

                            <div>
                                <label className="mb-1 block text-xs font-bold text-muted-foreground">AWB Number (Fship)</label>
                                <input type="text" value={form.awbNumber || ""} onChange={(e) => setForm({ ...form, awbNumber: e.target.value })} className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary" placeholder="Enter AWB from Fship" />
                            </div>

                            {/* Products to add */}
                            <div>
                                <label className="mb-1 block text-xs font-bold text-muted-foreground">Order Items</label>
                                {form.items.length > 0 && (
                                    <div className="mb-2 flex flex-col gap-1.5">
                                        {form.items.map((item) => (
                                            <div key={item.productId} className="flex items-center justify-between rounded-lg bg-secondary px-3 py-2">
                                                <span className="text-xs font-semibold text-foreground">
                                                    {item.productName} × {item.quantity} = ₹{item.price * item.quantity}
                                                </span>
                                                <button onClick={() => removeItemFromOrder(item.productId)} className="text-muted-foreground hover:text-destructive">
                                                    <X className="h-3.5 w-3.5" />
                                                </button>
                                            </div>
                                        ))}
                                        <p className="text-right text-xs font-bold text-foreground">
                                            Total: ₹{form.items.reduce((s, i) => s + i.price * i.quantity, 0)}
                                        </p>
                                    </div>
                                )}
                                <div className="max-h-32 overflow-y-auto rounded-xl border border-border p-2">
                                    {products.map((p) => (
                                        <button
                                            key={p.id}
                                            onClick={() => addItemToOrder(p)}
                                            className="flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-left text-xs hover:bg-secondary"
                                        >
                                            <span className="text-foreground">{p.name}</span>
                                            <span className="text-muted-foreground">₹{p.price}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="mb-1 block text-xs font-bold text-muted-foreground">Notes</label>
                                <textarea value={form.notes || ""} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} className="w-full resize-none rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary" placeholder="Any notes about this order..." />
                            </div>
                        </div>

                        <div className="mt-6 flex gap-3">
                            <button onClick={handleSave} className="flex-1 rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground hover:bg-primary/90">
                                {editingId ? "Save Changes" : "Add Order"}
                            </button>
                            <button onClick={() => setShowForm(false)} className="rounded-xl bg-secondary px-6 py-3 text-sm font-bold text-secondary-foreground hover:bg-secondary/80">
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
