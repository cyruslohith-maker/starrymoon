"use client"

import { useState, useRef, useMemo } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { PageLayout } from "@/components/page-layout"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useCart } from "@/lib/cart-context"
import { products, categories, type Product } from "@/lib/data"
import {
  Upload,
  X,
  Sparkles,
  Paintbrush,
  Send,
  ChevronDown,
  Check,
} from "lucide-react"

type OrderType = "modify" | "new" | null

export default function CustomizePage() {
  const { addItem } = useCart()
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [description, setDescription] = useState("")
  const [uploadedImages, setUploadedImages] = useState<string[]>([])
  const [orderType, setOrderType] = useState<OrderType>(null)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [categoryFilter, setCategoryFilter] = useState("All")
  const [sending, setSending] = useState(false)

  // Filter products by category (exclude "All")
  const filteredProducts = useMemo(() => {
    if (categoryFilter === "All") return products
    return products.filter((p) => p.category === categoryFilter)
  }, [categoryFilter])

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return
    Array.from(files).slice(0, 3 - uploadedImages.length).forEach((file) => {
      const reader = new FileReader()
      reader.onload = (ev) => {
        if (ev.target?.result) {
          setUploadedImages((prev) => [...prev, ev.target!.result as string])
        }
      }
      reader.readAsDataURL(file)
    })
  }

  const canSubmit = description.trim().length > 0 && orderType !== null

  const handleSubmit = async () => {
    if (!canSubmit) return
    setSending(true)

    // Build the custom order product for the cart
    const customProduct: Product = {
      id: `custom-${Date.now()}`,
      name: orderType === "modify"
        ? `Custom Modification — ${selectedProduct?.name || "Selected Design"}`
        : "New Custom Design",
      price: 0, // Price to be quoted after review
      image: selectedProduct?.image || "/placeholder.svg?height=400&width=400",
      category: "Custom Order",
      description: description,
      inStock: true,
    }

    // Add one item to cart with the description as note
    const note = [
      `Type: ${orderType === "modify" ? "Modification to existing design" : "New design"}`,
      selectedProduct ? `Base: ${selectedProduct.name}` : "",
      `Description: ${description}`,
      uploadedImages.length > 0 ? `${uploadedImages.length} reference image(s) attached` : "",
    ].filter(Boolean).join(" | ")

    addItem(customProduct, undefined, note)

    setSending(false)
    router.push("/checkout")
  }

  return (
    <PageLayout>
      <div className="mx-auto max-w-2xl px-3 py-6 sm:px-4 sm:py-8 lg:px-8 lg:py-12">
        {/* Header */}
        <div className="mb-6 text-center sm:mb-8">
          <p className="mb-2 text-xs font-bold uppercase tracking-widest text-primary">
            Custom Orders
          </p>
          <h1 className="font-serif text-2xl font-bold text-foreground sm:text-3xl md:text-4xl">
            Design Something Unique
          </h1>
          <p className="mx-auto mt-3 max-w-md text-pretty text-sm leading-relaxed text-muted-foreground">
            Describe your dream jewelry and we&apos;ll bring it to life. Upload reference pictures and we&apos;ll get back to you with a quote.
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4 shadow-xl sm:p-6 md:p-8">
          {/* ─── Order Type Selector ─── */}
          <div className="mb-6">
            <label className="mb-3 block text-xs font-bold uppercase tracking-widest text-muted-foreground">
              What would you like?
            </label>
            <div className="grid grid-cols-2 gap-3">
              {/* Modify existing */}
              <button
                type="button"
                onClick={() => {
                  setOrderType("modify")
                  setSelectedProduct(null)
                }}
                className={`group flex flex-col items-center gap-2 rounded-xl border-2 p-4 text-center transition-all duration-200 ${
                  orderType === "modify"
                    ? "border-primary bg-primary/5 shadow-md shadow-primary/10"
                    : "border-border hover:border-primary/40 hover:bg-secondary/50"
                }`}
                aria-pressed={orderType === "modify"}
              >
                <div className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors ${
                  orderType === "modify" ? "bg-primary/20" : "bg-secondary"
                }`}>
                  <Paintbrush className={`h-5 w-5 ${orderType === "modify" ? "text-primary" : "text-muted-foreground"}`} />
                </div>
                <span className={`text-sm font-bold ${orderType === "modify" ? "text-primary" : "text-foreground"}`}>
                  Changes to Existing Design
                </span>
                <span className="text-[10px] text-muted-foreground">
                  Pick a product and tell us what to change
                </span>
              </button>

              {/* New design */}
              <button
                type="button"
                onClick={() => {
                  setOrderType("new")
                  setSelectedProduct(null)
                }}
                className={`group flex flex-col items-center gap-2 rounded-xl border-2 p-4 text-center transition-all duration-200 ${
                  orderType === "new"
                    ? "border-primary bg-primary/5 shadow-md shadow-primary/10"
                    : "border-border hover:border-primary/40 hover:bg-secondary/50"
                }`}
                aria-pressed={orderType === "new"}
              >
                <div className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors ${
                  orderType === "new" ? "bg-primary/20" : "bg-secondary"
                }`}>
                  <Sparkles className={`h-5 w-5 ${orderType === "new" ? "text-primary" : "text-muted-foreground"}`} />
                </div>
                <span className={`text-sm font-bold ${orderType === "new" ? "text-primary" : "text-foreground"}`}>
                  New Design
                </span>
                <span className="text-[10px] text-muted-foreground">
                  Describe something completely new
                </span>
              </button>
            </div>
          </div>

          {/* ─── Product Picker (only for "modify") ─── */}
          {orderType === "modify" && (
            <div className="mb-6 animate-in fade-in slide-in-from-top-2 duration-300">
              <label className="mb-3 block text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Choose the product to modify
              </label>

              {/* Category filter */}
              <div className="relative mb-3">
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full appearance-none rounded-xl border border-border bg-background px-4 py-2.5 pr-10 text-sm font-semibold text-foreground outline-none transition-colors focus:border-primary"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              </div>

              {/* Product grid */}
              <div className="grid max-h-64 grid-cols-2 gap-2 overflow-y-auto rounded-xl border border-border bg-background p-2 sm:grid-cols-3">
                {filteredProducts.map((product) => {
                  const isSelected = selectedProduct?.id === product.id
                  return (
                    <button
                      key={product.id}
                      type="button"
                      onClick={() => setSelectedProduct(isSelected ? null : product)}
                      className={`relative flex flex-col items-center gap-1.5 rounded-lg p-2 text-center transition-all ${
                        isSelected
                          ? "bg-primary/10 ring-2 ring-primary"
                          : "hover:bg-secondary/60"
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary">
                          <Check className="h-3 w-3 text-primary-foreground" />
                        </div>
                      )}
                      <div className="relative h-16 w-16 overflow-hidden rounded-lg bg-secondary">
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          className="object-cover"
                          loading="lazy"
                        />
                      </div>
                      <span className="line-clamp-2 text-[10px] font-semibold leading-tight text-foreground">
                        {product.name}
                      </span>
                      <span className="text-[9px] text-muted-foreground">
                        {product.category}
                      </span>
                    </button>
                  )
                })}
              </div>

              {selectedProduct && (
                <p className="mt-2 text-xs text-primary font-semibold">
                  Selected: {selectedProduct.name}
                </p>
              )}
            </div>
          )}

          {/* ─── Description ─── */}
          <div className="mb-5">
            <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Describe your design
            </label>
            <Textarea
              placeholder={
                orderType === "modify"
                  ? "Tell us what changes you'd like — different colors, add charms, change size, etc."
                  : "Tell us about your dream jewelry! Colors, vibes, occasion, favourite characters..."
              }
              value={description}
              onChange={(e) => {
                if (e.target.value.length <= 1000) setDescription(e.target.value)
              }}
              className="resize-none rounded-xl border-border bg-background text-sm"
              rows={5}
            />
            <p className="mt-1 text-right text-[10px] text-muted-foreground">
              {description.length}/1000
            </p>
          </div>

          {/* ─── Reference Images ─── */}
          <div className="mb-6">
            <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Reference pictures (optional)
            </label>
            <div className="flex flex-wrap gap-3 mb-3">
              {uploadedImages.map((img, i) => (
                <div key={i} className="group relative h-20 w-20 overflow-hidden rounded-xl border-2 border-border shadow-sm">
                  <Image src={img} alt={`Reference ${i + 1}`} fill className="object-cover" />
                  <button
                    onClick={() => setUploadedImages((prev) => prev.filter((_, j) => j !== i))}
                    className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-destructive-foreground opacity-0 transition-opacity group-hover:opacity-100"
                    aria-label="Remove image"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
              {uploadedImages.length < 3 && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex h-20 w-20 flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-border text-muted-foreground transition-colors hover:border-primary/50 hover:bg-secondary/50"
                >
                  <Upload className="h-5 w-5" />
                  <span className="text-[9px] font-bold">Upload</span>
                </button>
              )}
            </div>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              className="hidden"
            />
            <p className="text-[10px] text-muted-foreground">
              Up to 3 images. Inspo photos, sketches, or screenshots.
            </p>
          </div>

          {/* ─── Submit ─── */}
          <Button
            onClick={handleSubmit}
            disabled={!canSubmit || sending}
            className="w-full rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/30 disabled:opacity-50"
            style={{ minHeight: "48px" }}
          >
            <Send className="mr-2 h-4 w-4" />
            {sending ? "Sending..." : "Send Custom Order"}
          </Button>

          {!canSubmit && orderType !== null && (
            <p className="mt-2 text-center text-[10px] text-muted-foreground">
              Please add a description to continue
            </p>
          )}
        </div>
      </div>
    </PageLayout>
  )
}
