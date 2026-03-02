import { Navbar } from "@/components/navbar"
import { MarqueeBanner } from "@/components/marquee-banner"
import { Hero } from "@/components/hero"
import { ProductsSection } from "@/components/products-section"
import { CustomOrderSection } from "@/components/custom-order-section"
import { InstagramSection } from "@/components/instagram-section"
import { AboutSection } from "@/components/about-section"
import { Footer } from "@/components/footer"
import { CartSidebar } from "@/components/cart-sidebar"

export default function Home() {
  return (
    <div className="relative min-h-screen">
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
          <ProductsSection />
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
