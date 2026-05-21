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

        // Warehouse selection — env vars must be numeric IDs from Fship Dashboard → Manage Warehouse
        const primaryWarehouseId = parseInt(process.env.FSHIP_WAREHOUSE_PRIMARY_ID || "0", 10)
        const backupWarehouseId = parseInt(process.env.FSHIP_WAREHOUSE_BACKUP_ID || "0", 10)
        const warehouseId = useBackupWarehouse ? backupWarehouseId : primaryWarehouseId

        // Build Fship order payload — field names match official Fship API docs v1.2.3.2
        const fshipPayload = {
            // Customer / delivery details
            customer_Name: order.customerName,
            customer_Mobile: order.phone,
            customer_Emailid: order.email || "",
            customer_Address: order.address,
            landMark: "",
            customer_Address_Type: "Home",
            customer_PinCode: order.pincode,
            customer_City: order.city,
            // Order details
            orderId: order.id,
            invoice_Number: order.id,
            payment_Mode: order.paymentMode === "COD" ? 1 : 2, // 1=COD, 2=PREPAID
            express_Type: "surface",
            is_Ndd: 0,
            order_Amount: order.total,
            tax_Amount: 0,
            extra_Charges: 0,
            total_Amount: order.total,
            cod_Amount: order.paymentMode === "COD" ? order.total : 0,
            // Package details (defaults for jewelry — weight in kg, dimensions in cm)
            shipment_Weight: 0.2,
            shipment_Length: 15,
            shipment_Width: 10,
            shipment_Height: 5,
            volumetric_Weight: (15 * 10 * 5) / 5000, // LxBxH/5000
            latitude: 0,
            longitude: 0,
            // Pickup warehouse
            pick_Address_ID: warehouseId,
            // Products
            products: order.items.map((item: { productName: string; productId: string; quantity: number; price: number }) => ({
                productId: item.productId,
                productName: item.productName,
                unitPrice: item.price,
                quantity: item.quantity,
                productCategory: "Jewellery",
                hsnCode: "",
                sku: item.productId,
                taxRate: 0,
                productDiscount: 0,
            })),
            courierId: 0, // 0 = auto-assign best courier
        }

        const fshipResponse = await fetch("https://capi.fship.in/api/createforwardorder", {
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
