import { NextRequest, NextResponse } from "next/server"
import { promises as fs } from "fs"
import path from "path"

const ORDERS_FILE = path.join(process.cwd(), "data", "orders.json")

interface OrderItem {
    productId: string
    productName: string
    quantity: number
    price: number
    size?: string
}

interface StoredOrder {
    id: string
    customerName: string
    email: string
    phone: string
    whatsapp?: string
    address: string
    city: string
    state: string
    pincode: string
    items: OrderItem[]
    subtotal: number
    shippingCost: number
    total: number
    specialRequest?: string
    paymentMode: string
    status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled"
    awbNumber?: string
    fshipPushed?: boolean
    createdAt: string
}

// ── Read orders from file ──
async function readOrders(): Promise<StoredOrder[]> {
    try {
        const raw = await fs.readFile(ORDERS_FILE, "utf-8")
        return JSON.parse(raw)
    } catch {
        return []
    }
}

// ── Write orders to file ──
async function writeOrders(orders: StoredOrder[]): Promise<void> {
    await fs.mkdir(path.dirname(ORDERS_FILE), { recursive: true })
    await fs.writeFile(ORDERS_FILE, JSON.stringify(orders, null, 2), "utf-8")
}

// ── Generate unique ID ──
function generateId(): string {
    return "ORD-" + Date.now().toString(36).toUpperCase() + Math.random().toString(36).slice(2, 5).toUpperCase()
}

/**
 * GET /api/orders — return all stored orders
 */
export async function GET() {
    try {
        const orders = await readOrders()
        return NextResponse.json({ orders }, { status: 200 })
    } catch (error) {
        console.error("Failed to read orders:", error)
        return NextResponse.json({ error: "Failed to read orders" }, { status: 500 })
    }
}

/**
 * POST /api/orders — save a new order from checkout
 */
export async function POST(req: NextRequest) {
    try {
        const body = await req.json()

        // Validate required fields
        const { customerName, email, phone, address, city, state, pincode, items, subtotal, shippingCost, total } = body

        if (!customerName || !phone || !address || !city || !pincode || !items || items.length === 0) {
            return NextResponse.json(
                { error: "Missing required fields: customerName, phone, address, city, pincode, items" },
                { status: 400 }
            )
        }

        const newOrder: StoredOrder = {
            id: generateId(),
            customerName: customerName || "",
            email: email || "",
            phone: phone || "",
            whatsapp: body.whatsapp || "",
            address: address || "",
            city: city || "",
            state: state || "",
            pincode: pincode || "",
            items: items || [],
            subtotal: subtotal || 0,
            shippingCost: shippingCost || 0,
            total: total || 0,
            specialRequest: body.specialRequest || "",
            paymentMode: body.paymentMode || "Prepaid",
            status: "pending",
            awbNumber: "",
            fshipPushed: false,
            createdAt: new Date().toISOString(),
        }

        const orders = await readOrders()
        orders.push(newOrder)
        await writeOrders(orders)

        return NextResponse.json({ order: newOrder }, { status: 201 })
    } catch (error) {
        console.error("Failed to save order:", error)
        return NextResponse.json({ error: "Failed to save order" }, { status: 500 })
    }
}

/**
 * PATCH /api/orders — update an existing order (status, AWB, etc.)
 */
export async function PATCH(req: NextRequest) {
    try {
        const body = await req.json()
        const { id, ...updates } = body

        if (!id) {
            return NextResponse.json({ error: "Missing order id" }, { status: 400 })
        }

        const orders = await readOrders()
        const index = orders.findIndex((o) => o.id === id)

        if (index === -1) {
            return NextResponse.json({ error: "Order not found" }, { status: 404 })
        }

        orders[index] = { ...orders[index], ...updates }
        await writeOrders(orders)

        return NextResponse.json({ order: orders[index] }, { status: 200 })
    } catch (error) {
        console.error("Failed to update order:", error)
        return NextResponse.json({ error: "Failed to update order" }, { status: 500 })
    }
}
