"use client"

import { useState, useMemo, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { ProductCard } from "@/components/product-card"
import { PageLayout } from "@/components/page-layout"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { products, categories } from "@/lib/data"
import { SlidersHorizontal, X, Search } from "lucide-react"
import { Input } from "@/components/ui/input"

const colorOptions = ["Pink", "White", "Purple", "Blue", "Silver", "Red", "Pastel", "Yellow", "Clear", "Turquoise", "Lilac"]

export default function ShopPage() {
  return (
    <Suspense fallback={
      <PageLayout>
        <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8 lg:py-12">
          <div className="mb-8 text-center">
            <p className="mb-2 text-xs font-bold uppercase tracking-widest text-primary">Shop</p>
            <h1 className="font-serif text-3xl font-bold text-foreground md:text-4xl">Our Collection</h1>
          </div>
        </div>
      </PageLayout>
    }>
      <ShopContent />
    </Suspense>
  )
}

function ShopContent() {
  const searchParams = useSearchParams()
  const initialCategory = searchParams.get("category") || "All"

  const [search, setSearch] = useState("")
  const [activeCategory, setActiveCategory] = useState(initialCategory)
  const [selectedColors, setSelectedColors] = useState<string[]>([])
  const [priceRange, setPriceRange] = useState([0, 500])
  const [showFilters, setShowFilters] = useState(false)
  const [sortBy, setSortBy] = useState<"default" | "price-asc" | "price-desc">("default")

  const toggleColor = (color: string) => {
    setSelectedColors((prev) =>
      prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color]
    )
  }

  const filtered = useMemo(() => {
    let result = products

    // Category
    if (activeCategory !== "All") {
      result = result.filter((p) => p.category === activeCategory)
    }

    // Search
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q)
      )
    }

    // Colors
    if (selectedColors.length > 0) {
      result = result.filter((p) =>
        p.colors?.some((c) => selectedColors.includes(c))
      )
    }

    // Price
    result = result.filter((p) => p.price >= priceRange[0] && p.price <= priceRange[1])

    // Sort
    if (sortBy === "price-asc") {
      result = [...result].sort((a, b) => a.price - b.price)
    } else if (sortBy === "price-desc") {
      result = [...result].sort((a, b) => b.price - a.price)
    }

    return result
  }, [activeCategory, search, selectedColors, priceRange, sortBy])

  const clearFilters = () => {
    setActiveCategory("All")
    setSelectedColors([])
    setPriceRange([0, 500])
    setSearch("")
    setSortBy("default")
  }

  const hasActiveFilters =
    activeCategory !== "All" || selectedColors.length > 0 || priceRange[0] > 0 || priceRange[1] < 500 || search.trim()

  return (
    <PageLayout>
      <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8 lg:py-12">
        {/* Page header */}
        <div className="mb-8 text-center">
          <p className="mb-2 text-xs font-bold uppercase tracking-widest text-primary">
            Shop
          </p>
          <h1 className="font-serif text-3xl font-bold text-foreground md:text-4xl">
            Our Collection
          </h1>
          <p className="mx-auto mt-3 max-w-md text-pretty text-sm leading-relaxed text-muted-foreground">
            Browse all our handmade pieces. Each one crafted with love, glass beads, and silver charms.
          </p>
        </div>

        {/* Search + Sort bar */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="rounded-full border-border bg-card pl-10 text-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="rounded-full border border-border bg-card px-3 py-2 text-xs font-semibold text-muted-foreground"
            >
              <option value="default">Sort: Default</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
            <Button
              variant="outline"
              size="sm"
              className="rounded-full border-border text-xs lg:hidden"
              onClick={() => setShowFilters(!showFilters)}
            >
              <SlidersHorizontal className="mr-1 h-3 w-3" />
              Filters
            </Button>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Sidebar filters */}
          <aside
            className={`shrink-0 ${showFilters ? "fixed inset-0 z-40 bg-card p-6 overflow-y-auto" : "hidden"
              } lg:static lg:block lg:w-56`}
          >
            <div className="flex items-center justify-between lg:hidden">
              <h3 className="font-serif text-lg font-bold text-foreground">Filters</h3>
              <Button variant="ghost" size="icon" onClick={() => setShowFilters(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Category */}
            <div className="mb-6">
              <h4 className="mb-3 text-xs font-bold uppercase tracking-widest text-primary">
                Category
              </h4>
              <div className="flex flex-col gap-1">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => {
                      setActiveCategory(cat)
                      setShowFilters(false)
                    }}
                    className={`rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors ${activeCategory === cat
                        ? "bg-secondary text-secondary-foreground"
                        : "text-muted-foreground hover:bg-secondary/50"
                      }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Color filter */}
            <div className="mb-6">
              <h4 className="mb-3 text-xs font-bold uppercase tracking-widest text-primary">
                Color
              </h4>
              <div className="flex flex-col gap-2">
                {colorOptions.map((color) => (
                  <label key={color} className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
                    <Checkbox
                      checked={selectedColors.includes(color)}
                      onCheckedChange={() => toggleColor(color)}
                      className="border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                    />
                    {color}
                  </label>
                ))}
              </div>
            </div>

            {/* Price filter */}
            <div className="mb-6">
              <h4 className="mb-3 text-xs font-bold uppercase tracking-widest text-primary">
                Price Range
              </h4>
              <Slider
                value={priceRange}
                onValueChange={setPriceRange}
                max={500}
                min={0}
                step={10}
                className="mb-2"
              />
              <p className="text-xs text-muted-foreground">
                {"\u20B9"}{priceRange[0]} - {"\u20B9"}{priceRange[1]}
              </p>
            </div>

            {hasActiveFilters && (
              <Button
                variant="outline"
                size="sm"
                className="w-full rounded-full border-primary/30 text-xs text-secondary-foreground"
                onClick={() => {
                  clearFilters()
                  setShowFilters(false)
                }}
              >
                Clear All Filters
              </Button>
            )}
          </aside>

          {/* Product grid */}
          <div className="flex-1">
            <p className="mb-4 text-xs text-muted-foreground">
              Showing {filtered.length} product{filtered.length !== 1 ? "s" : ""}
            </p>
            {filtered.length > 0 ? (
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {filtered.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
                <p className="text-sm font-semibold text-foreground">No products found</p>
                <p className="text-xs text-muted-foreground">
                  Try adjusting your filters or search term.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full border-primary/30 text-xs"
                  onClick={clearFilters}
                >
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageLayout>
  )
}
