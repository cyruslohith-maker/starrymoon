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
    <section id="shop" className="bg-container-soft relative rounded-3xl mx-4 px-4 py-16 lg:mx-8 lg:px-8 lg:py-24">
      {/* Section header */}
      <div className="mb-10 text-center">
        <p className="mb-2 text-xs font-bold uppercase tracking-widest text-primary">
          Our Collection
        </p>
        <h2 className="font-serif text-3xl font-bold text-foreground md:text-4xl">
          Handpicked for you
        </h2>
        <p className="mx-auto mt-3 max-w-md text-pretty text-sm leading-relaxed text-muted-foreground">
          Every piece is handmade with glass beads and silver charms. Sizes from 5cm to 15cm, standard 7cm.
        </p>
      </div>

      {/* Category filters */}
      <div className="mb-8 flex flex-wrap items-center justify-center gap-2">
        {categories.map((cat) => (
          <Button
            key={cat}
            variant={active === cat ? "default" : "outline"}
            size="sm"
            className={`rounded-full text-xs ${
              active === cat
                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                : "border-border bg-card text-muted-foreground hover:bg-secondary hover:text-secondary-foreground"
            }`}
            onClick={() => setActive(cat)}
          >
            {cat}
          </Button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
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
