"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { PageLayout } from "@/components/page-layout"
import {
    User, Package, Truck, MapPin, Edit3, Save, X, Camera,
    ChevronRight, Clock, CheckCircle2, AlertCircle, Star,
    Gift, ShoppingBag
} from "lucide-react"

/* ─── Types ───────────────────────────────────────── */

interface Order {
    id: string
    items: { productName: string; quantity: number; price: number }[]
    total: number
    status: string
    awbNumber: string
    createdAt: string
}

interface Address {
    label: string
    line: string
    city: string
    state: string
    pincode: string
}

/* ─── Discount Tiers ──────────────────────────────── */

const DISCOUNT_TIERS = [
    { min: 0, discount: 0, label: "No discount", next: 499 },
    { min: 499, discount: 5, label: "5% off", next: 999 },
    { min: 999, discount: 10, label: "10% off", next: 1499 },
    { min: 1499, discount: 15, label: "15% off", next: 2499 },
    { min: 2499, discount: 20, label: "20% off", next: null },
]

function getDiscountTier(cartTotal: number) {
    let current = DISCOUNT_TIERS[0]
    for (const tier of DISCOUNT_TIERS) {
        if (cartTotal >= tier.min) current = tier
    }
    return current
}

/* ─── Status Badge ────────────────────────────────── */

