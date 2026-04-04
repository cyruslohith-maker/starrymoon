import { Button } from "@/components/ui/button"
import { Palette, Ruler, MessageCircle, Sparkles } from "lucide-react"

const steps = [
  {
    icon: Palette,
    title: "Pick your colors",
    description: "Choose from our range of glass beads in pinks, purples, whites, and more.",
  },
  {
    icon: Sparkles,
    title: "Select your charms",
    description: "Butterflies, stars, hearts, moons - pick charms that match your vibe.",
  },
  {
    icon: Ruler,
    title: "Choose your size",
    description: "From 5cm to 15cm. Standard size is 7cm for a perfect fit.",
  },
  {
    icon: MessageCircle,
    title: "Message us",
    description: "Send your dream design via WhatsApp and we'll make it happen!",
  },
]

export function CustomOrderSection() {
  const whatsappLink = `https://wa.me/?text=${encodeURIComponent(
    "Hi! I'd like to place a custom jewelry order with Starrymoon!"
  )}`

  return (
    <section
      id="custom"
      className="bg-container-deep relative overflow-hidden rounded-3xl mx-4 lg:mx-8"
    >
      <div className="mx-auto max-w-7xl px-4 py-16 lg:px-8 lg:py-24">
        <div className="mb-10 text-center">
          <p className="mb-2 text-xs font-bold uppercase tracking-widest text-white/80">
            Make it yours
          </p>
          <h2 className="font-serif text-3xl font-bold text-white md:text-4xl">
            Custom Jewelry Builder
          </h2>
          <p className="mx-auto mt-3 max-w-md text-pretty text-sm leading-relaxed text-white/80">
            {"Can't"} find exactly what you want? Describe your dream piece and {"we'll"} craft it just for you.
          </p>
        </div>

        {/* Steps */}
        <div className="mx-auto grid max-w-3xl gap-6 sm:grid-cols-2">
          {steps.map((step, i) => (
            <div
              key={step.title}
              className="relative flex flex-col items-center rounded-2xl border border-border bg-card/80 p-6 text-center shadow-sm backdrop-blur-sm"
            >
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-secondary">
                <step.icon className="h-5 w-5 text-primary" />
              </div>
              <span className="absolute -top-2.5 left-4 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                {i + 1}
              </span>
              <h3 className="mb-1.5 text-sm font-bold text-card-foreground">
                {step.title}
              </h3>
              <p className="text-xs leading-relaxed text-muted-foreground">
                {step.description}
              </p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-10 text-center">
          <Button
            asChild
            size="lg"
            className="rounded-full bg-primary px-8 text-primary-foreground shadow-lg shadow-primary/30 hover:bg-primary/90"
          >
            <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
              <MessageCircle className="mr-2 h-4 w-4" />
              Start your custom order
            </a>
          </Button>
        </div>
      </div>
    </section>
  )
}
