"use client"

import Image from "next/image"
import Link from "next/link"
import { Heart, Plus, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { useCart } from "@/lib/cart-context"
import type { Product } from "@/lib/data"

export function ProductCard({ product }: { product: Product }) {
  const [liked, setLiked] = useState(false)
  const { addItem } = useCart()

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/10">
      {/* Image */}
      <Link href={`/product/${product.id}`} className="relative aspect-square overflow-hidden bg-secondary">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        />

        {/* Tag */}
        {product.tag && (
          <span className="absolute left-3 top-3 rounded-full bg-primary px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary-foreground">
            {product.tag}
          </span>
        )}

        {/* Heart button */}
        <button
          onClick={(e) => {
            e.preventDefault()
            setLiked(!liked)
          }}
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-card/80 backdrop-blur-sm transition-colors hover:bg-card"
          aria-label={liked ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart
            className={`h-4 w-4 transition-colors ${liked ? "fill-primary text-primary" : "text-muted-foreground"}`}
          />
        </button>
      </Link>

      {/* Info */}
      <div className="flex flex-1 flex-col gap-2 p-4">
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          {product.category}
        </p>
        <Link href={`/product/${product.id}`}>
          <h3 className="text-sm font-bold leading-snug text-card-foreground hover:text-primary transition-colors">
            {product.name}
          </h3>
        </Link>
        <p className="text-lg font-bold text-foreground">
          {"\u20B9"}{product.price}
        </p>
        <div className="mt-auto flex items-center gap-2 pt-1">
          <Button
            size="sm"
            className="flex-1 rounded-full bg-primary text-xs text-primary-foreground hover:bg-primary/90"
            onClick={() => addItem(product)}
          >
            <Plus className="mr-1 h-3 w-3" />
            Quick Add
          </Button>
          <Button
            asChild
            variant="outline"
            size="sm"
            className="rounded-full border-primary/30 text-xs text-secondary-foreground hover:bg-secondary"
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
