"use client"

import Image from "next/image"
import Link from "next/link"
import { X, Plus, Minus, Trash2, Gift, ShoppingBag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { useCart } from "@/lib/cart-context"

const FREE_GIFT_THRESHOLD = 499

export function CartSidebar() {
  const {
    items,
    removeItem,
    updateQuantity,
    subtotal,
    itemCount,
    specialRequest,
    setSpecialRequest,
    isCartOpen,
    closeCart,
  } = useCart()

  if (!isCartOpen) return null

  const giftProgress = Math.min((subtotal / FREE_GIFT_THRESHOLD) * 100, 100)
  const giftUnlocked = subtotal >= FREE_GIFT_THRESHOLD

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-50 bg-foreground/20 backdrop-blur-sm"
        onClick={closeCart}
        aria-hidden="true"
      />

      {/* Sidebar */}
      <aside className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col border-l border-border bg-card shadow-2xl shadow-primary/10">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-primary" />
            <h2 className="font-serif text-lg font-bold text-card-foreground">
              Your Cart ({itemCount})
            </h2>
          </div>
          <Button variant="ghost" size="icon" onClick={closeCart} aria-label="Close cart">
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 px-5 py-16 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary">
                <ShoppingBag className="h-7 w-7 text-primary" />
              </div>
              <p className="text-sm font-semibold text-card-foreground">Your cart is empty</p>
              <p className="text-xs text-muted-foreground">
                Browse our collection and add some sparkle!
              </p>
              <Button
                asChild
                className="mt-2 rounded-full bg-primary px-6 text-primary-foreground hover:bg-primary/90"
              >
                <Link href="/shop" onClick={closeCart}>
                  Start Shopping
                </Link>
              </Button>
            </div>
          ) : (
            <div className="px-5 py-4">
              {/* Free gift progress */}
              <div className="mb-5 rounded-xl border border-border bg-secondary/50 p-3">
                <div className="mb-2 flex items-center gap-2">
                  <Gift className={`h-4 w-4 ${giftUnlocked ? "text-primary" : "text-muted-foreground"}`} />
                  <span className="text-xs font-bold text-card-foreground">
                    {giftUnlocked
                      ? "You unlocked a free gift!"
                      : `Add \u20B9${FREE_GIFT_THRESHOLD - subtotal} more for a free gift`}
                  </span>
                </div>
                <Progress value={giftProgress} className="h-2 bg-muted" />
              </div>

              {/* Items */}
              <ul className="flex flex-col gap-4">
                {items.map((item) => (
                  <li
                    key={item.product.id}
                    className="flex gap-3 rounded-xl border border-border bg-background p-3"
                  >
                    <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-secondary">
                      <Image
                        src={item.product.image}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex flex-1 flex-col justify-between">
                      <div>
                        <h3 className="text-sm font-bold text-card-foreground">
                          {item.product.name}
                        </h3>
                        <p className="text-[10px] text-muted-foreground">
                          Size: {item.size || "7cm"}
                          {item.customizationNote && (
                            <> &middot; Custom: {item.customizationNote}</>
                          )}
                        </p>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                            className="flex h-6 w-6 items-center justify-center rounded-full border border-border text-muted-foreground hover:bg-secondary"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="min-w-[20px] text-center text-xs font-bold text-card-foreground">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                            className="flex h-6 w-6 items-center justify-center rounded-full border border-border text-muted-foreground hover:bg-secondary"
                            aria-label="Increase quantity"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-foreground">
                            {"\u20B9"}{item.product.price * item.quantity}
                          </span>
                          <button
                            onClick={() => removeItem(item.product.id)}
                            className="text-muted-foreground hover:text-destructive"
                            aria-label="Remove item"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>

              {/* Special Requests */}
              <div className="mt-5">
                <label
                  htmlFor="special-request"
                  className="mb-1.5 block text-xs font-bold text-card-foreground"
                >
                  Special Requests{" "}
                  <span className="font-normal text-muted-foreground">(50 words max)</span>
                </label>
                <Textarea
                  id="special-request"
                  placeholder="Any special packaging, notes, or requests..."
                  value={specialRequest}
                  onChange={(e) => {
                    const words = e.target.value.split(/\s+/).filter(Boolean)
                    if (words.length <= 50) setSpecialRequest(e.target.value)
                  }}
                  className="resize-none rounded-xl border-border bg-background text-xs"
                  rows={3}
                />
                <p className="mt-1 text-right text-[10px] text-muted-foreground">
                  {specialRequest.split(/\s+/).filter(Boolean).length}/50 words
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-border px-5 py-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-semibold text-muted-foreground">Subtotal</span>
              <span className="text-lg font-bold text-foreground">{"\u20B9"}{subtotal}</span>
            </div>
            <Button
              asChild
              className="w-full rounded-full bg-primary py-5 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/30 hover:bg-primary/90"
            >
              <Link href="/checkout" onClick={closeCart}>
                Proceed to Checkout
              </Link>
            </Button>
            <p className="mt-2 text-center text-[10px] text-muted-foreground">
              Shipping calculated at checkout
            </p>
          </div>
        )}
      </aside>
    </>
  )
}
