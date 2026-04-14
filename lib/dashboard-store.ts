// Supabase-backed store for dashboard data
// All data persists in the database — shared across all staff

import { getSupabase } from "./supabase"
import type { Product } from "./data"
import { products as seedProducts } from "./data"

// ─── Types ───────────────────────────────────────

export interface DiscountRule {
    id: string
    name: string
    type: "percentage" | "flat"
    value: number
    applyTo: "all" | "category" | "products"
    categoryFilter?: string
    productIds?: string[]
    minCartValue?: number
    minQuantity?: number
    couponCode?: string
    startDate?: string
    endDate?: string
    active: boolean
}

export interface FreebieRule {
    id: string
    name: string
    triggerType: "product" | "cartValue" | "cartQuantity"
    triggerProductId?: string
    triggerValue?: number
    freebieProductId?: string
    freebieCustomName?: string
    active: boolean
}

export interface Order {
    id: string
    customerName: string
    phone: string
    address: string
    items: { productId: string; productName: string; quantity: number; price: number }[]
    total: number
    status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled"
    awbNumber?: string
    notes?: string
    createdAt: string
}

// ─── Helpers ─────────────────────────────────────

function generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 7)
}

const supabase = () => getSupabase()

// ─── Products ────────────────────────────────────

function rowToProduct(row: Record<string, unknown>): Product {
    return {
        id: row.id as string,
        name: row.name as string,
        price: row.price as number,
        image: (row.image as string) || "",
        images: (row.images as string[]) || [],
        tag: (row.tag as string) || "",
        category: (row.category as string) || "Bracelets",
        description: (row.description as string) || "",
        colors: (row.colors as string[]) || [],
        sizes: (row.sizes as string[]) || [],
        inStock: row.in_stock !== false,
        quantity: (row.quantity as number) ?? 10,
    }
}

function productToRow(p: Omit<Product, "id"> & { id?: string }) {
    return {
        id: p.id || generateId(),
        name: p.name,
        price: p.price,
        image: p.image || "",
        images: p.images || [],
        tag: p.tag || "",
        category: p.category || "Bracelets",
        description: p.description || "",
        colors: p.colors || [],
        sizes: p.sizes || [],
        in_stock: p.inStock !== false,
        quantity: p.quantity ?? 10,
    }
}

export async function getProducts(): Promise<Product[]> {
    const { data, error } = await supabase().from("products").select("*").order("created_at", { ascending: false })
    if (error) {
        console.error("getProducts error:", error)
        return []
    }
    if (!data || data.length === 0) {
        // Auto-seed on first load
        await seedProducts_()
        const { data: seeded } = await supabase().from("products").select("*").order("created_at", { ascending: false })
        return (seeded || []).map(rowToProduct)
    }
    return data.map(rowToProduct)
}

async function seedProducts_() {
    const rows = seedProducts.map((p) => ({
        ...productToRow({ ...p, quantity: 10 }),
        created_at: new Date().toISOString(),
    }))
    const { error } = await supabase().from("products").insert(rows)
    if (error) console.error("Seed products error:", error)
}

export async function addProduct(product: Omit<Product, "id">): Promise<Product> {
    const id = generateId()
    const row = { ...productToRow({ ...product, id }), created_at: new Date().toISOString() }
    const { error } = await supabase().from("products").insert(row)
    if (error) throw new Error(error.message)
    return { ...product, id }
}

export async function updateProduct(id: string, updates: Partial<Product>): Promise<void> {
    const dbUpdates: Record<string, unknown> = {}
    if (updates.name !== undefined) dbUpdates.name = updates.name
    if (updates.price !== undefined) dbUpdates.price = updates.price
    if (updates.image !== undefined) dbUpdates.image = updates.image
    if (updates.images !== undefined) dbUpdates.images = updates.images
    if (updates.tag !== undefined) dbUpdates.tag = updates.tag
    if (updates.category !== undefined) dbUpdates.category = updates.category
    if (updates.description !== undefined) dbUpdates.description = updates.description
    if (updates.colors !== undefined) dbUpdates.colors = updates.colors
    if (updates.sizes !== undefined) dbUpdates.sizes = updates.sizes
    if (updates.inStock !== undefined) dbUpdates.in_stock = updates.inStock
    if (updates.quantity !== undefined) dbUpdates.quantity = updates.quantity

    const { error } = await supabase().from("products").update(dbUpdates).eq("id", id)
    if (error) throw new Error(error.message)
}

export async function deleteProduct(id: string): Promise<void> {
    const { error } = await supabase().from("products").delete().eq("id", id)
    if (error) throw new Error(error.message)
}

// ─── Product Image Upload ────────────────────────

export async function uploadProductImage(file: File): Promise<string> {
    const ext = file.name.split(".").pop() || "jpg"
    const fileName = `${generateId()}.${ext}`
    const path = `products/${fileName}`

    const { error } = await supabase().storage.from("product-images").upload(path, file, {
        cacheControl: "3600",
        upsert: false,
    })

    if (error) throw new Error(error.message)

    const { data } = supabase().storage.from("product-images").getPublicUrl(path)
    return data.publicUrl
}

