"use client"

import { useState } from "react"
import Link from "next/link"
import { ProductCard } from "@/components/product-card"
import { Button } from "@/components/ui/button"
import { products, categories } from "@/lib/data"
import { ArrowRight } from "lucide-react"

export function ProductsSection() {
  const [active, setActive] = useState<string>("All")

  const filtered =
    active === "All" ? products.slice(0, 8) : products.filter((p) => p.category === active).slice(0, 8)

  return (
    <section id="shop" className="bg-container-soft relative rounded-2xl mx-2 px-3 py-10 sm:rounded-3xl sm:mx-4 sm:px-4 sm:py-16 lg:mx-8 lg:px-8 lg:py-24">
      {/* Section header */}
      <div className="mb-6 text-center sm:mb-10">
        <p className="mb-2 text-xs font-bold uppercase tracking-widest text-primary">
          Our Collection
        </p>
        <h2 className="font-serif text-2xl font-bold text-foreground sm:text-3xl md:text-4xl">
          Handmade for you
        </h2>
      </div>

      {/* Category filters — horizontally scrollable on mobile */}
      <div className="mb-6 overflow-x-auto scrollbar-none sm:mb-8">
        <div className="flex items-center gap-2 justify-start sm:justify-center sm:flex-wrap">
          {categories.map((cat) => (
            <Button
              key={cat}
              variant={active === cat ? "default" : "outline"}
              size="sm"
              className={`shrink-0 rounded-full text-xs ${active === cat
                  ? "bg-primary text-primary-foreground hover:bg-primary/90"
                  : "border-border bg-card text-muted-foreground hover:bg-secondary hover:text-secondary-foreground"
                }`}
              onClick={() => setActive(cat)}
            >
              {cat}
            </Button>
          ))}
        </div>
      </div>

      {/* Grid — 2 cols on mobile */}
      <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
        {filtered.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {/* View all link */}
      <div className="mt-10 text-center">
        <Button
          asChild
          variant="outline"
          size="lg"
          className="rounded-full border-primary/30 text-secondary-foreground hover:bg-secondary"
        >
          <Link href="/shop">
            View All Products
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </section>
  )
}
