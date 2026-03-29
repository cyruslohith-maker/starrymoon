// Client-side localStorage store for dashboard data
// All data persists in the browser only (no backend)

import type { Product } from "./data"
import { products as seedProducts } from "./data"

// ─── Types ───────────────────────────────────────

export interface DiscountRule {
    id: string
    name: string
    type: "percentage" | "flat"
    value: number // percent (0-100) or flat ₹ amount
    applyTo: "all" | "category" | "products"
    categoryFilter?: string // when applyTo === "category"
    productIds?: string[] // when applyTo === "products"
    minCartValue?: number
    minQuantity?: number
    couponCode?: string // optional — blank = auto-applied
    startDate?: string // ISO string
    endDate?: string // ISO string
    active: boolean
}

export interface FreebieRule {
    id: string
    name: string
    triggerType: "product" | "cartValue" | "cartQuantity"
    triggerProductId?: string // when triggerType === "product"
    triggerValue?: number // ₹ threshold or qty threshold
    freebieProductId?: string // pick from products
    freebieCustomName?: string // or enter custom name
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
    createdAt: string // ISO string
}

// ─── Storage Keys ────────────────────────────────

const KEYS = {
    products: "st4rry_products",
    discounts: "st4rry_discounts",
    freebies: "st4rry_freebies",
    orders: "st4rry_orders",
    pin: "st4rry_dashboard_pin",
} as const

// ─── Helpers ─────────────────────────────────────

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

function generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 7)
}

// ─── Products ────────────────────────────────────

export function getProducts(): Product[] {
    const stored = read<Product[] | null>(KEYS.products, null)
    if (!stored) {
        // First load: seed from static data with quantity field
        const seeded = seedProducts.map((p) => ({ ...p, quantity: 10 }))
        write(KEYS.products, seeded)
        return seeded
    }
    return stored
}

export function saveProducts(products: Product[]): void {
    write(KEYS.products, products)
}

export function addProduct(product: Omit<Product, "id">): Product {
    const products = getProducts()
    const newProduct: Product = { ...product, id: generateId() }
    products.push(newProduct)
    saveProducts(products)
    return newProduct
}

export function updateProduct(id: string, updates: Partial<Product>): void {
    const products = getProducts().map((p) => (p.id === id ? { ...p, ...updates } : p))
    saveProducts(products)
}

export function deleteProduct(id: string): void {
    saveProducts(getProducts().filter((p) => p.id !== id))
}

// ─── Discounts ───────────────────────────────────

export function getDiscounts(): DiscountRule[] {
    return read<DiscountRule[]>(KEYS.discounts, [])
}

export function saveDiscounts(discounts: DiscountRule[]): void {
    write(KEYS.discounts, discounts)
}

export function addDiscount(rule: Omit<DiscountRule, "id">): DiscountRule {
    const discounts = getDiscounts()
    const newRule: DiscountRule = { ...rule, id: generateId() }
    discounts.push(newRule)
    saveDiscounts(discounts)
    return newRule
}

export function updateDiscount(id: string, updates: Partial<DiscountRule>): void {
    saveDiscounts(getDiscounts().map((d) => (d.id === id ? { ...d, ...updates } : d)))
}

export function deleteDiscount(id: string): void {
    saveDiscounts(getDiscounts().filter((d) => d.id !== id))
}

/** Get the best active discount for a given product */
export function getProductDiscount(product: Product): DiscountRule | null {
    const now = new Date()
    const discounts = getDiscounts().filter((d) => {
        if (!d.active) return false
        if (d.couponCode) return false // coupon-based discounts need manual application
        if (d.startDate && new Date(d.startDate) > now) return false
        if (d.endDate && new Date(d.endDate) < now) return false
        if (d.applyTo === "all") return true
        if (d.applyTo === "category" && d.categoryFilter === product.category) return true
        if (d.applyTo === "products" && d.productIds?.includes(product.id)) return true
        return false
    })

    if (discounts.length === 0) return null

    // Return the one that gives the biggest discount
    return discounts.reduce((best, d) => {
        const bestAmount = best.type === "percentage" ? (product.price * best.value) / 100 : best.value
        const dAmount = d.type === "percentage" ? (product.price * d.value) / 100 : d.value
        return dAmount > bestAmount ? d : best
    })
}

/** Calculate discounted price */
export function getDiscountedPrice(product: Product): number | null {
    const discount = getProductDiscount(product)
    if (!discount) return null
    if (discount.type === "percentage") {
        return Math.round(product.price * (1 - discount.value / 100))
    }
    return Math.max(0, product.price - discount.value)
}

// ─── Freebies ────────────────────────────────────

export function getFreebies(): FreebieRule[] {
    return read<FreebieRule[]>(KEYS.freebies, [])
}

export function saveFreebies(freebies: FreebieRule[]): void {
    write(KEYS.freebies, freebies)
}

export function addFreebie(rule: Omit<FreebieRule, "id">): FreebieRule {
    const freebies = getFreebies()
    const newRule: FreebieRule = { ...rule, id: generateId() }
    freebies.push(newRule)
    saveFreebies(freebies)
    return newRule
}

export function updateFreebie(id: string, updates: Partial<FreebieRule>): void {
    saveFreebies(getFreebies().map((f) => (f.id === id ? { ...f, ...updates } : f)))
}

export function deleteFreebie(id: string): void {
    saveFreebies(getFreebies().filter((f) => f.id !== id))
}

// ─── Orders ──────────────────────────────────────

export function getOrders(): Order[] {
    return read<Order[]>(KEYS.orders, [])
}

export function saveOrders(orders: Order[]): void {
    write(KEYS.orders, orders)
}

export function addOrder(order: Omit<Order, "id" | "createdAt">): Order {
    const orders = getOrders()
    const newOrder: Order = { ...order, id: generateId(), createdAt: new Date().toISOString() }
    orders.push(newOrder)
    saveOrders(orders)
    return newOrder
}

export function updateOrder(id: string, updates: Partial<Order>): void {
    saveOrders(getOrders().map((o) => (o.id === id ? { ...o, ...updates } : o)))
}

export function deleteOrder(id: string): void {
    saveOrders(getOrders().filter((o) => o.id !== id))
}

// ─── PIN ─────────────────────────────────────────

export function getDashboardPin(): string {
    return read<string>(KEYS.pin, "1234")
}

export function setDashboardPin(pin: string): void {
    write(KEYS.pin, pin)
}
