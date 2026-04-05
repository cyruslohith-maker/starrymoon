import { NextResponse } from "next/server"
import { getSupabase } from "@/lib/supabase"

/**
 * GET /api/fship/csv — Generate Fship-compatible CSV from stored orders
 * Returns a downloadable CSV file
 */
export async function GET() {
    try {
        const { data: orders, error } = await getSupabase()
            .from("orders")
            .select("*")
            .order("created_at", { ascending: false })

        if (error) throw error

        // Fship standard CSV columns
        const headers = [
            "Order ID",
            "Order Date",
            "Customer Name",
            "Mobile",
            "Email",
            "Address Line 1",
            "Address Line 2",
            "City",
            "State",
            "Pincode",
            "Payment Mode",
            "Order Value",
            "COD Amount",
            "Product Name",
            "Product SKU",
            "Product Quantity",
            "Weight (g)",
            "Length (cm)",
            "Breadth (cm)",
            "Height (cm)",
        ]

        const rows = (orders || []).map((order: {
            id: string
            created_at: string
            customer_name: string
            phone: string
            email: string
            address: string
            city: string
            state: string
            pincode: string
            payment_mode: string
            total: number
            items: { productName: string; productId: string; quantity: number }[]
        }) => {
            const orderDate = new Date(order.created_at).toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
            })

            const productNames = order.items.map((i) => i.productName).join(" + ")
            const productSkus = order.items.map((i) => i.productId).join("+")
            const totalQty = order.items.reduce((s, i) => s + i.quantity, 0)
            const codAmount = order.payment_mode === "COD" ? order.total : 0

            return [
                order.id,
                orderDate,
                csvEscape(order.customer_name),
                order.phone,
                order.email,
                csvEscape(order.address),
                "", // Address line 2
                csvEscape(order.city),
                csvEscape(order.state),
                order.pincode,
                order.payment_mode || "Prepaid",
                order.total,
                codAmount,
                csvEscape(productNames),
                productSkus,
                totalQty,
                200, // Default weight 200g — jewelry is light
                15, // Default 15cm
                10, // Default 10cm
                5, // Default 5cm
            ].join(",")
        })

        const csv = [headers.join(","), ...rows].join("\n")

        return new NextResponse(csv, {
            status: 200,
            headers: {
                "Content-Type": "text/csv",
                "Content-Disposition": `attachment; filename="fship-orders-${Date.now()}.csv"`,
            },
        })
    } catch (error) {
        console.error("CSV generation error:", error)
        return NextResponse.json({ error: "Failed to generate CSV" }, { status: 500 })
    }
}

function csvEscape(value: string): string {
    if (!value) return ""
    if (value.includes(",") || value.includes("\n") || value.includes('"')) {
        return `"${value.replace(/"/g, '""')}"`
    }
    return value
}
