import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Heart, Sparkles, ShoppingBag } from "lucide-react"

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* Background aura */}
      <div className="absolute inset-0 z-0">
        <Image
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/WhatsApp%20Image%202026-02-19%20at%2023.31.31-RZi7cwnxEvYD7PyPn2FYd7ln0EOVgP.jpeg"
          alt=""
          fill
          className="object-cover opacity-60"
          priority
        />
      </div>

      <div className="relative z-10 mx-auto flex max-w-7xl flex-col items-center px-4 py-16 text-center lg:px-8 lg:py-28">
        {/* Mascot */}
        <div className="mb-6 animate-float">
          <Image
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/WhatsApp%20Image%202026-02-19%20at%2023.02.22%20%281%29-p2RkRsGEwMqFoSLVEFVzaUpp6WWpyx.jpeg"
            alt="Starrymoon cute mascot"
            width={100}
            height={100}
            className="rounded-full shadow-lg shadow-primary/30"
            style={{ width: "100px", height: "auto" }}
            priority
          />
        </div>

        {/* Badge */}
        <div className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-card/80 px-4 py-1.5 text-xs font-bold text-secondary-foreground shadow-sm backdrop-blur-sm">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          Handmade with love in India
        </div>

        {/* Heading */}
        <h1 className="mb-4 max-w-2xl text-balance font-serif text-4xl font-bold leading-tight text-foreground md:text-5xl lg:text-6xl">
          Design Your{" "}
          <span className="text-primary">Sparkle</span>
        </h1>

        {/* Subheading */}
        <p className="mb-8 max-w-md text-pretty text-base leading-relaxed text-muted-foreground md:text-lg">
          Handcrafted beaded bracelets, necklaces, phone charms and more.
          Each piece made uniquely for you.
        </p>

        {/* CTA buttons */}
        <div className="flex flex-col items-center gap-3 sm:flex-row">
          <Button asChild size="lg" className="rounded-full bg-primary px-8 text-primary-foreground shadow-lg shadow-primary/30 hover:bg-primary/90">
            <Link href="/customize">
              <Sparkles className="mr-2 h-4 w-4" />
              Customize
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="rounded-full border-primary/30 bg-card/60 text-secondary-foreground backdrop-blur-sm hover:bg-secondary">
            <Link href="/shop">
              <ShoppingBag className="mr-2 h-4 w-4" />
              Browse Collection
            </Link>
          </Button>
        </div>

        {/* Stats */}
        <div className="mt-12 flex items-center gap-8 text-center md:gap-12">
          <div>
            <p className="text-2xl font-bold text-foreground md:text-3xl">1,153+</p>
            <p className="text-xs font-medium text-muted-foreground">Instagram Fam</p>
          </div>
          <div className="h-8 w-px bg-border" />
          <div>
            <p className="text-2xl font-bold text-foreground md:text-3xl">500+</p>
            <p className="text-xs font-medium text-muted-foreground">Happy Customers</p>
          </div>
          <div className="h-8 w-px bg-border" />
          <div>
            <p className="text-2xl font-bold text-foreground md:text-3xl">100%</p>
            <p className="text-xs font-medium text-muted-foreground">Handmade</p>
          </div>
        </div>
      </div>

      {/* Chrome heart decoration */}
      <div className="absolute -right-8 bottom-8 hidden animate-float opacity-50 lg:block" style={{ animationDelay: "1s" }}>
        <Image
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshot%202026-02-24%20at%2015.04.36-0vw83swZIvCsuqxJmcgzhLL5VWCte8.png"
          alt=""
          width={120}
          height={120}
          style={{ width: "120px", height: "auto" }}
        />
      </div>
      <div className="absolute -left-6 top-20 hidden animate-float opacity-40 lg:block" style={{ animationDelay: "2.5s" }}>
        <Image
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshot%202026-02-24%20at%2015.04.36-0vw83swZIvCsuqxJmcgzhLL5VWCte8.png"
          alt=""
          width={80}
          height={80}
          style={{ width: "80px", height: "auto" }}
        />
      </div>
    </section>
  )
}
