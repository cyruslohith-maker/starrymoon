"use client"

import { use, useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { PageLayout } from "@/components/page-layout"
import { Button } from "@/components/ui/button"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { useCart } from "@/lib/cart-context"
import type { Product } from "@/lib/data"
import { getProducts } from "@/lib/dashboard-store"
import { ProductCard } from "@/components/product-card"
import {
  Heart,
  ShoppingBag,
  Sparkles,
  ArrowLeft,
  Truck,
  Shield,
  RotateCcw,
} from "lucide-react"

export default function ProductClient({ id, initialProducts = [] }: { id: string, initialProducts?: Product[] }) {
  const [allProducts, setAllProducts] = useState<Product[]>(initialProducts)
  const [loading, setLoading] = useState(initialProducts.length === 0)

  useEffect(() => {
    if (initialProducts.length === 0) {
      getProducts().then((data) => {
        setAllProducts(data)
        setLoading(false)
      }).catch((err) => {
        console.error(err)
        setLoading(false)
      })
    }
  }, [initialProducts])

  const product = allProducts.find((p) => p.id === id)
  const { addItem } = useCart()
  const [selectedSize, setSelectedSize] = useState("7cm")
  const [liked, setLiked] = useState(false)
  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedVariant, setSelectedVariant] = useState<number | null>(null)

  const hasVariants = product?.variants && product.variants.length > 0

  if (loading) {
    return (
      <PageLayout>
        <div className="flex flex-col items-center justify-center gap-4 py-32 text-center">
          <p className="text-lg font-bold text-muted-foreground animate-pulse">Loading product...</p>
        </div>
      </PageLayout>
    )
  }

  if (!product) {
    return (
      <PageLayout>
        <div className="flex flex-col items-center justify-center gap-4 py-32 text-center">
          <p className="text-lg font-bold text-foreground">Product not found</p>
          <Button asChild className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90">
            <Link href="/shop">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Shop
            </Link>
          </Button>
        </div>
      </PageLayout>
    )
  }

  const images = selectedVariant !== null && hasVariants
    ? [product!.variants![selectedVariant].image]
    : product!.images && product!.images.length > 0 ? product!.images : [product!.image]
  const related = allProducts
    .filter((p) => p.category === product!.category && p.id !== product!.id)
    .slice(0, 4)
  const isOutOfStock = product!.inStock === false || (product!.quantity ?? 1) <= 0
  const displayName = selectedVariant !== null && hasVariants
    ? `${product!.name} — ${product!.variants![selectedVariant].label}`
    : product!.name
  const displayPrice = selectedVariant !== null && hasVariants && product!.variants![selectedVariant].price
    ? product!.variants![selectedVariant].price!
    : product!.price

  return (
    <PageLayout>
      <div className="mx-auto max-w-7xl px-3 py-5 sm:px-4 sm:py-8 lg:px-8 lg:py-12">
        {/* Breadcrumb */}
        <nav className="mb-4 flex items-center gap-1.5 overflow-x-auto text-[10px] text-muted-foreground sm:mb-6 sm:gap-2 sm:text-xs" aria-label="Breadcrumb">
          <Link href="/" className="shrink-0 hover:text-primary transition-colors">Home</Link>
          <span className="shrink-0">/</span>
          <Link href="/shop" className="shrink-0 hover:text-primary transition-colors">Shop</Link>
          <span className="shrink-0">/</span>
          <Link href={`/shop?category=${encodeURIComponent(product.category)}`} className="shrink-0 hover:text-primary transition-colors">
            {product.category}
          </Link>
          <span className="shrink-0">/</span>
          <span className="shrink-0 truncate text-foreground font-medium">{product.name}</span>
        </nav>

        <div className="flex flex-col gap-6 sm:gap-10 lg:flex-row">
          {/* Image gallery */}
          <div className="flex flex-col gap-2 sm:gap-3 lg:w-1/2">
            {/* Main image */}
            <div className="relative aspect-square overflow-hidden rounded-2xl border border-border bg-secondary">
              <Image
                src={images[selectedImage]}
                alt={product.name}
                fill
                className="object-contain"
                priority
              />
              {product.tag && (
                <span className="absolute left-4 top-4 rounded-full bg-primary px-3 py-1 text-xs font-bold text-primary-foreground">
                  {product.tag}
                </span>
              )}
            </div>
            {/* Thumbnails — horizontally scrollable on mobile */}
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 transition-all sm:h-20 sm:w-20 sm:rounded-xl ${
                    selectedImage === i ? "border-primary" : "border-border hover:border-primary/50"
                  }`}
                >
                  <Image src={img} alt={`${product.name} view ${i + 1}`} fill className="object-contain" />
                </button>
              ))}
            </div>
          </div>

          {/* Product details */}
          <div className="flex flex-1 flex-col lg:w-1/2">
            <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-primary">
              {product.category}
            </p>
            <h1 className="mb-2 font-serif text-xl font-bold text-foreground sm:text-2xl md:text-3xl">
              {displayName}
            </h1>
            <p className="mb-4 text-2xl font-bold text-foreground">
              {"\u20B9"}{displayPrice}
            </p>
            <p className="mb-6 text-sm leading-relaxed text-muted-foreground">
              {product.description}
            </p>

            {/* Variant selector */}
            {hasVariants && (
              <div className="mb-6">
                <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  Variant
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.variants!.map((v, i) => (
                    <button
                      key={i}
                      onClick={() => { setSelectedVariant(i); setSelectedImage(0) }}
                      className={`group flex items-center gap-2 rounded-xl border-2 px-2.5 py-2 transition-all ${selectedVariant === i
                        ? "border-primary bg-primary/5 shadow-sm shadow-primary/10"
                        : "border-border hover:border-primary/40"
                      }`}
                    >
                      <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-secondary">
                        <Image src={v.image} alt={v.label} fill className="object-cover" sizes="40px" />
                      </div>
                      <span className={`text-xs font-semibold ${
                        selectedVariant === i ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                      }`}>
                        {v.label}
                      </span>
                    </button>
                  ))}
                  {/* Main product option */}
                  <button
                    onClick={() => { setSelectedVariant(null); setSelectedImage(0) }}
                    className={`group flex items-center gap-2 rounded-xl border-2 px-2.5 py-2 transition-all ${selectedVariant === null
                      ? "border-primary bg-primary/5 shadow-sm shadow-primary/10"
                      : "border-border hover:border-primary/40"
                    }`}
                  >
                    <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-secondary">
                      <Image src={product.image} alt={product.name} fill className="object-cover" sizes="40px" />
                    </div>
                    <span className={`text-xs font-semibold ${
                      selectedVariant === null ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                    }`}>
                      {product.name}
                    </span>
                  </button>
                </div>
              </div>
            )}

            {/* Size selector */}
            {product.sizes && (
              <div className="mb-6">
                <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  Size
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((s) => (
                    <button
                      key={s}
                      onClick={() => setSelectedSize(s)}
                      className={`rounded-full px-4 py-2 text-xs font-semibold transition-all ${
                        selectedSize === s
                          ? "bg-primary text-primary-foreground"
                          : "border border-border bg-card text-muted-foreground hover:bg-secondary"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
                <p className="mt-1.5 text-[10px] text-muted-foreground">
                  Standard size is 7cm. Not sure? DM us for help.
                </p>
              </div>
            )}

            {/* Color indicators */}
            {product.colors && (
              <div className="mb-6">
                <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  Colors
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {product.colors.map((c) => (
                    <span
                      key={c}
                      className="rounded-full bg-secondary px-3 py-1 text-[10px] font-semibold text-secondary-foreground"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
              {isOutOfStock ? (
                <Button
                  size="lg"
                  className="flex-1 rounded-full bg-muted text-sm font-bold text-muted-foreground cursor-not-allowed opacity-60"
                  disabled
                >
                  Sold Out
                </Button>
              ) : (
                <>
                  <Button
                    size="lg"
                    className="flex-1 rounded-full bg-primary text-sm font-bold text-primary-foreground shadow-lg shadow-primary/30 hover:bg-primary/90"
                    onClick={() => addItem(product, selectedSize)}
                  >
                    <ShoppingBag className="mr-2 h-4 w-4" />
                    Add to Cart
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    size="lg"
                    className="rounded-full border-[#25D366]/50 bg-[#25D366]/10 text-sm font-bold text-[#25D366] hover:bg-[#25D366]/20"
                  >
                    <a href={`https://wa.me/916366020581?text=${encodeURIComponent(`Hi! I'd like to order: ${product.name}`)}`} target="_blank" rel="noopener noreferrer">
                      <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
                      </svg>
                      Order via WhatsApp
                    </a>
                  </Button>
                </>
              )}
              <Button
                variant="outline"
                size="icon"
                className={`rounded-full border-primary/30 ${liked ? "text-primary" : "text-muted-foreground"}`}
                onClick={() => setLiked(!liked)}
                aria-label={liked ? "Remove from wishlist" : "Add to wishlist"}
              >
                <Heart className={`h-5 w-5 ${liked ? "fill-primary" : ""}`} />
              </Button>
            </div>

            {/* Trust badges */}
            <div className="mb-6 grid grid-cols-3 gap-2 sm:gap-3">
              {[
                { icon: Truck, text: "Free shipping over \u20B9499" },
                { icon: Shield, text: "Quality guaranteed" },
                { icon: RotateCcw, text: "Easy exchanges" },
              ].map((b) => (
                <div key={b.text} className="flex flex-col items-center gap-1 rounded-lg border border-border bg-secondary/30 p-2 text-center sm:rounded-xl sm:p-3">
                  <b.icon className="h-4 w-4 text-primary" />
                  <span className="text-[10px] font-medium text-muted-foreground">{b.text}</span>
                </div>
              ))}
            </div>

            {/* Care instructions accordion */}
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="care" className="border-border">
                <AccordionTrigger className="text-sm font-bold text-foreground hover:text-primary">
                  Care Instructions
                </AccordionTrigger>
                <AccordionContent className="text-xs leading-relaxed text-muted-foreground">
                  <ul className="list-inside list-disc flex flex-col gap-1.5">
                    <li>Avoid contact with water, perfume, and lotions.</li>
                    <li>Store in a cool, dry place away from direct sunlight.</li>
                    <li>Handle with care - these are delicate, handmade pieces.</li>
                    <li>Clean gently with a soft, dry cloth.</li>
                    <li>Remove before swimming, bathing, or exercising.</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="sizing" className="border-border">
                <AccordionTrigger className="text-sm font-bold text-foreground hover:text-primary">
                  Size Chart
                </AccordionTrigger>
                <AccordionContent className="text-xs leading-relaxed text-muted-foreground">
                  <div className="overflow-hidden rounded-lg border border-border">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="bg-secondary">
                          <th className="px-3 py-2 text-left font-bold text-secondary-foreground">Size</th>
                          <th className="px-3 py-2 text-left font-bold text-secondary-foreground">Wrist</th>
                          <th className="px-3 py-2 text-left font-bold text-secondary-foreground">Best For</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-t border-border"><td className="px-3 py-2">5-6cm</td><td className="px-3 py-2">12-14cm</td><td className="px-3 py-2">Kids</td></tr>
                        <tr className="border-t border-border"><td className="px-3 py-2">7cm</td><td className="px-3 py-2">15-16cm</td><td className="px-3 py-2">Standard (Most teens)</td></tr>
                        <tr className="border-t border-border"><td className="px-3 py-2">8-9cm</td><td className="px-3 py-2">17-18cm</td><td className="px-3 py-2">Loose fit / Adults</td></tr>
                      </tbody>
                    </table>
                  </div>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="shipping" className="border-border">
                <AccordionTrigger className="text-sm font-bold text-foreground hover:text-primary">
                  Shipping Info
                </AccordionTrigger>
                <AccordionContent className="text-xs leading-relaxed text-muted-foreground">
                  All orders are shipped within 3-5 business days. Custom orders may take 5-7 days.
                  Free shipping on orders above {"\u20B9"}499. Track your order via WhatsApp.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>

        {/* Related products */}
        {related.length > 0 && (
          <div className="mt-16">
            <h2 className="mb-6 text-center font-serif text-2xl font-bold text-foreground">
              You might also like
            </h2>
            <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  )
}
