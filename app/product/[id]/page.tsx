import { getProducts } from "@/lib/dashboard-store"
import ProductClient from "./product-client"
import { Metadata } from "next"

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const products = await getProducts()
  const product = products.find((p) => p.id === id)

  if (!product) {
    return {
      title: "Product Not Found | Starrymoon",
      description: "The product you are looking for does not exist.",
    }
  }

  return {
    title: `${product.name} | Starrymoon`,
    description: product.description || `Buy ${product.name} handmade glass bead jewelry from Starrymoon.`,
  }
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const products = await getProducts()
  
  return <ProductClient id={id} initialProducts={products} />
}
