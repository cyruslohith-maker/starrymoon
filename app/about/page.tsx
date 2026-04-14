import Image from "next/image"
import Link from "next/link"
import { PageLayout } from "@/components/page-layout"
import { Button } from "@/components/ui/button"
import { Heart, Star, Shield, Instagram, Sparkles } from "lucide-react"

const highlights = [
  {
    icon: Heart,
    title: "Handmade with love",
    description: "Every piece is carefully crafted by hand, bead by bead, in my little workspace.",
  },
  {
    icon: Star,
    title: "Premium materials",
    description: "Glass beads, silver charms, and strong elastic threads sourced for quality.",
  },
  {
    icon: Shield,
    title: "Quality promise",
    description: "Each piece goes through a quality check before shipping to ensure perfection.",
  },
  {
    icon: Sparkles,
    title: "Custom designs",
    description: "Your imagination is the limit. Tell me your dream design and I will bring it to life.",
  },
]

export default function AboutPage() {
  return (
    <PageLayout>
      <div className="mx-auto max-w-5xl px-3 py-6 sm:px-4 sm:py-8 lg:px-8 lg:py-16">
        {/* Hero section */}
        <div className="mb-10 flex flex-col items-center gap-6 sm:mb-16 md:flex-row md:gap-16">
          <div className="flex w-full max-w-xs flex-col items-center">
            <div className="animate-float">
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshot%202026-02-24%20at%2015.04.36-0vw83swZIvCsuqxJmcgzhLL5VWCte8.png"
                alt="Sparkling pink heart"
                width={240}
                height={240}
                style={{ width: "240px", height: "auto" }}
              />
            </div>
          </div>

          <div className="flex flex-1 flex-col items-center text-center md:items-start md:text-left">
            <p className="mb-2 text-xs font-bold uppercase tracking-widest text-primary">
              About Starrymoon
            </p>
            <h1 className="mb-4 font-serif text-2xl font-bold text-foreground sm:text-3xl md:text-4xl">
              {"Hi, I'm Pragya!"}
            </h1>
            <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
              I started Starrymoon from my room with a box of beads and a dream. What began as a fun hobby quickly
              turned into a passion project when my friends started asking me to make pieces for them too!
            </p>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
              Every bracelet, necklace, and charm is handcrafted by me with love, care, and a whole lot of pink.
              My mission is to make jewelry that makes you smile every time you look at your wrist.
              I believe that accessories should be as unique as the person wearing them.
            </p>
            <div className="mt-6 flex gap-3">
              <Button asChild className="rounded-full bg-primary text-sm text-primary-foreground hover:bg-primary/90">
                <Link href="/shop">
                  Shop Now
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="rounded-full border-primary/30 text-sm text-secondary-foreground hover:bg-secondary"
              >
                <a href="https://www.instagram.com/starrymoon.in/" target="_blank" rel="noopener noreferrer">
                  <Instagram className="mr-1 h-4 w-4" />
                  Follow
                </a>
              </Button>
            </div>
          </div>
        </div>

        {/* Highlights */}
        <div className="mb-10 sm:mb-16">
          <h2 className="mb-5 text-center font-serif text-xl font-bold text-foreground sm:mb-8 sm:text-2xl">
            Why Starrymoon?
          </h2>
          <div className="grid gap-6 sm:grid-cols-2">
            {highlights.map((h) => (
              <div key={h.title} className="flex items-start gap-3 rounded-xl border border-border bg-card p-3 sm:gap-4 sm:rounded-2xl sm:p-5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary">
                  <h.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="mb-1 text-sm font-bold text-card-foreground">{h.title}</h3>
                  <p className="text-xs leading-relaxed text-muted-foreground">{h.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="rounded-xl border border-border bg-card p-5 sm:rounded-2xl sm:p-8">
          <div className="grid grid-cols-2 gap-4 text-center md:flex md:flex-row md:items-center md:justify-around md:gap-8">
            <div>
              <p className="text-3xl font-bold text-foreground">1,153+</p>
              <p className="text-xs font-medium text-muted-foreground">Instagram Fam</p>
            </div>
            <div className="hidden h-12 w-px bg-border md:block" />
            <div>
              <p className="text-3xl font-bold text-foreground">500+</p>
              <p className="text-xs font-medium text-muted-foreground">Pieces Crafted</p>
            </div>
            <div className="hidden h-12 w-px bg-border md:block" />
            <div>
              <p className="text-3xl font-bold text-foreground">100%</p>
              <p className="text-xs font-medium text-muted-foreground">Handmade</p>
            </div>
            <div className="hidden h-12 w-px bg-border md:block" />
            <div>
              <p className="text-3xl font-bold text-foreground">5-15cm</p>
              <p className="text-xs font-medium text-muted-foreground">Size Range</p>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  )
}
