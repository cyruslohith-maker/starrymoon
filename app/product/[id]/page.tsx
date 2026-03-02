"use client"

import { use, useState } from "react"
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
import { products } from "@/lib/data"
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

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const product = products.find((p) => p.id === id)
  const { addItem } = useCart()
  const [selectedSize, setSelectedSize] = useState("7cm")
  const [liked, setLiked] = useState(false)
  const [selectedImage, setSelectedImage] = useState(0)

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

  const images = product.images || [product.image, product.image, product.image]
  const related = products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4)

  return (
    <PageLayout>
      <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8 lg:py-12">
        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-2 text-xs text-muted-foreground" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <span>/</span>
          <Link href="/shop" className="hover:text-primary transition-colors">Shop</Link>
          <span>/</span>
          <Link href={`/shop?category=${encodeURIComponent(product.category)}`} className="hover:text-primary transition-colors">
            {product.category}
          </Link>
          <span>/</span>
          <span className="text-foreground font-medium">{product.name}</span>
        </nav>

        <div className="flex flex-col gap-10 lg:flex-row">
          {/* Image gallery */}
          <div className="flex flex-col gap-3 lg:w-1/2">
            {/* Main image */}
            <div className="relative aspect-square overflow-hidden rounded-2xl border border-border bg-secondary">
              <Image
                src={images[selectedImage]}
                alt={product.name}
                fill
                className="object-cover"
                priority
              />
              {product.tag && (
                <span className="absolute left-4 top-4 rounded-full bg-primary px-3 py-1 text-xs font-bold text-primary-foreground">
                  {product.tag}
                </span>
              )}
            </div>
            {/* Thumbnails */}
            <div className="flex gap-2">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`relative h-20 w-20 overflow-hidden rounded-xl border-2 transition-all ${
                    selectedImage === i ? "border-primary" : "border-border hover:border-primary/50"
                  }`}
                >
                  <Image src={img} alt={`${product.name} view ${i + 1}`} fill className="object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Product details */}
          <div className="flex flex-1 flex-col lg:w-1/2">
            <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-primary">
              {product.category}
            </p>
            <h1 className="mb-2 font-serif text-2xl font-bold text-foreground md:text-3xl">
              {product.name}
            </h1>
            <p className="mb-4 text-2xl font-bold text-foreground">
              {"\u20B9"}{product.price}
            </p>
            <p className="mb-6 text-sm leading-relaxed text-muted-foreground">
              {product.description}
            </p>

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
            <div className="mb-6 flex items-center gap-3">
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
                className="rounded-full border-primary/30 text-sm text-secondary-foreground hover:bg-secondary"
              >
                <Link href={`/customize?base=${product.id}`}>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Customize This
                </Link>
              </Button>
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
            <div className="mb-6 grid grid-cols-3 gap-3">
              {[
                { icon: Truck, text: "Free shipping over \u20B9499" },
                { icon: Shield, text: "Quality guaranteed" },
                { icon: RotateCcw, text: "Easy exchanges" },
              ].map((b) => (
                <div key={b.text} className="flex flex-col items-center gap-1 rounded-xl border border-border bg-secondary/30 p-3 text-center">
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
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
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
