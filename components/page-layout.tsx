import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { CartSidebar } from "@/components/cart-sidebar"

export function PageLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen">
      <Navbar />
      <main className="bg-container-soft rounded-3xl mx-4 lg:mx-8 my-4">{children}</main>
      <Footer />
      <CartSidebar />
    </div>
  )
}
