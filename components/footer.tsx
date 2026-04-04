import Link from "next/link"
import Image from "next/image"
import { Instagram, MessageCircle, Heart } from "lucide-react"

export function Footer() {
  return (
    <footer id="contact" className="border-t border-border bg-card">
      <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
        <div className="grid gap-10 md:grid-cols-3">
          {/* Brand */}
          <div className="flex flex-col items-center md:items-start">
            <Link href="/" className="mb-3 flex items-center gap-2">
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/WhatsApp%20Image%202026-02-19%20at%2023.02.22%20%281%29-p2RkRsGEwMqFoSLVEFVzaUpp6WWpyx.jpeg"
                alt="Starrymoon mascot"
                width={36}
                height={36}
                className="rounded-full"
              />
              <span className="font-serif text-lg font-bold text-foreground">
                Starrymoon
              </span>
            </Link>
            <p className="max-w-xs text-center text-xs leading-relaxed text-muted-foreground md:text-left">
              Handmade beaded jewelry crafted with love in India. Each piece as unique as you.
            </p>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col items-center md:items-start">
            <h4 className="mb-3 text-xs font-bold uppercase tracking-widest text-primary">
              Quick Links
            </h4>
            <ul className="flex flex-col items-center gap-2 md:items-start">
              {[
                { label: "Shop", href: "#shop" },
                { label: "Custom Order", href: "#custom" },
                { label: "About", href: "#about" },
                { label: "Instagram", href: "https://www.instagram.com/starrymoon.in/" },
              ].map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-primary"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Connect */}
          <div className="flex flex-col items-center md:items-start">
            <h4 className="mb-3 text-xs font-bold uppercase tracking-widest text-primary">
              Connect with us
            </h4>
            <div className="flex gap-3">
              <a
                href="https://www.instagram.com/starrymoon.in/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
                aria-label="Follow on Instagram"
              >
                <Instagram className="h-4 w-4" />
              </a>
              <a
                href="https://wa.me/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
                aria-label="Message on WhatsApp"
              >
                <MessageCircle className="h-4 w-4" />
              </a>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              DM us on Instagram or WhatsApp for orders and queries.
            </p>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 flex flex-col items-center gap-2 border-t border-border pt-6 text-center">
          <p className="flex items-center gap-1 text-xs text-muted-foreground">
            Made with <Heart className="h-3 w-3 fill-primary text-primary" /> by Pragya
          </p>
          <p className="text-[10px] text-muted-foreground">
            {"© 2026 Starrymoon. All rights reserved."}
          </p>
        </div>
      </div>
    </footer>
  )
}
