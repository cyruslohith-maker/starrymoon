"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { PageLayout } from "@/components/page-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useCart } from "@/lib/cart-context"
import {
  Check,
  ArrowLeft,
  ArrowRight,
  Instagram,
  ShoppingBag,
  User,
  MapPin,
  CreditCard,
  PartyPopper,
} from "lucide-react"

const steps = [
  { id: 1, label: "Contact", icon: User },
  { id: 2, label: "Shipping", icon: MapPin },
  { id: 3, label: "Payment", icon: CreditCard },
]

export default function CheckoutPage() {
  const { items, subtotal, specialRequest, clearCart } = useCart()
  const [currentStep, setCurrentStep] = useState(1)
  const [orderPlaced, setOrderPlaced] = useState(false)
  const [orderId, setOrderId] = useState("")
  const [isPlacing, setIsPlacing] = useState(false)
  const [placeError, setPlaceError] = useState("")

  // Form state
  const [contact, setContact] = useState({ name: "", email: "", phone: "", whatsapp: "" })
  const [shipping, setShipping] = useState({ address: "", city: "", state: "", pincode: "" })

  const shippingCost = subtotal >= 499 ? 0 : 49
  const total = subtotal + shippingCost

  const handlePlaceOrder = async () => {
    setIsPlacing(true)
    setPlaceError("")
    try {
      const orderPayload = {
        customerName: contact.name,
        email: contact.email,
        phone: contact.phone,
        whatsapp: contact.whatsapp,
        address: shipping.address,
        city: shipping.city,
        state: shipping.state,
        pincode: shipping.pincode,
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

  if (orderPlaced) {
    return (
      <PageLayout>
        <div className="mx-auto flex max-w-lg flex-col items-center px-4 py-16 text-center lg:py-24">
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-secondary">
            <PartyPopper className="h-10 w-10 text-primary" />
          </div>
          <h1 className="mb-3 font-serif text-3xl font-bold text-foreground">
            Order Placed!
          </h1>
          {orderId && (
            <p className="mb-2 text-xs font-bold text-primary">Order ID: {orderId}</p>
          )}
          <p className="mb-6 text-sm leading-relaxed text-muted-foreground">
            Thank you for shopping with St4rrymoon! We will send you order updates via WhatsApp.
            Your handmade piece will be crafted with extra love and care.
          </p>

          {/* Instagram follow CTA */}
          <div className="mb-8 w-full rounded-2xl border border-border bg-card p-6">
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/WhatsApp%20Image%202026-02-19%20at%2023.36.26-Jkj1I7ITjh7uOGKjJCDhTd8QVJqUpD.jpeg"
              alt="Scan to follow @st4rrymoon on Instagram"
              width={200}
              height={240}
              className="mx-auto mb-4 rounded-xl"
              style={{ width: "200px", height: "auto" }}
            />
            <p className="mb-3 text-sm font-bold text-card-foreground">
              Follow us for order updates, new drops, and giveaways!
            </p>
            <Button
              asChild
              className="rounded-full bg-primary text-sm text-primary-foreground hover:bg-primary/90"
            >
              <a href="https://www.instagram.com/st4rrymoon/" target="_blank" rel="noopener noreferrer">
                <Instagram className="mr-2 h-4 w-4" />
                Follow @st4rrymoon
              </a>
            </Button>
          </div>

          <Button asChild variant="outline" className="rounded-full border-primary/30 text-secondary-foreground hover:bg-secondary">
            <Link href="/shop">
              Continue Shopping
            </Link>
          </Button>
        </div>
      </PageLayout>
    )
  }

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

  return (
    <PageLayout>
      <div className="mx-auto max-w-5xl px-4 py-8 lg:px-8 lg:py-12">
        <h1 className="mb-8 text-center font-serif text-3xl font-bold text-foreground">
          Checkout
        </h1>

        {/* Steps indicator */}
        <div className="mb-10 flex items-center justify-center gap-2">
          {steps.map((step, i) => (
            <div key={step.id} className="flex items-center gap-2">
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold transition-colors ${currentStep > step.id
                  ? "bg-primary text-primary-foreground"
                  : currentStep === step.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground"
                  }`}
              >
                {currentStep > step.id ? <Check className="h-4 w-4" /> : step.id}
              </div>
              <span
                className={`hidden text-xs font-semibold sm:block ${currentStep >= step.id ? "text-foreground" : "text-muted-foreground"
                  }`}
              >
                {step.label}
              </span>
              {i < steps.length - 1 && (
                <div
                  className={`mx-2 h-px w-8 sm:w-12 ${currentStep > step.id ? "bg-primary" : "bg-border"
                    }`}
                />
              )}
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Form area */}
          <div className="flex-1 rounded-2xl border border-border bg-card p-6">
            {/* Step 1: Contact */}
            {currentStep === 1 && (
              <div>
                <h2 className="mb-4 text-lg font-bold text-card-foreground">Contact Information</h2>
                <div className="flex flex-col gap-4">
                  <div>
                    <Label htmlFor="name" className="text-xs font-bold text-muted-foreground">Full Name</Label>
                    <Input id="name" value={contact.name} onChange={(e) => setContact({ ...contact, name: e.target.value })} placeholder="Your full name" className="mt-1 rounded-xl border-border" />
                  </div>
                  <div>
                    <Label htmlFor="email" className="text-xs font-bold text-muted-foreground">Email</Label>
                    <Input id="email" type="email" value={contact.email} onChange={(e) => setContact({ ...contact, email: e.target.value })} placeholder="you@example.com" className="mt-1 rounded-xl border-border" />
                  </div>
                  <div>
                    <Label htmlFor="phone" className="text-xs font-bold text-muted-foreground">Phone Number</Label>
                    <Input id="phone" type="tel" value={contact.phone} onChange={(e) => setContact({ ...contact, phone: e.target.value })} placeholder="+91 XXXXX XXXXX" className="mt-1 rounded-xl border-border" />
                  </div>
                  <div>
                    <Label htmlFor="whatsapp" className="text-xs font-bold text-muted-foreground">WhatsApp Number (for order updates)</Label>
                    <Input id="whatsapp" type="tel" value={contact.whatsapp} onChange={(e) => setContact({ ...contact, whatsapp: e.target.value })} placeholder="+91 XXXXX XXXXX" className="mt-1 rounded-xl border-border" />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Shipping */}
            {currentStep === 2 && (
              <div>
                <h2 className="mb-4 text-lg font-bold text-card-foreground">Shipping Address</h2>
                <div className="flex flex-col gap-4">
                  <div>
                    <Label htmlFor="address" className="text-xs font-bold text-muted-foreground">Full Address</Label>
                    <Input id="address" value={shipping.address} onChange={(e) => setShipping({ ...shipping, address: e.target.value })} placeholder="House/Apt No, Street, Locality" className="mt-1 rounded-xl border-border" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="city" className="text-xs font-bold text-muted-foreground">City</Label>
                      <Input id="city" value={shipping.city} onChange={(e) => setShipping({ ...shipping, city: e.target.value })} className="mt-1 rounded-xl border-border" />
                    </div>
                    <div>
                      <Label htmlFor="state" className="text-xs font-bold text-muted-foreground">State</Label>
                      <Input id="state" value={shipping.state} onChange={(e) => setShipping({ ...shipping, state: e.target.value })} className="mt-1 rounded-xl border-border" />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="pincode" className="text-xs font-bold text-muted-foreground">Pincode</Label>
                    <Input id="pincode" value={shipping.pincode} onChange={(e) => setShipping({ ...shipping, pincode: e.target.value })} placeholder="XXXXXX" className="mt-1 rounded-xl border-border" />
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Payment */}
            {currentStep === 3 && (
              <div>
                <h2 className="mb-4 text-lg font-bold text-card-foreground">Payment</h2>
                <div className="flex flex-col gap-4">
                  <div className="rounded-xl border border-primary/30 bg-secondary/50 p-4">
                    <p className="text-sm font-bold text-card-foreground">Cash on Delivery</p>
                    <p className="text-xs text-muted-foreground">Pay when you receive your order. No advance payment needed.</p>
                  </div>
                  <div className="rounded-xl border border-border bg-secondary/30 p-4">
                    <p className="text-sm font-bold text-card-foreground">UPI / Online Payment</p>
                    <p className="text-xs text-muted-foreground">
                      After placing the order, you will receive payment details via WhatsApp.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation buttons */}
            <div className="mt-6 flex items-center justify-between">
              {currentStep > 1 ? (
                <Button
                  variant="outline"
                  className="rounded-full border-primary/30 text-sm text-secondary-foreground hover:bg-secondary"
                  onClick={() => setCurrentStep(currentStep - 1)}
                >
                  <ArrowLeft className="mr-1 h-4 w-4" />
                  Back
                </Button>
              ) : (
                <Button asChild variant="outline" className="rounded-full border-primary/30 text-sm text-secondary-foreground hover:bg-secondary">
                  <Link href="/shop">
                    <ArrowLeft className="mr-1 h-4 w-4" />
                    Back to Shop
                  </Link>
                </Button>
              )}

              {currentStep < 3 ? (
                <Button
                  className="rounded-full bg-primary text-sm text-primary-foreground hover:bg-primary/90"
                  onClick={() => setCurrentStep(currentStep + 1)}
                >
                  Next
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              ) : (
                <>
                  <Button
                    className="rounded-full bg-primary text-sm font-bold text-primary-foreground shadow-lg shadow-primary/30 hover:bg-primary/90"
                    onClick={handlePlaceOrder}
                    disabled={isPlacing}
                  >
                    {isPlacing ? "Placing Order..." : "Place Order"}
                  </Button>
                  {placeError && (
                    <p className="mt-2 text-xs font-semibold text-destructive">{placeError}</p>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Order summary sidebar */}
          <div className="w-full lg:w-80">
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
                      {"\u20B9"}{item.product.price * item.quantity}
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
                  <span>{"\u20B9"}{subtotal}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Shipping</span>
                  <span>{shippingCost === 0 ? "FREE" : `\u20B9${shippingCost}`}</span>
                </div>
                <div className="flex justify-between border-t border-border pt-2 text-sm font-bold text-foreground">
                  <span>Total</span>
                  <span>{"\u20B9"}{total}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  )
}
