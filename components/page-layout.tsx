import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { CartSidebar } from "@/components/cart-sidebar"

export function PageLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen">
      <Navbar />
      <main className="bg-container-soft rounded-2xl mx-2 my-2 sm:rounded-3xl sm:mx-4 lg:mx-8 sm:my-4">{children}</main>
      <Footer />
      <CartSidebar />
    </div>
  )
}
