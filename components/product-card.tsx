"use client"

import Image from "next/image"
import Link from "next/link"
import { Heart, Plus, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { useCart } from "@/lib/cart-context"
import type { Product } from "@/lib/data"
import { getDiscountedPrice } from "@/lib/dashboard-store"

export function ProductCard({ product }: { product: Product }) {
  const [liked, setLiked] = useState(false)
  const { addItem } = useCart()
  const [discountedPrice, setDiscountedPrice] = useState<number | null>(null)

  useEffect(() => {
    getDiscountedPrice(product).then(setDiscountedPrice).catch(() => {})
  }, [product])

  const isOutOfStock = product.inStock === false || (product.quantity ?? 1) <= 0

  return (
    <Link href={`/product/${product.id}`} className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-primary/20 cursor-pointer">
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-secondary">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className={`object-contain transition-transform duration-500 group-hover:scale-105 ${isOutOfStock ? "opacity-60 grayscale-[30%]" : ""}`}
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          loading="lazy"
        />

        {/* Out of Stock overlay badge */}
        {isOutOfStock && (
          <div className="absolute inset-x-0 bottom-0 flex items-center justify-center bg-gradient-to-t from-black/70 to-transparent pb-3 pt-8">
            <span className="rounded-full bg-red-600 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-white shadow-lg sm:text-xs">
              Out of Stock
            </span>
          </div>
        )}

        {/* Tag */}
        {product.tag && (
          <span className="absolute left-2 top-2 rounded-full bg-primary px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-primary-foreground sm:left-3 sm:top-3 sm:px-2.5 sm:text-[10px]">
            {product.tag}
          </span>
        )}

        {/* Discount badge */}
        {discountedPrice !== null && (
          <span className="absolute right-2 top-2 rounded-full bg-emerald-500 px-2 py-0.5 text-[9px] font-bold uppercase text-white sm:right-3 sm:top-3 sm:px-2.5 sm:text-[10px]">
            Sale
          </span>
        )}

        {/* Heart button */}
        <button
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            setLiked(!liked)
          }}
          className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-card/80 backdrop-blur-sm transition-colors hover:bg-card sm:right-3 sm:top-3 sm:h-8 sm:w-8"
          style={discountedPrice !== null ? { top: "2.25rem" } : {}}
          aria-label={liked ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart
            className={`h-3.5 w-3.5 transition-colors sm:h-4 sm:w-4 ${liked ? "fill-primary text-primary" : "text-muted-foreground"}`}
          />
        </button>
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col gap-1 p-3 sm:gap-2 sm:p-4">
        <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground sm:text-[10px]">
          {product.category}
        </p>
        <div>
          <h3 className="text-xs font-bold leading-snug text-card-foreground group-hover:text-primary transition-colors sm:text-sm line-clamp-2">
            {product.name}
          </h3>
        </div>
        {product.variants && product.variants.length > 0 && (
          <p className="text-[9px] font-semibold text-primary/70 sm:text-[10px]">
            {product.variants.length} variant{product.variants.length !== 1 ? "s" : ""} available
          </p>
        )}
        {discountedPrice !== null ? (
          <div className="flex items-center gap-1.5 sm:gap-2 mt-0.5">
            <p className="text-base font-extrabold text-primary sm:text-lg">{"\u20B9"}{discountedPrice}</p>
            <p className="text-[10px] font-bold text-muted-foreground line-through sm:text-xs">{"\u20B9"}{product.price}</p>
          </div>
        ) : (
          <p className="text-base font-extrabold text-primary sm:text-lg mt-0.5">
            {"\u20B9"}{product.price}
          </p>
        )}
        <div className="mt-auto flex flex-col gap-1.5 pt-1 sm:flex-row sm:items-center sm:gap-2">
          <Button
            size="sm"
            className={`flex-1 rounded-full text-[10px] font-bold shadow-md transition-all sm:text-xs ${
              isOutOfStock
                ? "bg-muted text-muted-foreground cursor-not-allowed opacity-60"
                : "bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-[1.02]"
            }`}
            onClick={(e) => {
              if (!isOutOfStock) {
                e.preventDefault()
                e.stopPropagation()
                addItem(product)
              }
            }}
            disabled={isOutOfStock}
          >
            {isOutOfStock ? (
              <>Sold Out</>
            ) : (
              <>
                <Plus className="mr-1 h-3 w-3" />
                <span className="hidden sm:inline">Quick Add</span>
                <span className="sm:hidden">Add</span>
              </>
            )}
          </Button>
          {!isOutOfStock && (
            <Button
              asChild
              variant="outline"
              size="sm"
              className="hidden rounded-full border-primary/30 text-xs text-secondary-foreground hover:bg-secondary sm:flex"
            >
              <Link href={`/customize?base=${product.id}`}>
                <Sparkles className="mr-1 h-3 w-3" />
                Customize
              </Link>
            </Button>
          )}
        </div>
      </div>
    </Link>
  )
}

export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm animate-pulse">
      <div className="aspect-square bg-muted" />
      <div className="flex flex-1 flex-col gap-2 p-3 sm:p-4">
        <div className="h-3 w-16 rounded bg-muted" />
        <div className="h-4 w-3/4 rounded bg-muted" />
        <div className="mt-1 h-5 w-1/4 rounded bg-muted" />
        <div className="mt-auto flex gap-2 pt-2">
          <div className="h-8 flex-1 rounded-full bg-muted" />
          <div className="hidden h-8 flex-1 rounded-full bg-muted sm:block" />
        </div>
      </div>
    </div>
  )
}
