import { Metadata } from "next"
import { Navbar } from "@/components/navbar"
import { MarqueeBanner } from "@/components/marquee-banner"
import { Hero } from "@/components/hero"
import { ProductsSection } from "@/components/products-section"
import { CustomOrderSection } from "@/components/custom-order-section"
import { InstagramSection } from "@/components/instagram-section"
import { AboutSection } from "@/components/about-section"
import { Footer } from "@/components/footer"
import { CartSidebar } from "@/components/cart-sidebar"
import { getProducts } from "@/lib/dashboard-store"

export const metadata: Metadata = {
  alternates: { canonical: 'https://starrymoon.in' },
}

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: "Starrymoon",
  description: "Handmade beaded bracelets, necklaces, phone charms and more. Cute, aesthetic jewelry for teens — made with love in India.",
  url: "https://starrymoon.in",
  logo: "https://starrymoon.in/icon.svg",
  image: "https://starrymoon.in/og-image.jpg",
  priceRange: "₹₹",
  currenciesAccepted: "INR",
  paymentAccepted: "Cash, Credit Card, UPI",
  address: {
    "@type": "PostalAddress",
    addressCountry: "IN",
  },
  sameAs: [
    "https://instagram.com/starrymoon.in",
  ],
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Handmade Jewelry",
    itemListElement: [
      { "@type": "Offer", itemOffered: { "@type": "Product", name: "Beaded Bracelets" } },
      { "@type": "Offer", itemOffered: { "@type": "Product", name: "Necklaces" } },
      { "@type": "Offer", itemOffered: { "@type": "Product", name: "Phone Charms" } },
    ],
  },
}

export default async function Home() {
  const products = await getProducts()

  return (
    <div className="relative min-h-screen">
      {/* JSON-LD structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Pink gingham background overlay */}
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.04]"
        style={{
          backgroundImage: `url("https://hebbkx1anhila5yf.public.blob.vercel-storage.com/WhatsApp%20Image%202026-02-19%20at%2022.53.07-gaeq0AehSWWXfYKljSMyQ3WupoBcFa.jpeg")`,
          backgroundSize: "300px",
          backgroundRepeat: "repeat",
        }}
        aria-hidden="true"
      />

      <div className="relative z-10">
        <Navbar />
        <MarqueeBanner />
        <main>
          <Hero />
          <ProductsSection initialProducts={products} />
          <CustomOrderSection />
          <AboutSection />
          <InstagramSection />
        </main>
        <Footer />
      </div>

      <CartSidebar />
    </div>
  )
}

