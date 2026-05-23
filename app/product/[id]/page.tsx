import { getProducts } from "@/lib/dashboard-store"
import ProductClient from "./product-client"
import { Metadata } from "next"

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const products = await getProducts()
  const product = products.find((p) => p.id === id)

  if (!product) {
    return {
      title: "Product Not Found",
      description: "The product you are looking for does not exist.",
    }
  }

  const title = product.name
  const description = product.description || `Buy ${product.name} — handmade glass bead jewelry from Starrymoon. Made with love in India.`
  const image = product.images?.[0] || '/og-image.jpg'

  return {
    title,
    description,
    alternates: { canonical: `https://starrymoon.in/product/${id}` },
    openGraph: {
      title: `${product.name} | Starrymoon`,
      description,
      url: `https://starrymoon.in/product/${id}`,
      images: [{ url: image, width: 800, height: 800, alt: product.name }],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${product.name} | Starrymoon`,
      description,
      images: [image],
    },
  }
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const products = await getProducts()
  const product = products.find((p) => p.id === id)

  // JSON-LD Product schema
  const jsonLd = product ? {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description || `Handmade beaded jewelry by Starrymoon`,
    image: product.images?.[0] || 'https://starrymoon.in/og-image.jpg',
    url: `https://starrymoon.in/product/${id}`,
    brand: { "@type": "Brand", name: "Starrymoon" },
    offers: {
      "@type": "Offer",
      priceCurrency: "INR",
      price: product.price,
      availability: product.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      seller: { "@type": "Organization", name: "Starrymoon" },
    },
  } : null

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <ProductClient id={id} initialProducts={products} />
    </>
  )
}

