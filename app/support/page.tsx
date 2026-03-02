import Link from "next/link"
import { PageLayout } from "@/components/page-layout"
import { Button } from "@/components/ui/button"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  Instagram,
  MessageCircle,
  HelpCircle,
  Package,
  CreditCard,
  Sparkles,
  RotateCcw,
} from "lucide-react"

const faqs = [
  {
    q: "How do I place an order?",
    a: "You can browse our shop, add items to your cart, and checkout directly on the website. Alternatively, DM us on Instagram @st4rrymoon or message us on WhatsApp to place an order.",
  },
  {
    q: "How long does shipping take?",
    a: "Standard orders ship within 3-5 business days. Custom orders may take 5-7 business days as each piece is handcrafted. We ship across India.",
  },
  {
    q: "Can I get a custom design?",
    a: "Absolutely! Use our Customization page to build your own bracelet, or simply describe your dream design via DM. We love bringing your ideas to life.",
  },
  {
    q: "What if my jewelry breaks?",
    a: "We offer free restringing within the first 3 months. After that, we charge a small fee. Just DM us on Instagram with a photo and we will sort it out.",
  },
  {
    q: "Do you accept returns?",
    a: "Since each piece is handmade, we do not accept returns. However, we are happy to exchange if there is a defect or sizing issue. Contact us within 7 days of receiving your order.",
  },
  {
    q: "What payment methods do you accept?",
    a: "We accept Cash on Delivery and UPI/online payments. Payment details are shared via WhatsApp after order placement.",
  },
  {
    q: "How do I track my order?",
    a: "Once shipped, you will receive tracking details via WhatsApp. You can also DM us anytime for an update.",
  },
  {
    q: "Is shipping free?",
    a: "Shipping is free on orders above \u20B9499. For orders below that, a flat shipping charge of \u20B949 applies.",
  },
]

const contactMethods = [
  {
    icon: Instagram,
    title: "Instagram DM",
    description: "The fastest way to reach us. DM @st4rrymoon for orders, queries, or just to say hi!",
    href: "https://www.instagram.com/st4rrymoon/",
    label: "Open Instagram",
  },
  {
    icon: MessageCircle,
    title: "WhatsApp",
    description: "Message us on WhatsApp for quick responses and order updates.",
    href: "https://wa.me/",
    label: "Open WhatsApp",
  },
]

export default function SupportPage() {
  return (
    <PageLayout>
      <div className="mx-auto max-w-4xl px-4 py-8 lg:px-8 lg:py-16">
        {/* Header */}
        <div className="mb-12 text-center">
          <p className="mb-2 text-xs font-bold uppercase tracking-widest text-primary">
            Support
          </p>
          <h1 className="font-serif text-3xl font-bold text-foreground md:text-4xl">
            How can we help?
          </h1>
          <p className="mx-auto mt-3 max-w-md text-pretty text-sm leading-relaxed text-muted-foreground">
            Got a question? Check our FAQs below or reach out directly. We are always happy to help.
          </p>
        </div>

        {/* Contact cards */}
        <div className="mb-12 grid gap-4 sm:grid-cols-2">
          {contactMethods.map((method) => (
            <div key={method.title} className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-card p-6 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary">
                <method.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-sm font-bold text-card-foreground">{method.title}</h3>
              <p className="text-xs leading-relaxed text-muted-foreground">{method.description}</p>
              <Button
                asChild
                className="rounded-full bg-primary text-xs text-primary-foreground hover:bg-primary/90"
              >
                <a href={method.href} target="_blank" rel="noopener noreferrer">
                  {method.label}
                </a>
              </Button>
            </div>
          ))}
        </div>

        {/* FAQ section */}
        <div>
          <h2 className="mb-6 flex items-center justify-center gap-2 font-serif text-2xl font-bold text-foreground">
            <HelpCircle className="h-5 w-5 text-primary" />
            Frequently Asked Questions
          </h2>
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, i) => (
              <AccordionItem key={i} value={`faq-${i}`} className="border-border">
                <AccordionTrigger className="text-sm font-bold text-foreground hover:text-primary text-left">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-xs leading-relaxed text-muted-foreground">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        {/* Quick links */}
        <div className="mt-12 grid gap-3 sm:grid-cols-4">
          {[
            { icon: Package, label: "Track Order", text: "DM on Insta" },
            { icon: RotateCcw, label: "Exchanges", text: "Within 7 days" },
            { icon: Sparkles, label: "Custom Orders", text: "DM to start" },
            { icon: CreditCard, label: "Payments", text: "COD & UPI" },
          ].map((item) => (
            <div key={item.label} className="flex flex-col items-center gap-1.5 rounded-xl border border-border bg-secondary/30 p-4 text-center">
              <item.icon className="h-4 w-4 text-primary" />
              <span className="text-xs font-bold text-card-foreground">{item.label}</span>
              <span className="text-[10px] text-muted-foreground">{item.text}</span>
            </div>
          ))}
        </div>
      </div>
    </PageLayout>
  )
}
