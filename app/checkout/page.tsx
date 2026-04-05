"use client"

import { useState, useEffect, useCallback } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { PageLayout } from "@/components/page-layout"
import { Button } from "@/components/ui/button"
import { useCart } from "@/lib/cart-context"
import { useAuth } from "@/lib/auth-context"
import {
    Check,
    ArrowLeft,
    ArrowRight,
    Instagram,
    ShoppingBag,
    MapPin,
    CreditCard,
    PartyPopper,
    Loader2,
    AlertCircle,
} from "lucide-react"

/* ─── Pincode → City/State auto-detect ────────────── */

async function lookupPincode(pin: string): Promise<{ city: string; state: string } | null> {
    try {
        const res = await fetch(`https://api.postalpincode.in/pincode/${pin}`)
        const data = await res.json()
        if (data?.[0]?.Status === "Success" && data[0].PostOffice?.length > 0) {
            const po = data[0].PostOffice[0]
            return { city: po.District || po.Division, state: po.State }
        }
    } catch { /* ignore */ }
    return null
}

/* ─── Component ───────────────────────────────────── */

export default function CheckoutPage() {
    const { items, subtotal, specialRequest, clearCart } = useCart()
    const { user } = useAuth()
    const router = useRouter()

    const [orderPlaced, setOrderPlaced] = useState(false)
    const [orderId, setOrderId] = useState("")
    const [isPlacing, setIsPlacing] = useState(false)
    const [placeError, setPlaceError] = useState("")
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

    // ─── Form fields ───
    const [name, setName] = useState("")
    const [phone, setPhone] = useState("")
    const [gender, setGender] = useState("")
    const [age, setAge] = useState("")

    const [houseNo, setHouseNo] = useState("")
    const [floor, setFloor] = useState("")
    const [addressLine1, setAddressLine1] = useState("")
    const [addressLine2, setAddressLine2] = useState("")
    const [pincode, setPincode] = useState("")
    const [city, setCity] = useState("")
    const [state, setState] = useState("")
    const [pincodeLoading, setPincodeLoading] = useState(false)
    const [pincodeError, setPincodeError] = useState("")

    const shippingCost = subtotal >= 499 ? 0 : 49
    const total = subtotal + shippingCost

    // Redirect to login if not signed in
    useEffect(() => {
        if (user === null) {
            const t = setTimeout(() => {
                if (!user) router.push("/login?redirect=checkout")
            }, 1500)
            return () => clearTimeout(t)
        }
    }, [user, router])

    // Pre-fill from user profile
    useEffect(() => {
        if (user) {
            setName(user.name || "")
            setPhone(user.phone?.replace("+91", "").replace(/\s/g, "") || "")
        }
    }, [user])

    // Auto-detect city/state from pincode
    const handlePincodeChange = useCallback(async (val: string) => {
        const clean = val.replace(/\D/g, "").slice(0, 6)
        setPincode(clean)
        setPincodeError("")
        setCity("")
        setState("")

        if (clean.length === 6) {
            setPincodeLoading(true)
            const result = await lookupPincode(clean)
            setPincodeLoading(false)
            if (result) {
                setCity(result.city)
                setState(result.state)
            } else {
                setPincodeError("Could not find this pincode. Please enter city/state manually.")
            }
        }
    }, [])

    // Validation
    const validate = (): boolean => {
        const errs: Record<string, string> = {}
        if (!name.trim()) errs.name = "Name is required"
        if (!phone.trim() || phone.replace(/\D/g, "").length !== 10) errs.phone = "Enter a valid 10-digit number"
        if (!gender) errs.gender = "Please select gender"
        if (!houseNo.trim()) errs.houseNo = "House/Building number is required"
        if (!addressLine1.trim()) errs.addressLine1 = "Address line 1 is required"
        if (!pincode || pincode.length !== 6) errs.pincode = "Enter a valid 6-digit pincode"
        if (!city.trim()) errs.city = "City is required"
        if (!state.trim()) errs.state = "State is required"
        setValidationErrors(errs)
        return Object.keys(errs).length === 0
    }

    const handlePlaceOrder = async () => {
        if (!validate()) return
        setIsPlacing(true)
        setPlaceError("")

        const fullAddress = [houseNo, floor ? `Floor ${floor}` : "", addressLine1, addressLine2]
            .filter(Boolean).join(", ")

        try {
            const orderPayload = {
                customerName: name,
                email: user?.email || "",
                phone: `+91${phone.replace(/\D/g, "")}`,
                whatsapp: `+91${phone.replace(/\D/g, "")}`,
                address: fullAddress,
                city,
                state,
                pincode,
                gender,
                age: age || undefined,
                items: items.map((i) => ({
                    productId: i.product.id,
                    productName: i.product.name,
                    quantity: i.quantity,
                    price: i.product.price,
                    size: i.size,
                })),
                subtotal,
                shippingCost,
                total,
                specialRequest,
                paymentMode: "Prepaid",
            }

            const res = await fetch("/api/orders", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(orderPayload),
            })

            const data = await res.json()
            if (res.ok && data.order) {
                setOrderId(data.order.id)
                setOrderPlaced(true)
                clearCart()
            } else {
                setPlaceError(data.error || "Failed to place order. Please try again.")
            }
        } catch {
            setPlaceError("Network error. Please check your connection and try again.")
        } finally {
            setIsPlacing(false)
        }
    }

    /* ─── Order Placed Screen ─── */
    if (orderPlaced) {
        return (
            <PageLayout>
                <div className="mx-auto flex max-w-lg flex-col items-center px-4 py-16 text-center lg:py-24">
                    <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-secondary">
                        <PartyPopper className="h-10 w-10 text-primary" />
                    </div>
                    <h1 className="mb-3 font-serif text-3xl font-bold text-foreground">Order Placed!</h1>
                    {orderId && <p className="mb-2 text-xs font-bold text-primary">Order ID: {orderId}</p>}
                    <p className="mb-6 text-sm leading-relaxed text-muted-foreground">
                        Thank you for shopping with Starrymoon! We will send you order updates via WhatsApp.
                        Your handmade piece will be crafted with extra love and care.
                    </p>
                    <div className="mb-8 w-full rounded-2xl border border-border bg-card p-6">
                        <Image
                            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/WhatsApp%20Image%202026-02-19%20at%2023.36.26-Jkj1I7ITjh7uOGKjJCDhTd8QVJqUpD.jpeg"
                            alt="Scan to follow @starrymoon.in on Instagram"
                            width={200}
                            height={240}
                            className="mx-auto mb-4 rounded-xl"
                            style={{ width: "200px", height: "auto" }}
                        />
                        <p className="mb-3 text-sm font-bold text-card-foreground">
                            Follow us for order updates, new drops, and giveaways!
                        </p>
                        <Button asChild className="rounded-full bg-primary text-sm text-primary-foreground hover:bg-primary/90">
                            <a href="https://www.instagram.com/starrymoon.in/" target="_blank" rel="noopener noreferrer">
                                <Instagram className="mr-2 h-4 w-4" />
                                Follow @starrymoon.in
                            </a>
                        </Button>
                    </div>
                    <Button asChild variant="outline" className="rounded-full border-primary/30 text-secondary-foreground hover:bg-secondary">
                        <Link href="/shop">Continue Shopping</Link>
                    </Button>
                </div>
            </PageLayout>
        )
    }

    /* ─── Empty Cart ─── */
    if (items.length === 0) {
        return (
            <PageLayout>
                <div className="flex flex-col items-center justify-center gap-4 py-32 text-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary">
                        <ShoppingBag className="h-7 w-7 text-primary" />
                    </div>
                    <p className="text-lg font-bold text-foreground">Your cart is empty</p>
                    <Button asChild className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90">
                        <Link href="/shop">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Start Shopping
                        </Link>
                    </Button>
                </div>
            </PageLayout>
        )
    }

    /* ─── Loading auth ─── */
    if (!user) {
        return (
            <PageLayout>
                <div className="flex min-h-[60vh] items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
            </PageLayout>
        )
    }

    /* ─── Helper: field wrapper ─── */
    const Field = ({ id, label, required, error, children }: {
        id: string; label: string; required?: boolean; error?: string
        children: React.ReactNode
    }) => (
        <div>
            <label htmlFor={id} className="mb-1 block text-xs font-bold text-muted-foreground">
                {label} {required && <span className="text-destructive">*</span>}
            </label>
            {children}
            {error && (
                <p className="mt-0.5 flex items-center gap-1 text-[10px] font-semibold text-destructive">
                    <AlertCircle className="h-3 w-3" /> {error}
                </p>
            )}
        </div>
    )

    const inputCls = "w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none transition-colors focus:border-primary"
    const errCls = "border-destructive"

    return (
        <PageLayout>
            <div className="mx-auto max-w-5xl px-4 py-8 lg:px-8 lg:py-12">
                <h1 className="mb-2 text-center font-serif text-3xl font-bold text-foreground">Checkout</h1>
                <p className="mb-8 text-center text-xs text-muted-foreground">
                    Shipping across India 🇮🇳 • Free shipping on orders ₹499+
                </p>

                <div className="flex flex-col gap-8 lg:flex-row">
                    {/* ─── Form ─── */}
                    <div className="flex-1 space-y-6">

                        {/* Personal Details */}
                        <div className="rounded-2xl border border-border bg-card p-6">
                            <h2 className="mb-4 flex items-center gap-2 text-base font-bold text-card-foreground">
                                <MapPin className="h-4 w-4 text-primary" />
                                Personal Details
                            </h2>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <Field id="co-name" label="Full Name" required error={validationErrors.name}>
                                    <input
                                        id="co-name"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Your full name"
                                        className={`${inputCls} ${validationErrors.name ? errCls : ""}`}
                                    />
                                </Field>

                                <Field id="co-phone" label="Phone Number" required error={validationErrors.phone}>
                                    <div className="flex">
                                        <span className="flex items-center rounded-l-xl border border-r-0 border-border bg-muted px-3 text-sm font-semibold text-muted-foreground">
                                            +91
                                        </span>
                                        <input
                                            id="co-phone"
                                            type="tel"
                                            maxLength={10}
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                                            placeholder="XXXXX XXXXX"
                                            className={`flex-1 rounded-r-xl border border-border bg-background px-4 py-3 text-sm outline-none transition-colors focus:border-primary ${validationErrors.phone ? errCls : ""}`}
                                        />
                                    </div>
                                </Field>

                                <Field id="co-gender" label="Gender" required error={validationErrors.gender}>
                                    <select
                                        id="co-gender"
                                        value={gender}
                                        onChange={(e) => setGender(e.target.value)}
                                        className={`${inputCls} ${validationErrors.gender ? errCls : ""} ${!gender ? "text-muted-foreground" : ""}`}
                                    >
                                        <option value="">Select gender</option>
                                        <option value="female">Female</option>
                                        <option value="male">Male</option>
                                        <option value="non-binary">Non-binary</option>
                                        <option value="prefer-not">Prefer not to say</option>
                                    </select>
                                </Field>

                                <Field id="co-age" label="Age (optional)">
                                    <input
                                        id="co-age"
                                        type="number"
                                        min={1}
                                        max={120}
                                        value={age}
                                        onChange={(e) => setAge(e.target.value)}
                                        placeholder="Optional"
                                        className={inputCls}
                                    />
                                </Field>
                            </div>
                        </div>

                        {/* Shipping Address */}
                        <div className="rounded-2xl border border-border bg-card p-6">
                            <h2 className="mb-4 flex items-center gap-2 text-base font-bold text-card-foreground">
                                <CreditCard className="h-4 w-4 text-primary" />
                                Shipping Address
                            </h2>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <Field id="co-house" label="House No. / Building No." required error={validationErrors.houseNo}>
                                    <input
                                        id="co-house"
                                        value={houseNo}
                                        onChange={(e) => setHouseNo(e.target.value)}
                                        placeholder="e.g. 42-B, Sky Villa"
                                        className={`${inputCls} ${validationErrors.houseNo ? errCls : ""}`}
                                    />
                                </Field>

                                <Field id="co-floor" label="Floor Number">
                                    <input
                                        id="co-floor"
                                        value={floor}
                                        onChange={(e) => setFloor(e.target.value)}
                                        placeholder="e.g. 3rd Floor"
                                        className={inputCls}
                                    />
                                </Field>

                                <div className="sm:col-span-2">
                                    <Field id="co-addr1" label="Address Line 1" required error={validationErrors.addressLine1}>
                                        <input
                                            id="co-addr1"
                                            value={addressLine1}
                                            onChange={(e) => setAddressLine1(e.target.value)}
                                            placeholder="Street, Locality, Area"
                                            className={`${inputCls} ${validationErrors.addressLine1 ? errCls : ""}`}
                                        />
                                    </Field>
                                </div>

                                <div className="sm:col-span-2">
                                    <Field id="co-addr2" label="Address Line 2">
                                        <input
                                            id="co-addr2"
                                            value={addressLine2}
                                            onChange={(e) => setAddressLine2(e.target.value)}
                                            placeholder="Landmark, Near, Opposite (optional)"
                                            className={inputCls}
                                        />
                                    </Field>
                                </div>

                                <Field id="co-pincode" label="Pincode" required error={validationErrors.pincode || pincodeError}>
                                    <div className="relative">
                                        <input
                                            id="co-pincode"
                                            type="text"
                                            maxLength={6}
                                            value={pincode}
                                            onChange={(e) => handlePincodeChange(e.target.value)}
                                            placeholder="6-digit pincode"
                                            className={`${inputCls} ${validationErrors.pincode || pincodeError ? errCls : ""}`}
                                        />
                                        {pincodeLoading && (
                                            <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-primary" />
                                        )}
                                    </div>
                                </Field>

                                <div className="grid grid-cols-2 gap-4">
                                    <Field id="co-city" label="City" required error={validationErrors.city}>
                                        <input
                                            id="co-city"
                                            value={city}
                                            onChange={(e) => setCity(e.target.value)}
                                            placeholder="Auto-detected"
                                            readOnly={!!city && !pincodeError}
                                            className={`${inputCls} ${city && !pincodeError ? "bg-muted" : ""} ${validationErrors.city ? errCls : ""}`}
                                        />
                                    </Field>

                                    <Field id="co-state" label="State" required error={validationErrors.state}>
                                        <input
                                            id="co-state"
                                            value={state}
                                            onChange={(e) => setState(e.target.value)}
                                            placeholder="Auto-detected"
                                            readOnly={!!state && !pincodeError}
                                            className={`${inputCls} ${state && !pincodeError ? "bg-muted" : ""} ${validationErrors.state ? errCls : ""}`}
                                        />
                                    </Field>
                                </div>
                            </div>

                            {city && state && (
                                <div className="mt-3 flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700">
                                    <Check className="h-3.5 w-3.5" />
                                    {city}, {state} — Delivery available ✓
                                </div>
                            )}
                        </div>

                        {/* Payment */}
                        <div className="rounded-2xl border border-border bg-card p-6">
                            <h2 className="mb-4 text-base font-bold text-card-foreground">Payment</h2>
                            <div className="flex flex-col gap-3">
                                <div className="rounded-xl border border-primary/30 bg-secondary/50 p-4">
                                    <p className="text-sm font-bold text-card-foreground">Cash on Delivery</p>
                                    <p className="text-xs text-muted-foreground">Pay when you receive your order.</p>
                                </div>
                                <div className="rounded-xl border border-border bg-secondary/30 p-4">
                                    <p className="text-sm font-bold text-card-foreground">UPI / Online Payment</p>
                                    <p className="text-xs text-muted-foreground">
                                        After placing the order, you will receive payment details via WhatsApp.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-between">
                            <Button asChild variant="outline" className="rounded-full border-primary/30 text-sm text-secondary-foreground hover:bg-secondary">
                                <Link href="/shop">
                                    <ArrowLeft className="mr-1 h-4 w-4" />
                                    Back to Shop
                                </Link>
                            </Button>

                            <div className="text-right">
                                <Button
                                    className="rounded-full bg-primary px-8 py-5 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/30 hover:bg-primary/90"
                                    onClick={handlePlaceOrder}
                                    disabled={isPlacing}
                                >
                                    {isPlacing ? (
                                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Placing Order...</>
                                    ) : (
                                        <>Place Order — ₹{total} <ArrowRight className="ml-2 h-4 w-4" /></>
                                    )}
                                </Button>
                                {placeError && (
                                    <p className="mt-2 text-xs font-semibold text-destructive">{placeError}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* ─── Order Summary ─── */}
                    <div className="w-full lg:sticky lg:top-24 lg:w-80 lg:self-start">
                        <div className="rounded-2xl border border-border bg-card p-5">
                            <h3 className="mb-4 text-sm font-bold text-card-foreground">Order Summary</h3>
                            <ul className="mb-4 flex flex-col gap-3">
                                {items.map((item) => (
                                    <li key={item.product.id} className="flex items-center gap-3">
                                        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-secondary">
                                            <Image src={item.product.image} alt={item.product.name} fill className="object-cover" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-xs font-bold text-card-foreground">{item.product.name}</p>
                                            <p className="text-[10px] text-muted-foreground">
                                                Qty: {item.quantity} | Size: {item.size}
                                            </p>
                                        </div>
                                        <span className="text-xs font-bold text-foreground">
                                            ₹{item.product.price * item.quantity}
                                        </span>
                                    </li>
                                ))}
                            </ul>

                            {specialRequest && (
                                <div className="mb-4 rounded-lg bg-secondary/50 p-3">
                                    <p className="text-[10px] font-bold text-muted-foreground">Special Request:</p>
                                    <p className="text-xs text-card-foreground">{specialRequest}</p>
                                </div>
                            )}

                            <div className="flex flex-col gap-1.5 border-t border-border pt-3 text-xs">
                                <div className="flex justify-between text-muted-foreground">
                                    <span>Subtotal</span>
                                    <span>₹{subtotal}</span>
                                </div>
                                <div className="flex justify-between text-muted-foreground">
                                    <span>Shipping</span>
                                    <span>{shippingCost === 0 ? "FREE" : `₹${shippingCost}`}</span>
                                </div>
                                <div className="flex justify-between border-t border-border pt-2 text-sm font-bold text-foreground">
                                    <span>Total</span>
                                    <span>₹{total}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </PageLayout>
    )
}
