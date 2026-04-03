import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

/**
 * GET /api/orders — return all stored orders
 */
export async function GET() {
    try {
        const { data, error } = await supabase
            .from("orders")
            .select("*")
            .order("created_at", { ascending: false })

        if (error) throw error

        // Map snake_case DB rows back to camelCase for frontend
        const orders = (data || []).map(rowToOrder)

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

        const { customerName, email, phone, address, city, state, pincode, items, subtotal, shippingCost, total } = body

        if (!customerName || !phone || !address || !city || !pincode || !items || items.length === 0) {
            return NextResponse.json(
                { error: "Missing required fields: customerName, phone, address, city, pincode, items" },
                { status: 400 }
            )
        }

        const id = "ORD-" + Date.now().toString(36).toUpperCase() + Math.random().toString(36).slice(2, 5).toUpperCase()

        const { error } = await supabase.from("orders").insert({
            id,
            customer_name: customerName || "",
            email: email || "",
            phone: phone || "",
            whatsapp: body.whatsapp || "",
            address: address || "",
            city: city || "",
            state: state || "",
            pincode: pincode || "",
            items: items || [],
            subtotal: subtotal || 0,
            shipping_cost: shippingCost || 0,
            total: total || 0,
            special_request: body.specialRequest || "",
            payment_mode: body.paymentMode || "Prepaid",
            status: "pending",
            awb_number: "",
            fship_pushed: false,
            created_at: new Date().toISOString(),
        })

        if (error) throw error

        // Return the order in camelCase format for frontend
        const newOrder = {
            id,
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

        // Convert camelCase updates to snake_case for Supabase
        const dbUpdates: Record<string, unknown> = {}
        if (updates.customerName !== undefined) dbUpdates.customer_name = updates.customerName
        if (updates.email !== undefined) dbUpdates.email = updates.email
        if (updates.phone !== undefined) dbUpdates.phone = updates.phone
        if (updates.whatsapp !== undefined) dbUpdates.whatsapp = updates.whatsapp
        if (updates.address !== undefined) dbUpdates.address = updates.address
        if (updates.city !== undefined) dbUpdates.city = updates.city
        if (updates.state !== undefined) dbUpdates.state = updates.state
        if (updates.pincode !== undefined) dbUpdates.pincode = updates.pincode
        if (updates.items !== undefined) dbUpdates.items = updates.items
        if (updates.subtotal !== undefined) dbUpdates.subtotal = updates.subtotal
        if (updates.shippingCost !== undefined) dbUpdates.shipping_cost = updates.shippingCost
        if (updates.total !== undefined) dbUpdates.total = updates.total
        if (updates.specialRequest !== undefined) dbUpdates.special_request = updates.specialRequest
        if (updates.paymentMode !== undefined) dbUpdates.payment_mode = updates.paymentMode
        if (updates.status !== undefined) dbUpdates.status = updates.status
        if (updates.awbNumber !== undefined) dbUpdates.awb_number = updates.awbNumber
        if (updates.fshipPushed !== undefined) dbUpdates.fship_pushed = updates.fshipPushed

        const { data, error } = await supabase
            .from("orders")
            .update(dbUpdates)
            .eq("id", id)
            .select()
            .single()

        if (error) throw error

        return NextResponse.json({ order: rowToOrder(data) }, { status: 200 })
    } catch (error) {
        console.error("Failed to update order:", error)
        return NextResponse.json({ error: "Failed to update order" }, { status: 500 })
    }
}

// ─── Row Mapper ──────────────────────────────────

function rowToOrder(row: Record<string, unknown>) {
    return {
        id: row.id,
        customerName: row.customer_name || "",
        email: row.email || "",
        phone: row.phone || "",
        whatsapp: row.whatsapp || "",
        address: row.address || "",
        city: row.city || "",
        state: row.state || "",
        pincode: row.pincode || "",
        items: row.items || [],
        subtotal: row.subtotal || 0,
        shippingCost: row.shipping_cost || 0,
        total: row.total || 0,
        specialRequest: row.special_request || "",
        paymentMode: row.payment_mode || "Prepaid",
        status: row.status || "pending",
        awbNumber: row.awb_number || "",
        fshipPushed: row.fship_pushed || false,
        createdAt: row.created_at || "",
    }
}
