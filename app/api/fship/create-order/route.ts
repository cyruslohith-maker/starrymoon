import { NextRequest, NextResponse } from "next/server"

/**
 * POST /api/fship/create-order
 * Proxies order creation to Fship API securely (key stays server-side)
 *
 * From dashboard: click "Push to Fship" on an order
 */
export async function POST(req: NextRequest) {
    try {
        const apiKey = process.env.FSHIP_API_KEY

        if (!apiKey || apiKey === "PASTE_YOUR_FSHIP_KEY_HERE") {
            return NextResponse.json(
                { error: "Fship API key not configured. Update .env.local" },
                { status: 500 }
            )
        }

        const body = await req.json()
        const { order, useBackupWarehouse } = body

        if (!order) {
            return NextResponse.json({ error: "Missing order data" }, { status: 400 })
        }

        // Warehouse selection: W0 (primary) by default, W3 (backup) when flagged
        const primaryWarehouse = process.env.FSHIP_WAREHOUSE_PRIMARY || "W0"
        const backupWarehouse = process.env.FSHIP_WAREHOUSE_BACKUP || "W3"
        const warehouseId = useBackupWarehouse ? backupWarehouse : primaryWarehouse

        // Build Fship order payload
        const fshipPayload = {
            shipment_type: "forward",
            order_id: order.id,
            payment_mode: order.paymentMode === "COD" ? "COD" : "Prepaid",
            cod_amount: order.paymentMode === "COD" ? order.total : 0,
            order_amount: order.total,
            // Pickup from selected warehouse
            address_id: warehouseId,
            // Customer / delivery details
            customer_name: order.customerName,
            customer_phone: order.phone,
            customer_email: order.email || "",
            delivery_address_line1: order.address,
            delivery_address_line2: "",
            delivery_city: order.city,
            delivery_state: order.state,
            delivery_pincode: order.pincode,
            delivery_country: "India",
            // Package details (defaults for jewelry)
            weight: 0.2, // 200g in kg
            length: 15,
            breadth: 10,
            height: 5,
            // Products
            products: order.items.map((item: { productName: string; productId: string; quantity: number; price: number }) => ({
                product_name: item.productName,
                product_sku: item.productId,
                product_quantity: item.quantity,
                product_price: item.price,
            })),
        }

        const fshipResponse = await fetch("https://capi.fship.in/api/createorder", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                signature: apiKey,
            },
            body: JSON.stringify(fshipPayload),
        })

        const data = await fshipResponse.json()

        return NextResponse.json(data, { status: fshipResponse.status })
    } catch (error) {
        console.error("Fship create-order error:", error)
        return NextResponse.json(
            { error: "Failed to push order to Fship" },
            { status: 500 }
        )
    }
}
