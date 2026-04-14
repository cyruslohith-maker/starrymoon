"use client"

import { useEffect, useState } from "react"
import { categories } from "@/lib/data"
import {
    getDiscounts, addDiscount, updateDiscount, deleteDiscount,
    getFreebies, addFreebie, updateFreebie, deleteFreebie,
    getProducts,
    type DiscountRule, type FreebieRule,
} from "@/lib/dashboard-store"
import type { Product } from "@/lib/data"
import { Plus, Pencil, Trash2, X, Tag, Gift, ToggleLeft, ToggleRight } from "lucide-react"

const editableCategories = categories.filter((c) => c !== "All")

const emptyDiscount: Omit<DiscountRule, "id"> = {
    name: "",
    type: "percentage",
    value: 10,
    applyTo: "all",
    categoryFilter: "",
    productIds: [],
    minCartValue: 0,
    minQuantity: 0,
    couponCode: "",
    startDate: "",
    endDate: "",
    active: true,
}

const emptyFreebie: Omit<FreebieRule, "id"> = {
    name: "",
    triggerType: "cartValue",
    triggerProductId: "",
    triggerValue: 500,
    freebieProductId: "",
    freebieCustomName: "",
    active: true,
}

export default function DiscountsPage() {
    const [tab, setTab] = useState<"discounts" | "freebies">("discounts")
    const [discounts, setDiscounts] = useState<DiscountRule[]>([])
    const [freebies, setFreebies] = useState<FreebieRule[]>([])
    const [products, setProducts] = useState<Product[]>([])

    // Discount form
    const [showDiscountForm, setShowDiscountForm] = useState(false)
    const [editingDiscountId, setEditingDiscountId] = useState<string | null>(null)
    const [discountForm, setDiscountForm] = useState(emptyDiscount)

    // Freebie form
    const [showFreebieForm, setShowFreebieForm] = useState(false)
    const [editingFreebieId, setEditingFreebieId] = useState<string | null>(null)
    const [freebieForm, setFreebieForm] = useState(emptyFreebie)

    useEffect(() => {
        setDiscounts(getDiscounts())
        setFreebies(getFreebies())
        setProducts(getProducts())
    }, [])

    const refreshDiscounts = () => setDiscounts(getDiscounts())
    const refreshFreebies = () => setFreebies(getFreebies())

    // ── Discount handlers ──
    const openAddDiscount = () => {
        setEditingDiscountId(null)
        setDiscountForm(emptyDiscount)
        setShowDiscountForm(true)
    }

    const openEditDiscount = (d: DiscountRule) => {
        setEditingDiscountId(d.id)
        setDiscountForm({ ...d })
        setShowDiscountForm(true)
    }

    const saveDiscount = () => {
        if (!discountForm.name) return
        if (editingDiscountId) {
            updateDiscount(editingDiscountId, discountForm)
        } else {
            addDiscount(discountForm)
        }
        setShowDiscountForm(false)
        refreshDiscounts()
    }

    const toggleDiscount = (id: string, active: boolean) => {
        updateDiscount(id, { active })
        refreshDiscounts()
    }

    // ── Freebie handlers ──
    const openAddFreebie = () => {
        setEditingFreebieId(null)
        setFreebieForm(emptyFreebie)
        setShowFreebieForm(true)
    }

    const openEditFreebie = (f: FreebieRule) => {
        setEditingFreebieId(f.id)
        setFreebieForm({ ...f })
        setShowFreebieForm(true)
    }

    const saveFreebie = () => {
        if (!freebieForm.name) return
        if (editingFreebieId) {
            updateFreebie(editingFreebieId, freebieForm)
        } else {
            addFreebie(freebieForm)
        }
        setShowFreebieForm(false)
        refreshFreebies()
    }

    const toggleFreebie = (id: string, active: boolean) => {
        updateFreebie(id, { active })
        refreshFreebies()
    }

    // ── Product multi-select for discounts ──
    const toggleProductInDiscount = (pid: string) => {
        const ids = discountForm.productIds || []
        setDiscountForm({
            ...discountForm,
            productIds: ids.includes(pid) ? ids.filter((x) => x !== pid) : [...ids, pid],
        })
    }

    return (
        <div>
            <div className="mb-6">
                <h1 className="font-serif text-xl font-bold text-foreground sm:text-2xl">Discounts & Freebies</h1>
                <p className="text-sm text-muted-foreground">Manage sale prices, coupon codes, and free gifts</p>
            </div>

            {/* Tabs */}
            <div className="mb-6 flex gap-1 rounded-xl bg-secondary p-1">
                <button
                    onClick={() => setTab("discounts")}
                    className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-xs font-bold transition-colors ${tab === "discounts" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
                        }`}
                >
                    <Tag className="h-3.5 w-3.5" />
                    Discounts ({discounts.length})
                </button>
                <button
                    onClick={() => setTab("freebies")}
                    className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-xs font-bold transition-colors ${tab === "freebies" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
                        }`}
                >
                    <Gift className="h-3.5 w-3.5" />
                    Freebies ({freebies.length})
                </button>
            </div>

            {/* ─── DISCOUNTS TAB ─── */}
            {tab === "discounts" && (
                <div>
                    <div className="mb-4 flex justify-end">
                        <button onClick={openAddDiscount} className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-primary-foreground hover:bg-primary/90">
                            <Plus className="h-4 w-4" />
                            Create Discount
                        </button>
                    </div>

                    {discounts.length === 0 ? (
                        <div className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-card py-16">
                            <Tag className="h-10 w-10 text-muted-foreground/40" />
                            <p className="text-sm text-muted-foreground">No discounts yet</p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-3">
                            {discounts.map((d) => (
                                <div key={d.id} className={`rounded-xl border bg-card p-3 transition-all sm:rounded-2xl sm:p-5 ${d.active ? "border-emerald-300" : "border-border opacity-60"}`}>
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <h3 className="text-sm font-bold text-foreground">{d.name}</h3>
                                                <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${d.active ? "bg-emerald-500/10 text-emerald-600" : "bg-muted text-muted-foreground"}`}>
                                                    {d.active ? "Active" : "Inactive"}
                                                </span>
                                            </div>
                                            <p className="mt-1 text-xs text-muted-foreground">
                                                {d.type === "percentage" ? `${d.value}% off` : `₹${d.value} off`}
                                                {" · "}
                                                {d.applyTo === "all" ? "All products" : d.applyTo === "category" ? `Category: ${d.categoryFilter}` : `${d.productIds?.length || 0} specific products`}
                                                {d.couponCode ? ` · Code: ${d.couponCode}` : " · Auto-applied"}
                                                {d.minCartValue ? ` · Min cart: ₹${d.minCartValue}` : ""}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button onClick={() => toggleDiscount(d.id, !d.active)} className="text-muted-foreground hover:text-foreground" title="Toggle">
                                                {d.active ? <ToggleRight className="h-5 w-5 text-emerald-500" /> : <ToggleLeft className="h-5 w-5" />}
                                            </button>
                                            <button onClick={() => openEditDiscount(d)} className="text-muted-foreground hover:text-foreground">
                                                <Pencil className="h-4 w-4" />
                                            </button>
                                            <button onClick={() => { deleteDiscount(d.id); refreshDiscounts() }} className="text-muted-foreground hover:text-destructive">
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* ─── FREEBIES TAB ─── */}
            {tab === "freebies" && (
                <div>
                    <div className="mb-4 flex justify-end">
                        <button onClick={openAddFreebie} className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-primary-foreground hover:bg-primary/90">
                            <Plus className="h-4 w-4" />
                            Create Freebie Rule
                        </button>
                    </div>

                    {freebies.length === 0 ? (
                        <div className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-card py-16">
                            <Gift className="h-10 w-10 text-muted-foreground/40" />
                            <p className="text-sm text-muted-foreground">No freebie rules yet</p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-3">
                            {freebies.map((f) => {
                                const triggerProduct = products.find((p) => p.id === f.triggerProductId)
                                const freebieProduct = products.find((p) => p.id === f.freebieProductId)
                                return (
                                    <div key={f.id} className={`rounded-xl border bg-card p-3 transition-all sm:rounded-2xl sm:p-5 ${f.active ? "border-violet-300" : "border-border opacity-60"}`}>
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <h3 className="text-sm font-bold text-foreground">{f.name}</h3>
                                                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${f.active ? "bg-violet-500/10 text-violet-600" : "bg-muted text-muted-foreground"}`}>
                                                        {f.active ? "Active" : "Inactive"}
                                                    </span>
                                                </div>
                                                <p className="mt-1 text-xs text-muted-foreground">
                                                    Trigger: {f.triggerType === "product" ? `Buy "${triggerProduct?.name || f.triggerProductId}"` : f.triggerType === "cartValue" ? `Cart ≥ ₹${f.triggerValue}` : `Cart ≥ ${f.triggerValue} items`}
                                                    {" → Free: "}
                                                    {f.freebieProductId ? (freebieProduct?.name || f.freebieProductId) : f.freebieCustomName}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button onClick={() => toggleFreebie(f.id, !f.active)} className="text-muted-foreground hover:text-foreground">
                                                    {f.active ? <ToggleRight className="h-5 w-5 text-violet-500" /> : <ToggleLeft className="h-5 w-5" />}
                                                </button>
                                                <button onClick={() => openEditFreebie(f)} className="text-muted-foreground hover:text-foreground">
                                                    <Pencil className="h-4 w-4" />
                                                </button>
                                                <button onClick={() => { deleteFreebie(f.id); refreshFreebies() }} className="text-muted-foreground hover:text-destructive">
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* ─── DISCOUNT FORM MODAL ─── */}
            {showDiscountForm && (
                <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-2 pt-4 backdrop-blur-sm sm:p-4 sm:pt-16">
                    <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-4 shadow-2xl sm:p-6">
                        <div className="mb-5 flex items-center justify-between">
                            <h2 className="font-serif text-lg font-bold text-foreground">
                                {editingDiscountId ? "Edit Discount" : "Create Discount"}
                            </h2>
                            <button onClick={() => setShowDiscountForm(false)} className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:bg-secondary">
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        <div className="flex flex-col gap-4">
                            <div>
                                <label className="mb-1 block text-xs font-bold text-muted-foreground">Discount Name *</label>
                                <input type="text" value={discountForm.name} onChange={(e) => setDiscountForm({ ...discountForm, name: e.target.value })} className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary" placeholder="e.g. Summer Sale 20% Off" />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="mb-1 block text-xs font-bold text-muted-foreground">Type</label>
                                    <select value={discountForm.type} onChange={(e) => setDiscountForm({ ...discountForm, type: e.target.value as "percentage" | "flat" })} className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary">
                                        <option value="percentage">Percentage (%)</option>
                                        <option value="flat">Flat Amount (₹)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="mb-1 block text-xs font-bold text-muted-foreground">Value</label>
                                    <input type="number" value={discountForm.value || ""} onChange={(e) => setDiscountForm({ ...discountForm, value: Number(e.target.value) })} className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary" placeholder={discountForm.type === "percentage" ? "20" : "50"} />
                                </div>
                            </div>

                            <div>
                                <label className="mb-1 block text-xs font-bold text-muted-foreground">Apply To</label>
                                <select value={discountForm.applyTo} onChange={(e) => setDiscountForm({ ...discountForm, applyTo: e.target.value as "all" | "category" | "products" })} className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary">
                                    <option value="all">All Products</option>
                                    <option value="category">Specific Category</option>
                                    <option value="products">Specific Products</option>
                                </select>
                            </div>

                            {discountForm.applyTo === "category" && (
                                <div>
                                    <label className="mb-1 block text-xs font-bold text-muted-foreground">Category</label>
                                    <select value={discountForm.categoryFilter || ""} onChange={(e) => setDiscountForm({ ...discountForm, categoryFilter: e.target.value })} className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary">
                                        <option value="">Select category</option>
                                        {editableCategories.map((c) => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                            )}

                            {discountForm.applyTo === "products" && (
                                <div>
                                    <label className="mb-1 block text-xs font-bold text-muted-foreground">Select Products</label>
                                    <div className="max-h-40 overflow-y-auto rounded-xl border border-border p-2">
                                        {products.map((p) => (
                                            <label key={p.id} className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-secondary">
                                                <input type="checkbox" checked={discountForm.productIds?.includes(p.id) || false} onChange={() => toggleProductInDiscount(p.id)} className="accent-primary" />
                                                <span className="text-xs text-foreground">{p.name} — ₹{p.price}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="mb-1 block text-xs font-bold text-muted-foreground">Min Cart Value (₹)</label>
                                    <input type="number" value={discountForm.minCartValue || ""} onChange={(e) => setDiscountForm({ ...discountForm, minCartValue: Number(e.target.value) })} className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary" placeholder="0 = no minimum" />
                                </div>
                                <div>
                                    <label className="mb-1 block text-xs font-bold text-muted-foreground">Coupon Code</label>
                                    <input type="text" value={discountForm.couponCode || ""} onChange={(e) => setDiscountForm({ ...discountForm, couponCode: e.target.value.toUpperCase() })} className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm uppercase outline-none focus:border-primary" placeholder="Blank = auto" />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="mb-1 block text-xs font-bold text-muted-foreground">Start Date</label>
                                    <input type="date" value={discountForm.startDate || ""} onChange={(e) => setDiscountForm({ ...discountForm, startDate: e.target.value })} className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary" />
                                </div>
                                <div>
                                    <label className="mb-1 block text-xs font-bold text-muted-foreground">End Date</label>
                                    <input type="date" value={discountForm.endDate || ""} onChange={(e) => setDiscountForm({ ...discountForm, endDate: e.target.value })} className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary" />
                                </div>
                            </div>

                            <label className="flex items-center gap-3">
                                <input type="checkbox" checked={discountForm.active} onChange={(e) => setDiscountForm({ ...discountForm, active: e.target.checked })} className="h-4 w-4 rounded accent-primary" />
                                <span className="text-sm font-semibold text-foreground">Active</span>
                            </label>
                        </div>

                        <div className="mt-6 flex gap-3">
                            <button onClick={saveDiscount} className="flex-1 rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground hover:bg-primary/90">
                                {editingDiscountId ? "Save Changes" : "Create Discount"}
                            </button>
                            <button onClick={() => setShowDiscountForm(false)} className="rounded-xl bg-secondary px-6 py-3 text-sm font-bold text-secondary-foreground hover:bg-secondary/80">
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ─── FREEBIE FORM MODAL ─── */}
            {showFreebieForm && (
                <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-2 pt-4 backdrop-blur-sm sm:p-4 sm:pt-16">
                    <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-4 shadow-2xl sm:p-6">
                        <div className="mb-5 flex items-center justify-between">
                            <h2 className="font-serif text-lg font-bold text-foreground">
                                {editingFreebieId ? "Edit Freebie" : "Create Freebie Rule"}
                            </h2>
                            <button onClick={() => setShowFreebieForm(false)} className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:bg-secondary">
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        <div className="flex flex-col gap-4">
                            <div>
                                <label className="mb-1 block text-xs font-bold text-muted-foreground">Rule Name *</label>
                                <input type="text" value={freebieForm.name} onChange={(e) => setFreebieForm({ ...freebieForm, name: e.target.value })} className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary" placeholder="e.g. Free keychain with ₹500 order" />
                            </div>

                            <div>
                                <label className="mb-1 block text-xs font-bold text-muted-foreground">Trigger Type</label>
                                <select value={freebieForm.triggerType} onChange={(e) => setFreebieForm({ ...freebieForm, triggerType: e.target.value as "product" | "cartValue" | "cartQuantity" })} className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary">
                                    <option value="cartValue">Cart value milestone (₹)</option>
                                    <option value="cartQuantity">Cart quantity milestone (items)</option>
                                    <option value="product">Specific product purchase</option>
                                </select>
                            </div>

                            {freebieForm.triggerType === "product" ? (
                                <div>
                                    <label className="mb-1 block text-xs font-bold text-muted-foreground">When customer buys</label>
                                    <select value={freebieForm.triggerProductId || ""} onChange={(e) => setFreebieForm({ ...freebieForm, triggerProductId: e.target.value })} className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary">
                                        <option value="">Select product</option>
                                        {products.map((p) => <option key={p.id} value={p.id}>{p.name} — ₹{p.price}</option>)}
                                    </select>
                                </div>
                            ) : (
                                <div>
                                    <label className="mb-1 block text-xs font-bold text-muted-foreground">
                                        {freebieForm.triggerType === "cartValue" ? "Minimum Cart Value (₹)" : "Minimum Items in Cart"}
                                    </label>
                                    <input type="number" value={freebieForm.triggerValue || ""} onChange={(e) => setFreebieForm({ ...freebieForm, triggerValue: Number(e.target.value) })} className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary" placeholder={freebieForm.triggerType === "cartValue" ? "500" : "3"} />
                                </div>
                            )}

                            <div>
                                <label className="mb-1 block text-xs font-bold text-muted-foreground">Free Gift — Choose product</label>
                                <select value={freebieForm.freebieProductId || ""} onChange={(e) => setFreebieForm({ ...freebieForm, freebieProductId: e.target.value })} className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary">
                                    <option value="">— Or type a custom name below —</option>
                                    {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                                </select>
                            </div>

                            <div>
                                <label className="mb-1 block text-xs font-bold text-muted-foreground">Or enter custom freebie name</label>
                                <input type="text" value={freebieForm.freebieCustomName || ""} onChange={(e) => setFreebieForm({ ...freebieForm, freebieCustomName: e.target.value })} className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary" placeholder="e.g. Mystery sticker pack" />
                            </div>

                            <label className="flex items-center gap-3">
                                <input type="checkbox" checked={freebieForm.active} onChange={(e) => setFreebieForm({ ...freebieForm, active: e.target.checked })} className="h-4 w-4 rounded accent-primary" />
                                <span className="text-sm font-semibold text-foreground">Active</span>
                            </label>
                        </div>

                        <div className="mt-6 flex gap-3">
                            <button onClick={saveFreebie} className="flex-1 rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground hover:bg-primary/90">
                                {editingFreebieId ? "Save Changes" : "Create Freebie"}
                            </button>
                            <button onClick={() => setShowFreebieForm(false)} className="rounded-xl bg-secondary px-6 py-3 text-sm font-bold text-secondary-foreground hover:bg-secondary/80">
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
