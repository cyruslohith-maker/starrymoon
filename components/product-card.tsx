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

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/10">
      {/* Image */}
      <Link href={`/product/${product.id}`} className="relative aspect-square overflow-hidden bg-secondary">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          loading="lazy"
        />

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
      </Link>

      {/* Info */}
      <div className="flex flex-1 flex-col gap-1 p-3 sm:gap-2 sm:p-4">
        <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground sm:text-[10px]">
          {product.category}
        </p>
        <Link href={`/product/${product.id}`}>
          <h3 className="text-xs font-bold leading-snug text-card-foreground hover:text-primary transition-colors sm:text-sm line-clamp-2">
            {product.name}
          </h3>
        </Link>
        {discountedPrice !== null ? (
          <div className="flex items-center gap-1.5 sm:gap-2">
            <p className="text-sm font-bold text-foreground sm:text-lg">{"\u20B9"}{discountedPrice}</p>
            <p className="text-[10px] text-muted-foreground line-through sm:text-sm">{"\u20B9"}{product.price}</p>
          </div>
        ) : (
          <p className="text-sm font-bold text-foreground sm:text-lg">
            {"\u20B9"}{product.price}
          </p>
        )}
        <div className="mt-auto flex flex-col gap-1.5 pt-1 sm:flex-row sm:items-center sm:gap-2">
          <Button
            size="sm"
            className="flex-1 rounded-full bg-primary text-[10px] text-primary-foreground hover:bg-primary/90 sm:text-xs"
            onClick={() => addItem(product)}
          >
            <Plus className="mr-1 h-3 w-3" />
            <span className="hidden sm:inline">Quick Add</span>
            <span className="sm:hidden">Add</span>
          </Button>
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
        </div>
      </div>
    </article>
  )
}
