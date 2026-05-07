import { Suspense } from "react"
import { getProducts } from "@/lib/dashboard-store"
import ShopClient from "./shop-client"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Shop All Products | Starrymoon",
  description: "Browse our entire collection of handmade glass bead jewelry, charms, and customizable pieces.",
}

export default async function ShopPage() {
  const products = await getProducts()
  
  return (
    <Suspense fallback={<div className="flex justify-center p-10">Loading products...</div>}>
      <ShopClient initialProducts={products} />
    </Suspense>
  )
}