// ─── Discounts ───────────────────────────────────

function rowToDiscount(row: Record<string, unknown>): DiscountRule {
    return {
        id: row.id as string,
        name: row.name as string,
        type: (row.type as "percentage" | "flat") || "percentage",
        value: (row.value as number) || 0,
        applyTo: (row.apply_to as "all" | "category" | "products") || "all",
        categoryFilter: (row.category_filter as string) || "",
        productIds: (row.product_ids as string[]) || [],
        minCartValue: (row.min_cart_value as number) || 0,
        minQuantity: (row.min_quantity as number) || 0,
        couponCode: (row.coupon_code as string) || "",
        startDate: (row.start_date as string) || undefined,
        endDate: (row.end_date as string) || undefined,
        active: row.active !== false,
    }
}

export async function getDiscounts(): Promise<DiscountRule[]> {
    const { data, error } = await supabase().from("discounts").select("*").order("created_at", { ascending: false })
    if (error) { console.error("getDiscounts error:", error); return [] }
    return (data || []).map(rowToDiscount)
}

export async function addDiscount(rule: Omit<DiscountRule, "id">): Promise<DiscountRule> {
    const id = generateId()
    const { error } = await supabase().from("discounts").insert({
        id,
        name: rule.name,
        type: rule.type,
        value: rule.value,
        apply_to: rule.applyTo,
        category_filter: rule.categoryFilter || "",
        product_ids: rule.productIds || [],
        min_cart_value: rule.minCartValue || 0,
        min_quantity: rule.minQuantity || 0,
        coupon_code: rule.couponCode || "",
        start_date: rule.startDate || null,
        end_date: rule.endDate || null,
        active: rule.active,
        created_at: new Date().toISOString(),
    })
    if (error) throw new Error(error.message)
    return { ...rule, id }
}

export async function updateDiscount(id: string, updates: Partial<DiscountRule>): Promise<void> {
    const dbUpdates: Record<string, unknown> = {}
    if (updates.name !== undefined) dbUpdates.name = updates.name
    if (updates.type !== undefined) dbUpdates.type = updates.type
    if (updates.value !== undefined) dbUpdates.value = updates.value
    if (updates.applyTo !== undefined) dbUpdates.apply_to = updates.applyTo
    if (updates.categoryFilter !== undefined) dbUpdates.category_filter = updates.categoryFilter
    if (updates.productIds !== undefined) dbUpdates.product_ids = updates.productIds
    if (updates.minCartValue !== undefined) dbUpdates.min_cart_value = updates.minCartValue
    if (updates.minQuantity !== undefined) dbUpdates.min_quantity = updates.minQuantity
    if (updates.couponCode !== undefined) dbUpdates.coupon_code = updates.couponCode
    if (updates.startDate !== undefined) dbUpdates.start_date = updates.startDate
    if (updates.endDate !== undefined) dbUpdates.end_date = updates.endDate
    if (updates.active !== undefined) dbUpdates.active = updates.active

    const { error } = await supabase().from("discounts").update(dbUpdates).eq("id", id)
    if (error) throw new Error(error.message)
}

export async function deleteDiscount(id: string): Promise<void> {
    const { error } = await supabase().from("discounts").delete().eq("id", id)
    if (error) throw new Error(error.message)
}

/** Get the best active discount for a given product */
export async function getProductDiscount(product: Product): Promise<DiscountRule | null> {
    const now = new Date()
    const discounts = (await getDiscounts()).filter((d) => {
        if (!d.active) return false
        if (d.couponCode) return false
        if (d.startDate && new Date(d.startDate) > now) return false
        if (d.endDate && new Date(d.endDate) < now) return false
        if (d.applyTo === "all") return true
        if (d.applyTo === "category" && d.categoryFilter === product.category) return true
        if (d.applyTo === "products" && d.productIds?.includes(product.id)) return true
        return false
    })

    if (discounts.length === 0) return null

    return discounts.reduce((best, d) => {
        const bestAmount = best.type === "percentage" ? (product.price * best.value) / 100 : best.value
        const dAmount = d.type === "percentage" ? (product.price * d.value) / 100 : d.value
        return dAmount > bestAmount ? d : best
    })
}

/** Calculate discounted price */
export async function getDiscountedPrice(product: Product): Promise<number | null> {
    const discount = await getProductDiscount(product)
    if (!discount) return null
    if (discount.type === "percentage") {
        return Math.round(product.price * (1 - discount.value / 100))
    }
    return Math.max(0, product.price - discount.value)
}

// ─── Freebies ────────────────────────────────────

function rowToFreebie(row: Record<string, unknown>): FreebieRule {
    return {
        id: row.id as string,
        name: row.name as string,
        triggerType: (row.trigger_type as "product" | "cartValue" | "cartQuantity") || "product",
        triggerProductId: (row.trigger_product_id as string) || "",
        triggerValue: (row.trigger_value as number) || 0,
        freebieProductId: (row.freebie_product_id as string) || "",
        freebieCustomName: (row.freebie_custom_name as string) || "",
        active: row.active !== false,
    }
}

