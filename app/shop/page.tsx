"use client"

import { useState, useMemo, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { ProductCard } from "@/components/product-card"
import { PageLayout } from "@/components/page-layout"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { categories } from "@/lib/data"
import type { Product } from "@/lib/data"
import { getProducts } from "@/lib/dashboard-store"
import { SlidersHorizontal, X, Search, ChevronDown, ChevronUp } from "lucide-react"
import { Input } from "@/components/ui/input"

const colorOptions = ["Pink", "White", "Purple", "Blue", "Silver", "Red", "Pastel", "Yellow", "Clear", "Turquoise", "Lilac"]

const typeOptions = ["Handmade", "Beaded", "Charm", "Glass", "Custom"]

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

  /* Mobile filter section toggles */
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    category: true,
    price: true,
    color: true,
    type: false,
  })

  /* Sync category when URL search param changes */
  useEffect(() => {
    const cat = searchParams.get("category")
    if (cat) setActiveCategory(cat)
  }, [searchParams])

  const toggleSection = (key: string) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const toggleColor = (color: string) => {
    setSelectedColors((prev) =>
      prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color]
    )
  }

  const [allProducts, setAllProducts] = useState<Product[]>([])

  /* Load products from Supabase */
  useEffect(() => {
    getProducts().then(setAllProducts).catch(console.error)
  }, [])

  const filtered = useMemo(() => {
    let result = allProducts

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
  }, [allProducts, activeCategory, search, selectedColors, priceRange, sortBy])

  const clearFilters = () => {
    setActiveCategory("All")
    setSelectedColors([])
    setPriceRange([0, 500])
    setSearch("")
    setSortBy("default")
  }

  const activeFilterCount =
    (activeCategory !== "All" ? 1 : 0) +
    selectedColors.length +
    (priceRange[0] > 0 || priceRange[1] < 500 ? 1 : 0)

  const hasActiveFilters =
    activeCategory !== "All" || selectedColors.length > 0 || priceRange[0] > 0 || priceRange[1] < 500 || search.trim()

  /* Collapsible filter section */
  const FilterSection = ({ id, title, children }: { id: string; title: string; children: React.ReactNode }) => (
    <div className="mb-4">
      <button
        onClick={() => toggleSection(id)}
        className="flex w-full items-center justify-between py-2 text-xs font-bold uppercase tracking-widest text-primary"
        aria-expanded={openSections[id]}
      >
        {title}
        {openSections[id] ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
      </button>
      {openSections[id] && <div className="pt-1">{children}</div>}
    </div>
  )

  /* Shared filter content (used in both sidebar and mobile sheet) */
  const filterContent = (
    <>
      {/* Category */}
      <FilterSection id="category" title="Category">
        <div className="flex flex-col gap-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setActiveCategory(cat)
              }}
              className={`rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors ${activeCategory === cat
                  ? "bg-secondary text-secondary-foreground"
                  : "text-muted-foreground hover:bg-secondary/50"
                }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </FilterSection>

      {/* Price filter */}
      <FilterSection id="price" title="Price Range">
        <Slider
          value={priceRange}
          onValueChange={setPriceRange}
          max={500}
          min={0}
          step={10}
          className="mb-2"
        />
        <div className="flex items-center justify-between">
          <span className="rounded-full bg-secondary px-2.5 py-1 text-xs font-semibold text-secondary-foreground">
            {"\u20B9"}{priceRange[0]}
          </span>
          <span className="text-xs text-muted-foreground">to</span>
          <span className="rounded-full bg-secondary px-2.5 py-1 text-xs font-semibold text-secondary-foreground">
            {"\u20B9"}{priceRange[1]}
          </span>
        </div>
      </FilterSection>

      {/* Color filter */}
      <FilterSection id="color" title="Color">
        <div className="flex flex-wrap gap-2">
          {colorOptions.map((color) => (
            <button
              key={color}
              onClick={() => toggleColor(color)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${
                selectedColors.includes(color)
                  ? "bg-primary text-primary-foreground shadow-sm shadow-primary/30"
                  : "bg-secondary text-muted-foreground hover:bg-secondary/80"
              }`}
            >
              {color}
            </button>
          ))}
        </div>
      </FilterSection>

      {/* Type filter (for discovery — matches against description keywords) */}
      <FilterSection id="type" title="Type">
        <div className="flex flex-wrap gap-2">
          {typeOptions.map((type) => (
            <span
              key={type}
              className="rounded-full bg-secondary px-3 py-1.5 text-xs font-semibold text-muted-foreground"
            >
              {type}
            </span>
          ))}
        </div>
        <p className="mt-2 text-[10px] text-muted-foreground">More types coming soon!</p>
      </FilterSection>

      {hasActiveFilters && (
        <Button
          variant="outline"
          size="sm"
          className="mt-2 w-full rounded-full border-primary/30 text-xs text-secondary-foreground"
          onClick={() => {
            clearFilters()
            setShowFilters(false)
          }}
        >
          Clear All Filters
        </Button>
      )}
    </>
  )

  return (
    <PageLayout>
      <div className="mx-auto max-w-7xl px-4 py-6 sm:py-8 lg:px-8 lg:py-12">
        {/* Page header */}
        <div className="mb-6 text-center sm:mb-8">
          <p className="mb-2 text-xs font-bold uppercase tracking-widest text-primary">
            Shop
          </p>
          <h1 className="font-serif text-2xl font-bold text-foreground sm:text-3xl md:text-4xl">
            Our Collection
          </h1>
          <p className="mx-auto mt-3 max-w-md text-pretty text-xs leading-relaxed text-muted-foreground sm:text-sm">
            Browse all our handmade pieces. Each one crafted with love, glass beads, and silver charms.
          </p>
        </div>

        {/* Mobile: Active filter chips */}
        {hasActiveFilters && (
          <div className="mb-4 flex flex-wrap items-center gap-2 lg:hidden">
            {activeCategory !== "All" && (
              <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                {activeCategory}
                <button onClick={() => setActiveCategory("All")} aria-label="Remove category filter">
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {selectedColors.map((c) => (
              <span key={c} className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                {c}
                <button onClick={() => toggleColor(c)} aria-label={`Remove ${c} filter`}>
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
            {(priceRange[0] > 0 || priceRange[1] < 500) && (
              <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                {"\u20B9"}{priceRange[0]}–{"\u20B9"}{priceRange[1]}
                <button onClick={() => setPriceRange([0, 500])} aria-label="Remove price filter">
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            <button
              onClick={clearFilters}
              className="text-xs font-semibold text-muted-foreground underline underline-offset-2"
            >
              Clear all
            </button>
          </div>
        )}

        {/* Search + Sort bar */}
        <div className="mb-4 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:items-center sm:justify-between">
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
              className="flex-1 rounded-full border border-border bg-card px-3 py-2.5 text-xs font-semibold text-muted-foreground sm:flex-auto"
            >
              <option value="default">Sort: Default</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
            <Button
              variant="outline"
              size="sm"
              className="relative rounded-full border-border text-xs lg:hidden"
              onClick={() => setShowFilters(!showFilters)}
            >
              <SlidersHorizontal className="mr-1.5 h-3.5 w-3.5" />
              Filters
              {activeFilterCount > 0 && (
                <span className="ml-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                  {activeFilterCount}
                </span>
              )}
            </Button>
          </div>
        </div>

        <div className="flex gap-8">
          {/* ═══ Mobile filter sheet (full-screen overlay) ═══ */}
          {showFilters && (
            <>
              <div
                className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm lg:hidden"
                onClick={() => setShowFilters(false)}
                aria-hidden="true"
              />
              <aside className="fixed inset-y-0 left-0 z-50 flex w-[85%] max-w-sm flex-col bg-card shadow-2xl shadow-primary/10 lg:hidden">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-border px-5 py-4">
                  <h3 className="font-serif text-lg font-bold text-foreground">Filters</h3>
                  <Button variant="ghost" size="icon" onClick={() => setShowFilters(false)} aria-label="Close filters">
                    <X className="h-5 w-5" />
                  </Button>
                </div>
                {/* Scrollable filter content */}
                <div className="flex-1 overflow-y-auto px-5 py-4">
                  {filterContent}
                </div>
                {/* Footer */}
                <div className="border-t border-border px-5 py-4">
                  <Button
                    className="w-full rounded-full bg-primary text-sm font-bold text-primary-foreground shadow-lg shadow-primary/30 hover:bg-primary/90"
                    onClick={() => setShowFilters(false)}
                  >
                    Show {filtered.length} Product{filtered.length !== 1 ? "s" : ""}
                  </Button>
                </div>
              </aside>
            </>
          )}

          {/* ═══ Desktop sidebar filters ═══ */}
          <aside className="hidden shrink-0 lg:block lg:w-56">
            {filterContent}
          </aside>

          {/* Product grid */}
          <div className="flex-1">
            <p className="mb-4 text-xs text-muted-foreground">
              Showing {filtered.length} product{filtered.length !== 1 ? "s" : ""}
            </p>
            {filtered.length > 0 ? (
              <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3">
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
