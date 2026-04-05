"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import {
  Menu,
  X,
  ShoppingBag,
  Heart,
  Home,
  Store,
  Sparkles,
  Droplets,
  Info,
  HeadphonesIcon,
  ChevronDown,
  UserCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCart } from "@/lib/cart-context"
import { useAuth } from "@/lib/auth-context"

const shopCategories = [
  { label: "All Products", href: "/shop" },
  { label: "Bracelets", href: "/shop?category=Bracelets" },
  { label: "Necklaces", href: "/shop?category=Necklaces" },
  { label: "Phone Charms", href: "/shop?category=Phone+Charms" },
  { label: "Key Chains", href: "/shop?category=Key+Chains" },
  { label: "Hair Clips", href: "/shop?category=Hair+Clips" },
]

const navLinks = [
  { label: "Home", href: "/", icon: Home },
  { label: "Shop", href: "/shop", icon: Store, hasDropdown: true },
  { label: "Customization", href: "/customize", icon: Sparkles },
  { label: "Care & Maintenance", href: "/care", icon: Droplets },
  { label: "About", href: "/about", icon: Info },
  { label: "Support", href: "/support", icon: HeadphonesIcon },
]

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [shopOpen, setShopOpen] = useState(false)
  const pathname = usePathname()
  const { itemCount, openCart } = useCart()
  const { user } = useAuth()

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card/90 backdrop-blur-lg">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/WhatsApp%20Image%202026-02-19%20at%2023.02.22%20%281%29-p2RkRsGEwMqFoSLVEFVzaUpp6WWpyx.jpeg"
            alt="Starrymoon mascot"
            width={40}
            height={40}
            className="rounded-full"
            style={{ width: "40px", height: "auto" }}
          />
          <span className="font-serif text-xl font-bold tracking-tight text-foreground">
            Starrymoon
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-1 lg:flex" aria-label="Main navigation">
          {navLinks.map((link) => {
            const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href))
            return (
              <div key={link.label} className="relative">
                {link.hasDropdown ? (
                  <div
                    className="relative"
                    onMouseEnter={() => setShopOpen(true)}
                    onMouseLeave={() => setShopOpen(false)}
                  >
                    <Link
                      href={link.href}
                      className={`flex items-center gap-1 rounded-full px-3 py-2 text-sm font-semibold transition-colors ${
                        isActive
                          ? "bg-secondary text-secondary-foreground"
                          : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                      }`}
                    >
                      <link.icon className="h-3.5 w-3.5" />
                      {link.label}
                      <ChevronDown className="h-3 w-3" />
                    </Link>

                    {/* Dropdown */}
                    {shopOpen && (
                      <div className="absolute left-0 top-full z-50 pt-1">
                        <div className="min-w-[180px] rounded-xl border border-border bg-card p-1.5 shadow-lg shadow-primary/5">
                          {shopCategories.map((cat) => (
                            <Link
                              key={cat.label}
                              href={cat.href}
                              className="block rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-secondary-foreground"
                              onClick={() => setShopOpen(false)}
                            >
                              {cat.label}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    href={link.href}
                    className={`flex items-center gap-1 rounded-full px-3 py-2 text-sm font-semibold transition-colors ${
                      isActive
                        ? "bg-secondary text-secondary-foreground"
                        : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                    }`}
                  >
                    <link.icon className="h-3.5 w-3.5" />
                    {link.label}
                  </Link>
                )}
              </div>
            )
          })}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-1">
          {/* Profile / Login */}
          <Link
            href={user ? "/profile" : "/login"}
            className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-primary"
            aria-label={user ? "My profile" : "Sign in"}
          >
            {user?.picture ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.picture} alt={user.name} className="h-6 w-6 rounded-full object-cover" />
            ) : (
              <UserCircle className="h-5 w-5" />
            )}
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-primary"
            aria-label="Wishlist"
          >
            <Heart className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="relative text-muted-foreground hover:text-primary"
            aria-label="Cart"
            onClick={openCart}
          >
            <ShoppingBag className="h-5 w-5" />
            {itemCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                {itemCount}
              </span>
            )}
          </Button>

          {/* Mobile menu toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-primary lg:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileOpen && (
        <nav className="border-t border-border bg-card px-4 pb-4 lg:hidden" aria-label="Mobile navigation">
          <ul className="flex flex-col gap-0.5 pt-2">
            {navLinks.map((link) => (
              <li key={link.label}>
                <Link
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors ${
                    pathname === link.href
                      ? "bg-secondary text-secondary-foreground"
                      : "text-muted-foreground hover:bg-secondary hover:text-secondary-foreground"
                  }`}
                >
                  <link.icon className="h-4 w-4" />
                  {link.label}
                </Link>
                {/* Mobile shop subcategories */}
                {link.hasDropdown && (
                  <ul className="ml-8 flex flex-col gap-0.5 pb-1">
                    {shopCategories.map((cat) => (
                      <li key={cat.label}>
                        <Link
                          href={cat.href}
                          onClick={() => setMobileOpen(false)}
                          className="block rounded-lg px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-secondary hover:text-secondary-foreground"
                        >
                          {cat.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  )
}
