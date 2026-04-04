import Image from "next/image"
import { PageLayout } from "@/components/page-layout"
import {
  Droplets,
  Sun,
  Wind,
  Sparkles,
  ShieldCheck,
  Heart,
} from "lucide-react"

const careSteps = [
  {
    icon: Droplets,
    title: "Keep it dry",
    description:
      "Remove your jewelry before washing hands, showering, swimming, or exercising. Water can weaken the thread and dull the beads.",
  },
  {
    icon: Sun,
    title: "Avoid direct sunlight",
    description:
      "Prolonged sun exposure can fade bead colors. Store in a shaded, cool spot when not wearing.",
  },
  {
    icon: Wind,
    title: "No perfume or lotion",
    description:
      "Spray perfume and apply lotion before putting on your jewelry. Chemicals can damage the finish on beads and charms.",
  },
  {
    icon: Sparkles,
    title: "Gentle cleaning",
    description:
      "Wipe with a soft, dry microfiber cloth. For stubborn spots, use a barely damp cloth and dry immediately.",
  },
  {
    icon: ShieldCheck,
    title: "Store it safe",
    description:
      "Keep each piece in a soft pouch or the original packaging. Avoid tossing pieces together to prevent scratching.",
  },
  {
    icon: Heart,
    title: "Handle with love",
    description:
      "These are delicate, handmade pieces. Put them on gently and avoid pulling or stretching. Elastic has a natural lifespan - we are happy to restring for a small fee.",
  },
]

export default function CarePage() {
  return (
    <PageLayout>
      <div className="mx-auto max-w-4xl px-4 py-8 lg:px-8 lg:py-16">
        {/* Header */}
        <div className="mb-12 text-center">
          <p className="mb-2 text-xs font-bold uppercase tracking-widest text-primary">
            Care & Maintenance
          </p>
          <h1 className="font-serif text-3xl font-bold text-foreground md:text-4xl">
            Keep Your Sparkle Shining
          </h1>
          <p className="mx-auto mt-3 max-w-md text-pretty text-sm leading-relaxed text-muted-foreground">
            With a little love and care, your Starrymoon jewelry will stay beautiful for a long time.
            Here are our best tips.
          </p>
        </div>

        {/* Decorative heart */}
        <div className="mb-12 flex justify-center">
          <Image
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshot%202026-02-24%20at%2015.04.36-0vw83swZIvCsuqxJmcgzhLL5VWCte8.png"
            alt="Sparkling pink heart"
            width={120}
            height={120}
            style={{ width: "120px", height: "auto" }}
            className="animate-float"
          />
        </div>

        {/* Care steps grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {careSteps.map((step, i) => (
            <div
              key={step.title}
              className="rounded-2xl border border-border bg-card p-6 transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/5"
            >
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-secondary">
                <step.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="mb-2 text-sm font-bold text-card-foreground">{step.title}</h3>
              <p className="text-xs leading-relaxed text-muted-foreground">{step.description}</p>
            </div>
          ))}
        </div>

        {/* Extra note */}
        <div className="mt-12 rounded-2xl border border-primary/20 bg-secondary/50 p-6 text-center">
          <h3 className="mb-2 font-serif text-lg font-bold text-foreground">
            Need a repair?
          </h3>
          <p className="text-sm text-muted-foreground">
            If your piece breaks or the elastic stretches, DM us on Instagram @starrymoon.in.
            We offer free restringing for the first 3 months, and a small fee after that.
          </p>
        </div>
      </div>
    </PageLayout>
  )
}
