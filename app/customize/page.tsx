"use client"

import { useState, useRef } from "react"
import Image from "next/image"
import { PageLayout } from "@/components/page-layout"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useCart } from "@/lib/cart-context"
import {
  ShoppingBag,
  Upload,
  X,
  Search,
  Sparkles,
} from "lucide-react"

// Bead library
const beadColors = [
  { name: "Baby Pink", hex: "#F9A8D4" },
  { name: "Hot Pink", hex: "#EC4899" },
  { name: "White", hex: "#FFFFFF" },
  { name: "Lilac", hex: "#C4B5FD" },
  { name: "Sky Blue", hex: "#7DD3FC" },
  { name: "Mint", hex: "#6EE7B7" },
  { name: "Peach", hex: "#FDBA74" },
  { name: "Cream", hex: "#FDE68A" },
  { name: "Red", hex: "#F87171" },
  { name: "Clear", hex: "#E5E7EB" },
  { name: "Gold", hex: "#D4A574" },
  { name: "Silver", hex: "#C0C0C0" },
]

const charmOptions = [
  { name: "Butterfly", symbol: "butterfly" },
  { name: "Star", symbol: "star" },
  { name: "Heart", symbol: "heart" },
  { name: "Moon", symbol: "moon" },
  { name: "Flower", symbol: "flower" },
  { name: "Shell", symbol: "shell" },
  { name: "Cherry", symbol: "cherry" },
  { name: "Bow", symbol: "bow" },
]

const threadColors = [
  { name: "Clear Elastic", hex: "transparent" },
  { name: "Pink Thread", hex: "#F9A8D4" },
  { name: "White Thread", hex: "#F5F5F5" },
  { name: "Purple Thread", hex: "#C4B5FD" },
]

const sizeOptions = ["5cm", "6cm", "7cm", "8cm", "9cm", "10cm", "11cm", "12cm", "13cm", "14cm", "15cm"]

interface BeadSlot {
  id: number
  type: "bead" | "charm" | "empty"
  color?: string
  name?: string
  symbol?: string
}

