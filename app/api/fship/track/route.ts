import { NextRequest, NextResponse } from "next/server"

/**
 * Secure proxy to Fship Track API
 * POST /api/fship/track  { waybill: "AWB_NUMBER" }
 *
 * The API key (signature) never reaches the browser —
 * it stays on the server inside process.env.FSHIP_API_KEY
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
        const { waybill } = body

        if (!waybill || typeof waybill !== "string") {
            return NextResponse.json(
                { error: "Missing or invalid waybill number" },
                { status: 400 }
            )
        }

        const fshipResponse = await fetch("https://capi.fship.in/api/trackorder", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                signature: apiKey,
            },
            body: JSON.stringify({ waybill }),
        })

        const data = await fshipResponse.json()

        return NextResponse.json(data, { status: fshipResponse.status })
    } catch (error) {
        console.error("Fship track error:", error)
        return NextResponse.json(
            { error: "Failed to fetch tracking data" },
            { status: 500 }
        )
    }
}
