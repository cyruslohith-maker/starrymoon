import Image from "next/image"
import { Heart, Star, Shield } from "lucide-react"

const highlights = [
  {
    icon: Heart,
    title: "Handmade with love",
    description: "Every piece is carefully crafted by hand, bead by bead.",
  },
  {
    icon: Star,
    title: "Premium materials",
    description: "Glass beads, silver charms - only the best for our babes.",
  },
  {
    icon: Shield,
    title: "Quality promise",
    description: "Each piece goes through a quality check before shipping.",
  },
]

export function AboutSection() {
  return (
    <section id="about" className="bg-container-soft relative overflow-hidden rounded-3xl mx-4 lg:mx-8">
      <div className="mx-auto max-w-7xl px-4 py-16 lg:px-8 lg:py-24">
        <div className="flex flex-col items-center gap-10 md:flex-row md:gap-16">
          {/* Left: Image / heart */}
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

          {/* Right: Text */}
          <div className="flex flex-1 flex-col items-center text-center md:items-start md:text-left">
            <p className="mb-2 text-xs font-bold uppercase tracking-widest text-primary">
              About Starrymoon
            </p>
            <h2 className="font-serif text-3xl font-bold text-foreground md:text-4xl">
              {"Hi, I'm Pragya!"}
            </h2>
            <p className="mt-3 max-w-md text-pretty text-sm leading-relaxed text-muted-foreground">
              I started Starrymoon from my room with a box of beads and a dream. 
              Every bracelet, necklace, and charm is handcrafted by me with love, care, and a whole lot of pink.
              My mission is to make jewelry that makes you smile every time you look at your wrist.
            </p>

            <div className="mt-8 flex flex-col gap-5">
              {highlights.map((h) => (
                <div key={h.title} className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary">
                    <h.icon className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-foreground">{h.title}</h3>
                    <p className="text-xs leading-relaxed text-muted-foreground">{h.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
