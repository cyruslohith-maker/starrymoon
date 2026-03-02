import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Instagram } from "lucide-react"

export function InstagramSection() {
  return (
    <section className="relative mx-auto max-w-7xl px-4 py-16 lg:px-8 lg:py-24">
      <div className="flex flex-col items-center gap-10 md:flex-row md:gap-16">
        {/* Left - QR card */}
        <div className="flex w-full max-w-xs flex-col items-center">
          <div className="overflow-hidden rounded-3xl border border-border bg-card p-2 shadow-lg shadow-primary/10">
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/WhatsApp%20Image%202026-02-19%20at%2023.36.26-Jkj1I7ITjh7uOGKjJCDhTd8QVJqUpD.jpeg"
              alt="Scan to follow @st4rrymoon on Instagram"
              width={320}
              height={380}
              className="rounded-2xl"
            />
          </div>
        </div>

        {/* Right - Info */}
        <div className="flex flex-1 flex-col items-center text-center md:items-start md:text-left">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-secondary">
            <Instagram className="h-5 w-5 text-primary" />
          </div>
          <p className="mb-2 text-xs font-bold uppercase tracking-widest text-primary">
            Follow us
          </p>
          <h2 className="font-serif text-3xl font-bold text-foreground md:text-4xl">
            Join the St4rrymoon fam
          </h2>
          <p className="mt-3 max-w-md text-pretty text-sm leading-relaxed text-muted-foreground">
            Follow @st4rrymoon on Instagram for new drops, behind-the-scenes crafting, giveaways, and customer features. Be part of our sparkly community!
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Button
              asChild
              size="lg"
              className="rounded-full bg-primary px-8 text-primary-foreground shadow-lg shadow-primary/30 hover:bg-primary/90"
            >
              <a
                href="https://www.instagram.com/st4rrymoon/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Instagram className="mr-2 h-4 w-4" />
                Follow @st4rrymoon
              </a>
            </Button>
          </div>

          {/* Fun stats */}
          <div className="mt-8 grid grid-cols-3 gap-6">
            <div>
              <p className="text-xl font-bold text-foreground">1,153</p>
              <p className="text-[10px] font-medium text-muted-foreground">Followers</p>
            </div>
            <div>
              <p className="text-xl font-bold text-foreground">Daily</p>
              <p className="text-[10px] font-medium text-muted-foreground">New Posts</p>
            </div>
            <div>
              <p className="text-xl font-bold text-foreground">100%</p>
              <p className="text-[10px] font-medium text-muted-foreground">Aesthetic</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