export async function getFreebies(): Promise<FreebieRule[]> {
    const { data, error } = await supabase().from("freebies").select("*").order("created_at", { ascending: false })
    if (error) { console.error("getFreebies error:", error); return [] }
    return (data || []).map(rowToFreebie)
}

export async function addFreebie(rule: Omit<FreebieRule, "id">): Promise<FreebieRule> {
    const id = generateId()
    const { error } = await supabase().from("freebies").insert({
        id,
        name: rule.name,
        trigger_type: rule.triggerType,
        trigger_product_id: rule.triggerProductId || "",
        trigger_value: rule.triggerValue || 0,
        freebie_product_id: rule.freebieProductId || "",
        freebie_custom_name: rule.freebieCustomName || "",
        active: rule.active,
        created_at: new Date().toISOString(),
    })
    if (error) throw new Error(error.message)
    return { ...rule, id }
}

export async function updateFreebie(id: string, updates: Partial<FreebieRule>): Promise<void> {
    const dbUpdates: Record<string, unknown> = {}
    if (updates.name !== undefined) dbUpdates.name = updates.name
    if (updates.triggerType !== undefined) dbUpdates.trigger_type = updates.triggerType
    if (updates.triggerProductId !== undefined) dbUpdates.trigger_product_id = updates.triggerProductId
    if (updates.triggerValue !== undefined) dbUpdates.trigger_value = updates.triggerValue
    if (updates.freebieProductId !== undefined) dbUpdates.freebie_product_id = updates.freebieProductId
    if (updates.freebieCustomName !== undefined) dbUpdates.freebie_custom_name = updates.freebieCustomName
    if (updates.active !== undefined) dbUpdates.active = updates.active

    const { error } = await supabase().from("freebies").update(dbUpdates).eq("id", id)
    if (error) throw new Error(error.message)
}

export async function deleteFreebie(id: string): Promise<void> {
    const { error } = await supabase().from("freebies").delete().eq("id", id)
    if (error) throw new Error(error.message)
}

// ─── Orders ──────────────────────────────────────

function rowToOrder(row: Record<string, unknown>): Order {
    return {
        id: row.id as string,
        customerName: row.customer_name as string,
        phone: (row.phone as string) || "",
        address: (row.address as string) || "",
        items: (row.items as Order["items"]) || [],
        total: (row.total as number) || 0,
        status: (row.status as Order["status"]) || "pending",
        awbNumber: (row.awb_number as string) || "",
        notes: (row.notes as string) || "",
        createdAt: (row.created_at as string) || new Date().toISOString(),
    }
}

export async function getOrders(): Promise<Order[]> {
    const { data, error } = await supabase().from("dashboard_orders").select("*").order("created_at", { ascending: false })
    if (error) { console.error("getOrders error:", error); return [] }
    return (data || []).map(rowToOrder)
}

export async function addOrder(order: Omit<Order, "id" | "createdAt">): Promise<Order> {
    const id = generateId()
    const now = new Date().toISOString()
    const { error } = await supabase().from("dashboard_orders").insert({
        id,
        customer_name: order.customerName,
        phone: order.phone,
        address: order.address,
        items: order.items,
        total: order.total,
        status: order.status,
        awb_number: order.awbNumber || "",
        notes: order.notes || "",
        created_at: now,
    })
    if (error) throw new Error(error.message)
    return { ...order, id, createdAt: now }
}

export async function updateOrder(id: string, updates: Partial<Order>): Promise<void> {
    const dbUpdates: Record<string, unknown> = {}
    if (updates.customerName !== undefined) dbUpdates.customer_name = updates.customerName
    if (updates.phone !== undefined) dbUpdates.phone = updates.phone
    if (updates.address !== undefined) dbUpdates.address = updates.address
    if (updates.items !== undefined) dbUpdates.items = updates.items
    if (updates.total !== undefined) dbUpdates.total = updates.total
    if (updates.status !== undefined) dbUpdates.status = updates.status
    if (updates.awbNumber !== undefined) dbUpdates.awb_number = updates.awbNumber
    if (updates.notes !== undefined) dbUpdates.notes = updates.notes

    const { error } = await supabase().from("dashboard_orders").update(dbUpdates).eq("id", id)
    if (error) throw new Error(error.message)
}

export async function deleteOrder(id: string): Promise<void> {
    const { error } = await supabase().from("dashboard_orders").delete().eq("id", id)
    if (error) throw new Error(error.message)
}

// ─── PIN ─────────────────────────────────────────
// Keep PIN in localStorage since it's device-specific

function read<T>(key: string, fallback: T): T {
    if (typeof window === "undefined") return fallback
    try {
        const raw = localStorage.getItem(key)
        return raw ? JSON.parse(raw) : fallback
    } catch {
        return fallback
    }
}

function write<T>(key: string, data: T): void {
    if (typeof window === "undefined") return
    localStorage.setItem(key, JSON.stringify(data))
}

export function getDashboardPin(): string {
    return read<string>("starrymoon_dashboard_pin", "1234")
}

export function setDashboardPin(pin: string): void {
    write("starrymoon_dashboard_pin", pin)
}