function StatusBadge({ status }: { status: string }) {
    const styles: Record<string, string> = {
        pending: "bg-amber-50 text-amber-700 border-amber-200",
        processing: "bg-blue-50 text-blue-700 border-blue-200",
        shipped: "bg-violet-50 text-violet-700 border-violet-200",
        delivered: "bg-emerald-50 text-emerald-700 border-emerald-200",
        cancelled: "bg-red-50 text-red-700 border-red-200",
    }
    const icons: Record<string, React.ReactNode> = {
        pending: <Clock className="h-3 w-3" />,
        processing: <Package className="h-3 w-3" />,
        shipped: <Truck className="h-3 w-3" />,
        delivered: <CheckCircle2 className="h-3 w-3" />,
        cancelled: <AlertCircle className="h-3 w-3" />,
    }

    return (
        <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${styles[status] || styles.pending}`}>
            {icons[status] || icons.pending}
            {status}
        </span>
    )
}

/* ─── Discount Meter ──────────────────────────────── */

function DiscountMeter({ cartTotal }: { cartTotal: number }) {
    const tier = getDiscountTier(cartTotal)
    const nextTier = DISCOUNT_TIERS.find((t) => t.min > tier.min)
    const progress = nextTier
        ? Math.min(100, ((cartTotal - tier.min) / (nextTier.min - tier.min)) * 100)
        : 100
    const remaining = nextTier ? nextTier.min - cartTotal : 0

    return (
        <div className="rounded-2xl border border-border bg-card p-5">
            <div className="mb-3 flex items-center justify-between">
                <h3 className="flex items-center gap-2 text-sm font-bold text-foreground">
                    <Gift className="h-4 w-4 text-primary" />
                    Discount Meter
                </h3>
                {tier.discount > 0 && (
                    <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary">
                        {tier.discount}% OFF active
                    </span>
                )}
            </div>

            {/* Progress Bar */}
            <div className="relative mb-2 h-3 overflow-hidden rounded-full bg-muted">
                <div
                    className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-primary to-pink-400 transition-all duration-700 ease-out"
                    style={{ width: `${progress}%` }}
                />
                {/* Tier markers */}
                {DISCOUNT_TIERS.slice(1).map((t) => {
                    const pos = nextTier
                        ? ((t.min - tier.min) / (nextTier.min - tier.min)) * 100
                        : 100
                    if (pos < 0 || pos > 100) return null
                    return (
                        <div
                            key={t.min}
                            className="absolute top-0 h-full w-0.5 bg-white/60"
                            style={{ left: `${pos}%` }}
                        />
                    )
                })}
            </div>

            {/* Labels */}
            <div className="flex items-center justify-between text-[10px]">
                <span className="font-semibold text-muted-foreground">₹{cartTotal}</span>
                {nextTier ? (
                    <span className="font-semibold text-primary">
                        ₹{remaining} more → {nextTier.discount}% off
                    </span>
                ) : (
                    <span className="flex items-center gap-1 font-bold text-emerald-600">
                        <Star className="h-3 w-3" fill="currentColor" />
                        Max discount unlocked!
                    </span>
                )}
            </div>

            {/* Tier list */}
            <div className="mt-3 grid grid-cols-4 gap-1">
                {DISCOUNT_TIERS.slice(1).map((t) => (
                    <div
                        key={t.min}
                        className={`rounded-lg p-1.5 text-center text-[9px] font-bold transition-colors ${
                            cartTotal >= t.min
                                ? "bg-primary/10 text-primary"
                                : "bg-muted text-muted-foreground"
                        }`}
                    >
                        <div className="text-[11px]">{t.discount}%</div>
                        <div>₹{t.min}+</div>
                    </div>
                ))}
            </div>
        </div>
    )
}

/* ─── Profile Page ────────────────────────────────── */

export default function ProfilePage() {
    const { user, refresh } = useAuth()
    const router = useRouter()
    const [tab, setTab] = useState<"profile" | "orders" | "addresses">("profile")
    const [editing, setEditing] = useState(false)
    const [saving, setSaving] = useState(false)
    const [orders, setOrders] = useState<Order[]>([])
    const [loadingOrders, setLoadingOrders] = useState(false)
    const [cartTotal] = useState(0) // Will come from cart context later

    // Editable fields
    const [formName, setFormName] = useState("")
    const [formPhone, setFormPhone] = useState("")
    const [formPicture, setFormPicture] = useState("")

    // Addresses (stored as JSON in user address field for now)
    const [addresses, setAddresses] = useState<Address[]>([])
    const [editingAddr, setEditingAddr] = useState<number | null>(null)
    const [addrForm, setAddrForm] = useState<Address>({ label: "", line: "", city: "", state: "", pincode: "" })

    // Redirect if not logged in — after all hooks
    useEffect(() => {
        if (user === null) {
            // Wait a tick for auth to load
            const t = setTimeout(() => {
                if (!user) router.push("/login")
            }, 1500)
            return () => clearTimeout(t)
        }
    }, [user, router])

    // Populate form when user loads
    useEffect(() => {
        if (user) {
            setFormName(user.name || "")
            setFormPhone(user.phone || "")
            setFormPicture(user.picture || "")
            // Parse addresses from user's address field
            try {
                const saved = user.address ? JSON.parse(user.address) : []
                if (Array.isArray(saved)) setAddresses(saved)
            } catch {
                if (user.address) {
                    setAddresses([{
                        label: "Home",
                        line: user.address,
                        city: user.city || "",
                        state: user.state || "",
                        pincode: user.pincode || "",
                    }])
                }
            }
        }
    }, [user])

    // Fetch orders
    const fetchOrders = useCallback(async () => {
        if (!user) return
        setLoadingOrders(true)
        try {
            const res = await fetch("/api/orders")
            const data = await res.json()
            if (data.orders) {
                // Filter to this user's orders by email
                const mine = data.orders.filter(
                    (o: Order & { email?: string }) =>
                        o.email?.toLowerCase() === user.email?.toLowerCase()
                )
                setOrders(mine)
            }
        } catch {
            console.error("Failed to fetch orders")
        }
        setLoadingOrders(false)
    }, [user])

    useEffect(() => {
        if (tab === "orders") fetchOrders()
    }, [tab, fetchOrders])

    // Save profile
    const handleSave = async () => {
        setSaving(true)
        try {
            const res = await fetch("/api/auth/profile", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: formName,
                    phone: formPhone,
                    picture: formPicture,
                    address: JSON.stringify(addresses),
                }),
            })
            if (res.ok) {
                await refresh()
                setEditing(false)
            }
        } catch {
            console.error("Failed to save profile")
        }
        setSaving(false)
    }

    // Add / update address
    const saveAddress = () => {
        if (!addrForm.label || !addrForm.line || !addrForm.pincode) return
        const updated = [...addresses]
        if (editingAddr !== null) {
            updated[editingAddr] = addrForm
        } else {
            updated.push(addrForm)
        }
        setAddresses(updated)
        setAddrForm({ label: "", line: "", city: "", state: "", pincode: "" })
        setEditingAddr(null)
    }

    const deleteAddress = (idx: number) => {
        setAddresses(addresses.filter((_, i) => i !== idx))
    }

    if (!user) {
        return (
            <PageLayout>
                <div className="flex min-h-[60vh] items-center justify-center">
                    <div className="animate-pulse text-sm text-muted-foreground">Loading profile...</div>
                </div>
            </PageLayout>
        )
    }

    const tabs = [
        { id: "profile" as const, label: "Profile", icon: User },
        { id: "orders" as const, label: "My Orders", icon: Package },
        { id: "addresses" as const, label: "Addresses", icon: MapPin },
    ]

    return (
        <PageLayout>
            <div className="mx-auto max-w-3xl px-4 py-8">
                {/* ─── Header Card ─── */}
                <div className="relative mb-6 overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-primary/5 via-card to-pink-50/50 p-6 shadow-lg">
                    <div className="flex items-center gap-5">
                        {/* Avatar */}
                        <div className="relative">
                            <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-primary/10 shadow-lg">
                                {formPicture ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={formPicture} alt={user.name} className="h-full w-full object-cover" />
                                ) : (
                                    <User className="h-9 w-9 text-primary" />
                                )}
                            </div>
                            {editing && (
                                <button
                                    className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-white shadow-md transition-transform hover:scale-110"
                                    onClick={() => {
                                        const url = prompt("Paste your profile picture URL:")
                                        if (url) setFormPicture(url)
                                    }}
                                    aria-label="Change profile picture"
                                >
                                    <Camera className="h-3.5 w-3.5" />
                                </button>
                            )}
                        </div>

                        {/* Info */}
                        <div className="flex-1">
                            {editing ? (
                                <input
                                    value={formName}
                                    onChange={(e) => setFormName(e.target.value)}
                                    className="mb-1 w-full rounded-lg border border-border bg-background px-3 py-1.5 text-lg font-bold outline-none focus:border-primary"
                                    placeholder="Your name"
                                />
                            ) : (
                                <h1 className="text-lg font-bold text-foreground">{user.name}</h1>
                            )}
                            <p className="text-xs text-muted-foreground">{user.email}</p>
                            {editing ? (
                                <input
                                    value={formPhone}
                                    onChange={(e) => setFormPhone(e.target.value)}
                                    className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-1.5 text-xs outline-none focus:border-primary"
                                    placeholder="+91 XXXXX XXXXX"
                                />
                            ) : (
                                user.phone && <p className="mt-0.5 text-xs text-muted-foreground">{user.phone}</p>
                            )}
                            <span className="mt-1 inline-block rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
                                {user.role}
                            </span>
                        </div>

                        {/* Edit / Save button */}
                        <div className="flex gap-2">
                            {editing ? (
                                <>
                                    <button
                                        onClick={handleSave}
                                        disabled={saving}
                                        className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-primary/90 disabled:opacity-50"
                                    >
                                        <Save className="h-3.5 w-3.5" />
                                        {saving ? "Saving..." : "Save"}
                                    </button>
                                    <button
                                        onClick={() => {
                                            setEditing(false)
                                            setFormName(user.name || "")
                                            setFormPhone(user.phone || "")
                                        }}
                                        className="flex items-center gap-1 rounded-xl border border-border px-3 py-2 text-xs font-semibold text-muted-foreground hover:bg-muted"
                                    >
                                        <X className="h-3.5 w-3.5" />
                                    </button>
                                </>
                            ) : (
                                <button
                                    onClick={() => setEditing(true)}
                                    className="flex items-center gap-1.5 rounded-xl border border-border px-4 py-2 text-xs font-bold text-foreground transition-colors hover:bg-muted"
                                >
                                    <Edit3 className="h-3.5 w-3.5" />
                                    Edit
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* ─── Discount Meter ─── */}
                <div className="mb-6">
                    <DiscountMeter cartTotal={cartTotal} />
                </div>

                {/* ─── Tabs ─── */}
                <div className="mb-6 flex gap-1 rounded-xl bg-muted p-1">
                    {tabs.map((t) => (
                        <button
                            key={t.id}
                            onClick={() => setTab(t.id)}
                            className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2.5 text-xs font-bold transition-all ${
                                tab === t.id
                                    ? "bg-card text-foreground shadow-sm"
                                    : "text-muted-foreground hover:text-foreground"
                            }`}
                        >
                            <t.icon className="h-3.5 w-3.5" />
                            {t.label}
                        </button>
                    ))}
                </div>

                {/* ─── Tab Content ─── */}

                {/* Profile Tab */}
                {tab === "profile" && (
                    <div className="space-y-4">
                        <div className="rounded-2xl border border-border bg-card p-5">
                            <h3 className="mb-4 text-sm font-bold text-foreground">Account Details</h3>
                            <div className="grid gap-3 text-xs">
                                <div className="flex justify-between border-b border-border pb-2">
                                    <span className="font-semibold text-muted-foreground">Name</span>
                                    <span className="font-bold text-foreground">{user.name}</span>
                                </div>
                                <div className="flex justify-between border-b border-border pb-2">
                                    <span className="font-semibold text-muted-foreground">Email</span>
                                    <span className="font-bold text-foreground">{user.email}</span>
                                </div>
                                <div className="flex justify-between border-b border-border pb-2">
                                    <span className="font-semibold text-muted-foreground">Phone</span>
                                    <span className="font-bold text-foreground">{user.phone || "Not set"}</span>
                                </div>
                                <div className="flex justify-between border-b border-border pb-2">
                                    <span className="font-semibold text-muted-foreground">Sign-in method</span>
                                    <span className="font-bold capitalize text-foreground">{user.authProvider || "email"}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="font-semibold text-muted-foreground">Member since</span>
                                    <span className="font-bold text-foreground">
                                        {new Date(user.createdAt).toLocaleDateString("en-IN", {
                                            day: "numeric",
                                            month: "long",
                                            year: "numeric",
                                        })}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-border bg-card p-5">
                            <h3 className="mb-3 text-sm font-bold text-foreground">Quick Stats</h3>
                            <div className="grid grid-cols-3 gap-3">
                                <div className="rounded-xl bg-primary/5 p-3 text-center">
                                    <ShoppingBag className="mx-auto mb-1 h-5 w-5 text-primary" />
                                    <div className="text-lg font-bold text-foreground">{orders.length}</div>
                                    <div className="text-[10px] font-semibold text-muted-foreground">Orders</div>
                                </div>
                                <div className="rounded-xl bg-emerald-50 p-3 text-center">
                                    <CheckCircle2 className="mx-auto mb-1 h-5 w-5 text-emerald-600" />
                                    <div className="text-lg font-bold text-foreground">
                                        {orders.filter((o) => o.status === "delivered").length}
                                    </div>
                                    <div className="text-[10px] font-semibold text-muted-foreground">Delivered</div>
                                </div>
                                <div className="rounded-xl bg-violet-50 p-3 text-center">
                                    <MapPin className="mx-auto mb-1 h-5 w-5 text-violet-600" />
                                    <div className="text-lg font-bold text-foreground">{addresses.length}</div>
                                    <div className="text-[10px] font-semibold text-muted-foreground">Addresses</div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Orders Tab */}
                {tab === "orders" && (
                    <div className="space-y-3">
                        {loadingOrders ? (
                            <div className="flex items-center justify-center py-12">
                                <div className="animate-pulse text-xs text-muted-foreground">Loading orders...</div>
                            </div>
                        ) : orders.length === 0 ? (
                            <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-card py-12">
                                <Package className="mb-3 h-10 w-10 text-muted-foreground/40" />
                                <p className="text-sm font-semibold text-muted-foreground">No orders yet</p>
                                <p className="mt-1 text-xs text-muted-foreground">Your order history will appear here</p>
                                <button
                                    onClick={() => router.push("/shop")}
                                    className="mt-4 flex items-center gap-1.5 rounded-xl bg-primary px-5 py-2 text-xs font-bold text-white transition-colors hover:bg-primary/90"
                                >
                                    <ShoppingBag className="h-3.5 w-3.5" />
                                    Start Shopping
                                </button>
                            </div>
                        ) : (
                            orders.map((order) => (
                                <div
                                    key={order.id}
                                    className="group rounded-2xl border border-border bg-card p-4 transition-shadow hover:shadow-md"
                                >
                                    <div className="mb-2 flex items-center justify-between">
                                        <div>
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                                {order.id}
                                            </span>
                                            <p className="text-[10px] text-muted-foreground">
                                                {new Date(order.createdAt).toLocaleDateString("en-IN", {
                                                    day: "numeric",
                                                    month: "short",
                                                    year: "numeric",
                                                })}
                                            </p>
                                        </div>
                                        <StatusBadge status={order.status} />
                                    </div>

                                    {/* Items */}
                                    <div className="mb-2 space-y-1">
                                        {order.items.map((item, i) => (
                                            <div key={i} className="flex justify-between text-xs">
                                                <span className="text-foreground">
                                                    {item.productName} × {item.quantity}
                                                </span>
                                                <span className="font-semibold text-foreground">₹{item.price * item.quantity}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="flex items-center justify-between border-t border-border pt-2">
                                        <span className="text-xs font-bold text-foreground">Total: ₹{order.total}</span>
                                        {order.awbNumber && (
                                            <span className="flex items-center gap-1 text-[10px] font-semibold text-primary">
                                                <Truck className="h-3 w-3" />
                                                AWB: {order.awbNumber}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {/* Addresses Tab */}
                {tab === "addresses" && (
                    <div className="space-y-4">
                        {/* Existing addresses */}
                        {addresses.map((addr, idx) => (
                            <div
                                key={idx}
                                className="group relative rounded-2xl border border-border bg-card p-4 transition-shadow hover:shadow-md"
                            >
                                <div className="mb-1 flex items-center gap-2">
                                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
                                        {addr.label}
                                    </span>
                                </div>
                                <p className="text-xs text-foreground">{addr.line}</p>
                                <p className="text-xs text-muted-foreground">
                                    {addr.city}{addr.state ? `, ${addr.state}` : ""} — {addr.pincode}
                                </p>
                                <div className="absolute right-3 top-3 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                                    <button
                                        onClick={() => {
                                            setAddrForm(addr)
                                            setEditingAddr(idx)
                                        }}
                                        className="rounded-lg border border-border p-1.5 text-muted-foreground hover:bg-muted"
                                        aria-label="Edit address"
                                    >
                                        <Edit3 className="h-3 w-3" />
                                    </button>
                                    <button
                                        onClick={() => deleteAddress(idx)}
                                        className="rounded-lg border border-destructive/30 p-1.5 text-destructive hover:bg-destructive/5"
                                        aria-label="Delete address"
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                </div>
                            </div>
                        ))}

                        {/* Add / Edit address form */}
                        <div className="rounded-2xl border border-dashed border-primary/30 bg-primary/5 p-5">
                            <h3 className="mb-3 text-xs font-bold text-foreground">
                                {editingAddr !== null ? "Edit Address" : "Add New Address"}
                            </h3>
                            <div className="grid gap-2">
                                <input
                                    value={addrForm.label}
                                    onChange={(e) => setAddrForm({ ...addrForm, label: e.target.value })}
                                    placeholder="Label (e.g. Home, Office, Hostel)"
                                    className="rounded-lg border border-border bg-background px-3 py-2 text-xs outline-none focus:border-primary"
                                />
                                <input
                                    value={addrForm.line}
                                    onChange={(e) => setAddrForm({ ...addrForm, line: e.target.value })}
                                    placeholder="Full address line"
                                    className="rounded-lg border border-border bg-background px-3 py-2 text-xs outline-none focus:border-primary"
                                />
                                <div className="grid grid-cols-3 gap-2">
                                    <input
                                        value={addrForm.city}
                                        onChange={(e) => setAddrForm({ ...addrForm, city: e.target.value })}
                                        placeholder="City"
                                        className="rounded-lg border border-border bg-background px-3 py-2 text-xs outline-none focus:border-primary"
                                    />
                                    <input
                                        value={addrForm.state}
                                        onChange={(e) => setAddrForm({ ...addrForm, state: e.target.value })}
                                        placeholder="State"
                                        className="rounded-lg border border-border bg-background px-3 py-2 text-xs outline-none focus:border-primary"
                                    />
                                    <input
                                        value={addrForm.pincode}
                                        onChange={(e) => setAddrForm({ ...addrForm, pincode: e.target.value })}
                                        placeholder="Pincode"
                                        className="rounded-lg border border-border bg-background px-3 py-2 text-xs outline-none focus:border-primary"
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={saveAddress}
                                        className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-bold text-white transition-all hover:bg-primary/90"
                                    >
                                        <Save className="h-3 w-3" />
                                        {editingAddr !== null ? "Update" : "Add Address"}
                                    </button>
                                    {editingAddr !== null && (
                                        <button
                                            onClick={() => {
                                                setAddrForm({ label: "", line: "", city: "", state: "", pincode: "" })
                                                setEditingAddr(null)
                                            }}
                                            className="rounded-lg border border-border px-3 py-2 text-xs font-semibold text-muted-foreground hover:bg-muted"
                                        >
                                            Cancel
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Save all addresses reminder */}
                        {addresses.length > 0 && !editing && (
                            <p className="text-center text-[10px] text-muted-foreground">
                                <button
                                    onClick={() => { setEditing(true); handleSave() }}
                                    className="font-bold text-primary hover:underline"
                                >
                                    Click to save addresses to your profile
                                </button>
                            </p>
                        )}
                    </div>
                )}
            </div>
        </PageLayout>
    )
}