export default function CustomizePage() {
  const { addItem } = useCart()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [description, setDescription] = useState("")
  const [uploadedImages, setUploadedImages] = useState<string[]>([])
  const [size, setSize] = useState("7cm")
  const [beadSlots, setBeadSlots] = useState<BeadSlot[]>(
    Array.from({ length: 12 }, (_, i) => ({ id: i, type: "empty" as const }))
  )
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [activeThread, setActiveThread] = useState(threadColors[0])

  const filledSlots = beadSlots.filter((s) => s.type !== "empty").length
  const basePrice = 149
  const beadPrice = filledSlots * 15
  const estimatedPrice = basePrice + beadPrice

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return
    Array.from(files).forEach((file) => {
      const reader = new FileReader()
      reader.onload = (ev) => {
        if (ev.target?.result) {
          setUploadedImages((prev) => [...prev, ev.target!.result as string])
        }
      }
      reader.readAsDataURL(file)
    })
  }

  const addBeadToSlot = (color: string, name: string) => {
    if (selectedSlot === null) {
      // Find first empty slot
      const emptyIdx = beadSlots.findIndex((s) => s.type === "empty")
      if (emptyIdx === -1) return
      setBeadSlots((prev) =>
        prev.map((s, i) =>
          i === emptyIdx ? { ...s, type: "bead", color, name } : s
        )
      )
    } else {
      setBeadSlots((prev) =>
        prev.map((s, i) =>
          i === selectedSlot ? { ...s, type: "bead", color, name } : s
        )
      )
      setSelectedSlot(null)
    }
  }

  const addCharmToSlot = (name: string, symbol: string) => {
    if (selectedSlot === null) {
      const emptyIdx = beadSlots.findIndex((s) => s.type === "empty")
      if (emptyIdx === -1) return
      setBeadSlots((prev) =>
        prev.map((s, i) =>
          i === emptyIdx ? { ...s, type: "charm", name, symbol, color: "#F472B6" } : s
        )
      )
    } else {
      setBeadSlots((prev) =>
        prev.map((s, i) =>
          i === selectedSlot ? { ...s, type: "charm", name, symbol, color: "#F472B6" } : s
        )
      )
      setSelectedSlot(null)
    }
  }

  const clearSlot = (idx: number) => {
    setBeadSlots((prev) =>
      prev.map((s, i) =>
        i === idx ? { id: i, type: "empty" } : s
      )
    )
  }

  const handleAddToCart = () => {
    const customProduct = {
      id: `custom-${Date.now()}`,
      name: "Custom Bracelet",
      price: estimatedPrice,
      image: "/placeholder.svg?height=400&width=400",
      category: "Bracelets",
      description: description || "Custom designed bracelet",
      inStock: true,
    }
    const note = beadSlots
      .filter((s) => s.type !== "empty")
      .map((s) => s.name)
      .join(", ")
    addItem(customProduct, size, note)
  }

  const charmSymbolMap: Record<string, string> = {
    butterfly: "\u2767",
    star: "\u2605",
    heart: "\u2665",
    moon: "\u263D",
    flower: "\u2740",
    shell: "\u2019",
    cherry: "\u2740",
    bow: "\u2740",
  }

  return (
    <PageLayout>
      <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8 lg:py-12">
        {/* Header */}
        <div className="mb-8 text-center">
          <p className="mb-2 text-xs font-bold uppercase tracking-widest text-primary">
            Customization Studio
          </p>
          <h1 className="font-serif text-3xl font-bold text-foreground md:text-4xl">
            Design Your Own Bracelet
          </h1>
          <p className="mx-auto mt-3 max-w-md text-pretty text-sm leading-relaxed text-muted-foreground">
            Pick your beads, charms, and thread color. Describe your dream design and we will bring it to life.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[280px_1fr_300px]">
          {/* LEFT PANEL - Description & Inspo */}
          <div className="rounded-2xl border border-border bg-card p-5">
            <h3 className="mb-3 text-sm font-bold text-card-foreground">Describe Your Design</h3>
            <Textarea
              placeholder="Tell us about your dream bracelet! Colors, vibes, occasion, fav characters..."
              value={description}
              onChange={(e) => {
                if (e.target.value.length <= 500) setDescription(e.target.value)
              }}
              className="mb-1 resize-none rounded-xl border-border bg-background text-sm"
              rows={6}
            />
            <p className="mb-4 text-right text-[10px] text-muted-foreground">
              {description.length}/500
            </p>

            <h4 className="mb-2 text-xs font-bold text-card-foreground">Upload Inspo Images</h4>
            <div className="flex flex-wrap gap-2 mb-3">
              {uploadedImages.map((img, i) => (
                <div key={i} className="relative h-16 w-16 overflow-hidden rounded-lg border border-border">
                  <Image src={img} alt={`Inspo ${i + 1}`} fill className="object-cover" />
                  <button
                    onClick={() => setUploadedImages((prev) => prev.filter((_, j) => j !== i))}
                    className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-destructive-foreground"
                    aria-label="Remove image"
                  >
                    <X className="h-2.5 w-2.5" />
                  </button>
                </div>
              ))}
            </div>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              className="hidden"
            />
            <Button
              variant="outline"
              size="sm"
              className="w-full rounded-full border-primary/30 text-xs text-secondary-foreground"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="mr-1 h-3 w-3" />
              Upload Images
            </Button>
          </div>

          {/* CENTER PANEL - Bracelet Preview */}
          <div className="flex flex-col items-center gap-6">
            <div className="w-full rounded-2xl border border-border bg-card p-6">
              <h3 className="mb-4 text-center text-sm font-bold text-card-foreground">
                Bracelet Preview
              </h3>

              {/* Thread color */}
              <div className="mb-4 flex items-center justify-center gap-2">
                <span className="text-[10px] font-bold text-muted-foreground">Thread:</span>
                {threadColors.map((tc) => (
                  <button
                    key={tc.name}
                    onClick={() => setActiveThread(tc)}
                    className={`h-5 w-5 rounded-full border-2 transition-all ${
                      activeThread.name === tc.name ? "border-primary scale-125" : "border-border"
                    }`}
                    style={{
                      backgroundColor: tc.hex === "transparent" ? "#E5E7EB" : tc.hex,
                    }}
                    aria-label={tc.name}
                    title={tc.name}
                  />
                ))}
              </div>

              {/* Bead slots - horizontal bracelet */}
              <div className="flex items-center justify-center gap-1 overflow-x-auto py-6">
                {/* Left clasp */}
                <div className="h-4 w-6 rounded-full bg-muted-foreground/20" />

                {/* Thread line behind beads */}
                <div className="relative flex items-center gap-1">
                  <div
                    className="absolute left-0 right-0 top-1/2 h-0.5 -translate-y-1/2"
                    style={{
                      backgroundColor:
                        activeThread.hex === "transparent" ? "#D1D5DB" : activeThread.hex,
                    }}
                  />
                  {beadSlots.map((slot, i) => (
                    <button
                      key={slot.id}
                      onClick={() => {
                        if (slot.type === "empty") {
                          setSelectedSlot(i)
                        } else {
                          clearSlot(i)
                        }
                      }}
                      className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 transition-all ${
                        selectedSlot === i
                          ? "border-primary ring-2 ring-primary/30 scale-110"
                          : slot.type === "empty"
                            ? "border-dashed border-border bg-secondary/50 hover:border-primary/50"
                            : "border-card shadow-sm hover:scale-105"
                      }`}
                      style={
                        slot.type !== "empty"
                          ? { backgroundColor: slot.color, borderColor: slot.color }
                          : undefined
                      }
                      title={slot.type === "empty" ? "Click to select, then pick a bead" : `${slot.name} (click to remove)`}
                      aria-label={slot.type === "empty" ? `Empty slot ${i + 1}` : `${slot.name} - click to remove`}
                    >
                      {slot.type === "empty" && (
                        <span className="text-[8px] font-bold text-muted-foreground">+</span>
                      )}
                      {slot.type === "charm" && (
                        <span className="text-xs text-primary-foreground">
                          {charmSymbolMap[slot.symbol || ""] || slot.name?.[0]}
                        </span>
                      )}
                    </button>
                  ))}
                </div>

                {/* Right clasp */}
                <div className="h-4 w-6 rounded-full bg-muted-foreground/20" />
              </div>

              <p className="text-center text-[10px] text-muted-foreground">
                Click a slot to select it, then choose a bead or charm from the library.
                Click a filled slot to clear it.
              </p>
            </div>

            {/* Slot count adjuster */}
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-muted-foreground">Bead Slots:</span>
              <Button
                variant="outline"
                size="sm"
                className="h-7 w-7 rounded-full border-border p-0 text-xs"
                onClick={() => {
                  if (beadSlots.length > 6) {
                    setBeadSlots((prev) => prev.slice(0, -1))
                  }
                }}
              >
                -
              </Button>
              <span className="text-sm font-bold text-foreground">{beadSlots.length}</span>
              <Button
                variant="outline"
                size="sm"
                className="h-7 w-7 rounded-full border-border p-0 text-xs"
                onClick={() => {
                  if (beadSlots.length < 20) {
                    setBeadSlots((prev) => [
                      ...prev,
                      { id: prev.length, type: "empty" },
                    ])
                  }
                }}
              >
                +
              </Button>
            </div>
          </div>

          {/* RIGHT PANEL - Library & Summary */}
          <div className="flex flex-col gap-4">
            {/* Library tabs */}
            <div className="rounded-2xl border border-border bg-card p-4">
              <Tabs defaultValue="beads">
                <TabsList className="mb-3 w-full bg-secondary">
                  <TabsTrigger value="beads" className="flex-1 text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                    Beads
                  </TabsTrigger>
                  <TabsTrigger value="charms" className="flex-1 text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                    Charms
                  </TabsTrigger>
                  <TabsTrigger value="threads" className="flex-1 text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                    Threads
                  </TabsTrigger>
                </TabsList>

                {/* Search */}
                <div className="relative mb-3">
                  <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="rounded-full border-border bg-background pl-8 text-xs h-8"
                  />
                </div>

                <TabsContent value="beads" className="mt-0">
                  <div className="grid grid-cols-4 gap-2">
                    {beadColors
                      .filter((b) =>
                        b.name.toLowerCase().includes(searchTerm.toLowerCase())
                      )
                      .map((bead) => (
                        <button
                          key={bead.name}
                          onClick={() => addBeadToSlot(bead.hex, bead.name)}
                          className="flex flex-col items-center gap-1 rounded-lg p-2 transition-colors hover:bg-secondary"
                          title={bead.name}
                        >
                          <div
                            className="h-8 w-8 rounded-full border-2 border-border shadow-sm"
                            style={{ backgroundColor: bead.hex }}
                          />
                          <span className="text-[9px] font-medium text-muted-foreground leading-tight text-center">
                            {bead.name}
                          </span>
                        </button>
                      ))}
                  </div>
                </TabsContent>

                <TabsContent value="charms" className="mt-0">
                  <div className="grid grid-cols-4 gap-2">
                    {charmOptions
                      .filter((c) =>
                        c.name.toLowerCase().includes(searchTerm.toLowerCase())
                      )
                      .map((charm) => (
                        <button
                          key={charm.name}
                          onClick={() => addCharmToSlot(charm.name, charm.symbol)}
                          className="flex flex-col items-center gap-1 rounded-lg p-2 transition-colors hover:bg-secondary"
                          title={charm.name}
                        >
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-primary">
                            <Sparkles className="h-4 w-4" />
                          </div>
                          <span className="text-[9px] font-medium text-muted-foreground">
                            {charm.name}
                          </span>
                        </button>
                      ))}
                  </div>
                </TabsContent>

                <TabsContent value="threads" className="mt-0">
                  <div className="flex flex-col gap-2">
                    {threadColors.map((tc) => (
                      <button
                        key={tc.name}
                        onClick={() => setActiveThread(tc)}
                        className={`flex items-center gap-3 rounded-lg p-2 transition-colors ${
                          activeThread.name === tc.name ? "bg-secondary" : "hover:bg-secondary/50"
                        }`}
                      >
                        <div
                          className="h-6 w-6 rounded-full border-2 border-border"
                          style={{ backgroundColor: tc.hex === "transparent" ? "#E5E7EB" : tc.hex }}
                        />
                        <span className="text-xs font-medium text-card-foreground">
                          {tc.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            {/* Summary */}
            <div className="rounded-2xl border border-border bg-card p-4">
              <h3 className="mb-3 text-sm font-bold text-card-foreground">Order Summary</h3>

              {/* Size */}
              <label className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                Bracelet Size
              </label>
              <select
                value={size}
                onChange={(e) => setSize(e.target.value)}
                className="mb-4 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
              >
                {sizeOptions.map((s) => (
                  <option key={s} value={s}>
                    {s} {s === "7cm" ? "(Standard)" : ""}
                  </option>
                ))}
              </select>

              {/* Price breakdown */}
              <div className="mb-4 flex flex-col gap-1 text-xs">
                <div className="flex justify-between text-muted-foreground">
                  <span>Base price</span>
                  <span>{"\u20B9"}{basePrice}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Beads/Charms ({filledSlots}x)</span>
                  <span>{"\u20B9"}{beadPrice}</span>
                </div>
                <div className="mt-1 flex justify-between border-t border-border pt-2 font-bold text-foreground">
                  <span>Estimated Total</span>
                  <span>{"\u20B9"}{estimatedPrice}</span>
                </div>
              </div>

              <Button
                onClick={handleAddToCart}
                className="w-full rounded-full bg-primary text-sm font-bold text-primary-foreground shadow-lg shadow-primary/30 hover:bg-primary/90"
              >
                <ShoppingBag className="mr-2 h-4 w-4" />
                Add to Cart
              </Button>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  )
}
