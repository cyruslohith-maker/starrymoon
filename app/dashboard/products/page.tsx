"use client"

import { useEffect, useState, useRef } from "react"
import Image from "next/image"
import { categories } from "@/lib/data"
import type { Product } from "@/lib/data"
import {
    getProducts,
    addProduct,
    updateProduct,
    deleteProduct,
} from "@/lib/dashboard-store"
import {
    Plus,
    Pencil,
    Trash2,
    X,
    Search,
    Package,
    ImageIcon,
    Upload,
    Camera,
    Loader2,
} from "lucide-react"

const editableCategories = categories.filter((c) => c !== "All")
const tags = ["", "New", "Bestseller", "Popular"] as const

const emptyForm: Omit<Product, "id"> = {
    name: "",
    price: 0,
    image: "/placeholder.svg?height=400&width=400",
    category: "Bracelets",
    description: "",
    tag: "",
    colors: [],
    sizes: [],
    inStock: true,
    quantity: 10,
}

export default function ProductsPage() {
    const [products, setProducts] = useState<Product[]>([])
    const [search, setSearch] = useState("")
    const [filterCategory, setFilterCategory] = useState("All")
    const [showForm, setShowForm] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [form, setForm] = useState(emptyForm)
    const [colorInput, setColorInput] = useState("")
    const [sizeInput, setSizeInput] = useState("")
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
    const [imageUploading, setImageUploading] = useState(false)
    const [isDragging, setIsDragging] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const cameraInputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        setProducts(getProducts())
    }, [])

    const refresh = () => setProducts(getProducts())

    const filtered = products.filter((p) => {
        const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase())
        const matchesCat = filterCategory === "All" || p.category === filterCategory
        return matchesSearch && matchesCat
    })

    const openAdd = () => {
        setEditingId(null)
        setForm(emptyForm)
        setColorInput("")
        setSizeInput("")
        setShowForm(true)
    }

    const openEdit = (p: Product) => {
        setEditingId(p.id)
        setForm({ ...p })
        setColorInput("")
        setSizeInput("")
        setShowForm(true)
    }

    const handleSave = () => {
        if (!form.name || !form.price) return
        if (editingId) {
            updateProduct(editingId, form)
        } else {
            addProduct(form)
        }
        setShowForm(false)
        refresh()
    }

    const handleDelete = (id: string) => {
        deleteProduct(id)
        setDeleteConfirm(null)
        refresh()
    }

    const addColor = () => {
        if (colorInput.trim() && !form.colors?.includes(colorInput.trim())) {
            setForm({ ...form, colors: [...(form.colors || []), colorInput.trim()] })
            setColorInput("")
        }
    }

    const removeColor = (c: string) => {
        setForm({ ...form, colors: form.colors?.filter((x) => x !== c) })
    }

    const addSize = () => {
        if (sizeInput.trim() && !form.sizes?.includes(sizeInput.trim())) {
            setForm({ ...form, sizes: [...(form.sizes || []), sizeInput.trim()] })
            setSizeInput("")
        }
    }

    const removeSize = (s: string) => {
        setForm({ ...form, sizes: form.sizes?.filter((x) => x !== s) })
    }

    /* ── Image upload handler (multi-image) ── */
    const handleImageFiles = (files: FileList | File[]) => {
        const fileArr = Array.from(files).filter((f) => f.type.startsWith("image/"))
        if (fileArr.length === 0) return

        const oversized = fileArr.filter((f) => f.size > 10 * 1024 * 1024)
        if (oversized.length > 0) {
            alert(`${oversized.length} image(s) exceed 10 MB and were skipped`)
        }

        const valid = fileArr.filter((f) => f.size <= 10 * 1024 * 1024)
        if (valid.length === 0) return

        setImageUploading(true)
        let loaded = 0

        valid.forEach((file) => {
            const reader = new FileReader()
            reader.onload = () => {
                const dataUrl = reader.result as string
                setForm((prev) => {
                    const imgs = [...(prev.images || []), dataUrl]
                    return { ...prev, images: imgs, image: prev.image === "/placeholder.svg?height=400&width=400" ? dataUrl : prev.image }
                })
                loaded++
                if (loaded >= valid.length) setImageUploading(false)
            }
            reader.onerror = () => {
                loaded++
                if (loaded >= valid.length) setImageUploading(false)
            }
            reader.readAsDataURL(file)
        })
    }

    const removeImage = (idx: number) => {
        setForm((prev) => {
            const imgs = (prev.images || []).filter((_, i) => i !== idx)
            const newPrimary = imgs.length > 0 ? imgs[0] : "/placeholder.svg?height=400&width=400"
            return { ...prev, images: imgs, image: newPrimary }
        })
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
        if (e.dataTransfer.files?.length) handleImageFiles(e.dataTransfer.files)
    }

    return (
        <div>
            {/* Header */}
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="font-serif text-2xl font-bold text-foreground">Products</h1>
                    <p className="text-sm text-muted-foreground">{products.length} products total</p>
                </div>
                <button
                    onClick={openAdd}
                    className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-primary-foreground transition-colors hover:bg-primary/90"
                >
                    <Plus className="h-4 w-4" />
                    Add Product
                </button>
            </div>

            {/* Filters */}
            <div className="mb-6 flex flex-wrap gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full rounded-xl border border-border bg-card py-2.5 pl-9 pr-4 text-sm outline-none focus:border-primary"
                    />
                </div>
                <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="rounded-xl border border-border bg-card px-4 py-2.5 text-sm outline-none focus:border-primary"
                >
                    {categories.map((c) => (
                        <option key={c} value={c}>{c}</option>
                    ))}
                </select>
            </div>

            {/* Product grid */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filtered.map((p) => (
                    <div
                        key={p.id}
                        className="relative overflow-hidden rounded-2xl border border-border bg-card transition-all hover:shadow-md"
                    >
                        {/* Image */}
                        <div className="relative aspect-square bg-secondary">
                            <Image
                                src={p.image}
                                alt={p.name}
                                fill
                                className="object-cover"
                                sizes="(max-width: 640px) 100vw, 25vw"
                            />
                            {p.tag && (
                                <span className="absolute left-2 top-2 rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold uppercase text-primary-foreground">
                                    {p.tag}
                                </span>
                            )}
                        </div>

                        {/* Info */}
                        <div className="p-4">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                                {p.category}
                            </p>
                            <h3 className="mt-1 text-sm font-bold text-card-foreground">{p.name}</h3>
                            <div className="mt-2 flex items-center justify-between">
                                <span className="text-lg font-bold text-foreground">₹{p.price}</span>
                                <span
                                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${(p.quantity ?? 0) > 0
                                            ? "bg-emerald-500/10 text-emerald-600"
                                            : "bg-destructive/10 text-destructive"
                                        }`}
                                >
                                    {(p.quantity ?? 0) > 0 ? `${p.quantity} in stock` : "Out of stock"}
                                </span>
                            </div>

                            {/* Actions */}
                            <div className="mt-3 flex gap-2">
                                <button
                                    onClick={() => openEdit(p)}
                                    className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-secondary py-2 text-xs font-semibold text-secondary-foreground transition-colors hover:bg-secondary/80"
                                >
                                    <Pencil className="h-3 w-3" />
                                    Edit
                                </button>
                                <button
                                    onClick={() => setDeleteConfirm(p.id)}
                                    className="flex items-center justify-center rounded-lg bg-destructive/10 px-3 py-2 text-xs font-semibold text-destructive transition-colors hover:bg-destructive/20"
                                >
                                    <Trash2 className="h-3 w-3" />
                                </button>
                            </div>
                        </div>

                        {/* Delete confirmation overlay */}
                        {deleteConfirm === p.id && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-card/95 p-4 backdrop-blur-sm">
                                <p className="text-center text-sm font-bold text-foreground">Delete "{p.name}"?</p>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleDelete(p.id)}
                                        className="rounded-lg bg-destructive px-4 py-2 text-xs font-bold text-white"
                                    >
                                        Delete
                                    </button>
                                    <button
                                        onClick={() => setDeleteConfirm(null)}
                                        className="rounded-lg bg-secondary px-4 py-2 text-xs font-bold text-secondary-foreground"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                ))}

                {filtered.length === 0 && (
                    <div className="col-span-full flex flex-col items-center gap-3 py-16 text-center">
                        <Package className="h-10 w-10 text-muted-foreground/40" />
                        <p className="text-sm text-muted-foreground">No products found</p>
                    </div>
                )}
            </div>

            {/* Add/Edit modal */}
            {showForm && (
                <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4 pt-16 backdrop-blur-sm">
                    <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl">
                        <div className="mb-5 flex items-center justify-between">
                            <h2 className="font-serif text-lg font-bold text-foreground">
                                {editingId ? "Edit Product" : "Add Product"}
                            </h2>
                            <button
                                onClick={() => setShowForm(false)}
                                className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:bg-secondary"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        <div className="flex flex-col gap-4">
                            {/* Name */}
                            <div>
                                <label className="mb-1 block text-xs font-bold text-muted-foreground">Product Name *</label>
                                <input
                                    type="text"
                                    value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary"
                                    placeholder="e.g. Sakura Dream Bracelet"
                                />
                            </div>

                            {/* Price + Quantity */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="mb-1 block text-xs font-bold text-muted-foreground">Price (₹) *</label>
                                    <input
                                        type="number"
                                        value={form.price || ""}
                                        onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                                        className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary"
                                        placeholder="199"
                                    />
                                </div>
                                <div>
                                    <label className="mb-1 block text-xs font-bold text-muted-foreground">Quantity</label>
                                    <input
                                        type="number"
                                        value={form.quantity ?? ""}
                                        onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })}
                                        className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary"
                                        placeholder="10"
                                    />
                                </div>
                            </div>

                            {/* Category + Tag */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="mb-1 block text-xs font-bold text-muted-foreground">Category</label>
                                    <select
                                        value={form.category}
                                        onChange={(e) => setForm({ ...form, category: e.target.value })}
                                        className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary"
                                    >
                                        {editableCategories.map((c) => (
                                            <option key={c} value={c}>{c}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="mb-1 block text-xs font-bold text-muted-foreground">Tag</label>
                                    <select
                                        value={form.tag || ""}
                                        onChange={(e) => setForm({ ...form, tag: e.target.value || undefined })}
                                        className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary"
                                    >
                                        {tags.map((t) => (
                                            <option key={t} value={t}>{t || "None"}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Image Upload (multi-image) */}
                            <div>
                                <label className="mb-1 flex items-center justify-between text-xs font-bold text-muted-foreground">
                                    <span>
                                        <ImageIcon className="mr-1 inline h-3 w-3" />
                                        Product Images
                                    </span>
                                    <span className="font-normal">
                                        {(form.images || []).length} uploaded
                                    </span>
                                </label>

                                {/* Gallery preview */}
                                {(form.images || []).length > 0 && (
                                    <div className="mb-3 flex flex-wrap gap-2">
                                        {(form.images || []).map((img, idx) => (
                                            <div key={idx} className="group relative h-20 w-20 overflow-hidden rounded-xl border border-border bg-secondary">
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img src={img} alt={`Image ${idx + 1}`} className="h-full w-full object-cover" />
                                                {idx === 0 && (
                                                    <span className="absolute left-1 top-1 rounded bg-primary px-1 py-0.5 text-[8px] font-bold text-primary-foreground">Main</span>
                                                )}
                                                <button
                                                    type="button"
                                                    onClick={() => removeImage(idx)}
                                                    className="absolute right-0.5 top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100"
                                                    aria-label={`Remove image ${idx + 1}`}
                                                >
                                                    <X className="h-2.5 w-2.5" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Drop zone */}
                                <div
                                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
                                    onDragLeave={() => setIsDragging(false)}
                                    onDrop={handleDrop}
                                    onClick={() => fileInputRef.current?.click()}
                                    className={`flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed p-5 text-center transition-colors ${
                                        isDragging
                                            ? "border-primary bg-primary/5"
                                            : "border-border hover:border-primary/50 hover:bg-secondary/30"
                                    }`}
                                >
                                    {imageUploading ? (
                                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                                    ) : (
                                        <Upload className="h-6 w-6 text-muted-foreground" />
                                    )}
                                    <div>
                                        <p className="text-xs font-bold text-foreground">
                                            {imageUploading ? "Processing..." : "Drag & drop or click to add images"}
                                        </p>
                                        <p className="text-[10px] text-muted-foreground">PNG, JPG, WEBP — Max 10 MB per image — No limit on count</p>
                                    </div>
                                </div>

                                {/* Hidden file inputs */}
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    className="hidden"
                                    onChange={(e) => {
                                        if (e.target.files?.length) handleImageFiles(e.target.files)
                                        e.target.value = ""
                                    }}
                                />
                                <input
                                    ref={cameraInputRef}
                                    type="file"
                                    accept="image/*"
                                    capture="environment"
                                    className="hidden"
                                    onChange={(e) => {
                                        if (e.target.files?.length) handleImageFiles(e.target.files)
                                        e.target.value = ""
                                    }}
                                />

                                {/* Action buttons */}
                                <div className="mt-2 flex gap-2">
                                    <button
                                        type="button"
                                        onClick={() => cameraInputRef.current?.click()}
                                        className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-secondary py-2 text-xs font-semibold text-secondary-foreground transition-colors hover:bg-secondary/80"
                                    >
                                        <Camera className="h-3.5 w-3.5" />
                                        Take Photo
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-secondary py-2 text-xs font-semibold text-secondary-foreground transition-colors hover:bg-secondary/80"
                                    >
                                        <ImageIcon className="h-3.5 w-3.5" />
                                        Browse Files
                                    </button>
                                </div>

                                {/* URL fallback */}
                                <details className="mt-3">
                                    <summary className="cursor-pointer text-[10px] font-semibold text-muted-foreground hover:text-foreground">
                                        Or paste an image URL instead
                                    </summary>
                                    <input
                                        type="text"
                                        placeholder="https://example.com/image.jpg"
                                        className="mt-1.5 w-full rounded-xl border border-border bg-background px-4 py-2 text-xs outline-none focus:border-primary"
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") {
                                                e.preventDefault()
                                                const val = (e.target as HTMLInputElement).value.trim()
                                                if (val) {
                                                    setForm((prev) => {
                                                        const imgs = [...(prev.images || []), val]
                                                        return { ...prev, images: imgs, image: prev.image === "/placeholder.svg?height=400&width=400" ? val : prev.image }
                                                    });
                                                    (e.target as HTMLInputElement).value = ""
                                                }
                                            }
                                        }}
                                    />
                                    <p className="mt-0.5 text-[9px] text-muted-foreground">Press Enter to add</p>
                                </details>
                            </div>

                            {/* Description */}
                            <div>
                                <label className="mb-1 block text-xs font-bold text-muted-foreground">Description</label>
                                <textarea
                                    value={form.description || ""}
                                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                                    rows={3}
                                    className="w-full resize-none rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary"
                                    placeholder="Describe your product..."
                                />
                            </div>

                            {/* Colors */}
                            <div>
                                <label className="mb-1 block text-xs font-bold text-muted-foreground">Colors</label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={colorInput}
                                        onChange={(e) => setColorInput(e.target.value)}
                                        onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addColor())}
                                        className="flex-1 rounded-xl border border-border bg-background px-4 py-2 text-sm outline-none focus:border-primary"
                                        placeholder="Add a color"
                                    />
                                    <button onClick={addColor} className="rounded-xl bg-secondary px-3 text-sm font-bold text-secondary-foreground">
                                        Add
                                    </button>
                                </div>
                                {form.colors && form.colors.length > 0 && (
                                    <div className="mt-2 flex flex-wrap gap-1.5">
                                        {form.colors.map((c) => (
                                            <span key={c} className="flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary">
                                                {c}
                                                <button onClick={() => removeColor(c)} className="text-primary/60 hover:text-primary">
                                                    <X className="h-3 w-3" />
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Sizes */}
                            <div>
                                <label className="mb-1 block text-xs font-bold text-muted-foreground">Sizes</label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={sizeInput}
                                        onChange={(e) => setSizeInput(e.target.value)}
                                        onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSize())}
                                        className="flex-1 rounded-xl border border-border bg-background px-4 py-2 text-sm outline-none focus:border-primary"
                                        placeholder="e.g. 5cm"
                                    />
                                    <button onClick={addSize} className="rounded-xl bg-secondary px-3 text-sm font-bold text-secondary-foreground">
                                        Add
                                    </button>
                                </div>
                                {form.sizes && form.sizes.length > 0 && (
                                    <div className="mt-2 flex flex-wrap gap-1.5">
                                        {form.sizes.map((s) => (
                                            <span key={s} className="flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-[11px] font-semibold text-secondary-foreground">
                                                {s}
                                                <button onClick={() => removeSize(s)} className="text-muted-foreground hover:text-foreground">
                                                    <X className="h-3 w-3" />
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* In Stock toggle */}
                            <label className="flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    checked={form.inStock ?? true}
                                    onChange={(e) => setForm({ ...form, inStock: e.target.checked })}
                                    className="h-4 w-4 rounded accent-primary"
                                />
                                <span className="text-sm font-semibold text-foreground">In Stock</span>
                            </label>
                        </div>

                        {/* Actions */}
                        <div className="mt-6 flex gap-3">
                            <button
                                onClick={handleSave}
                                className="flex-1 rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90"
                            >
                                {editingId ? "Save Changes" : "Add Product"}
                            </button>
                            <button
                                onClick={() => setShowForm(false)}
                                className="rounded-xl bg-secondary px-6 py-3 text-sm font-bold text-secondary-foreground transition-colors hover:bg-secondary/80"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
