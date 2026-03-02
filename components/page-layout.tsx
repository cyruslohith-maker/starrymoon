import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { CartSidebar } from "@/components/cart-sidebar"

export function PageLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen">
      <Navbar />
      <main>{children}</main>
      <Footer />
      <CartSidebar />
    </div>
  )
}
