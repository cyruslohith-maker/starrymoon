"use client"

import { Heart, Star, Sparkles } from "lucide-react"

const items = [
  { icon: Heart, text: "Handmade with love" },
  { icon: Star, text: "Glass beads & silver charms" },
  { icon: Sparkles, text: "Custom orders welcome" },
  { icon: Heart, text: "Free shipping above \u20B9499" },
  { icon: Star, text: "Sizes 5cm - 15cm" },
  { icon: Sparkles, text: "DM to order" },
]

export function MarqueeBanner() {
  return (
    <div className="overflow-hidden bg-primary py-2.5">
      <div className="flex animate-marquee items-center gap-8 whitespace-nowrap">
        {[...items, ...items].map((item, i) => (
          <span
            key={i}
            className="flex items-center gap-1.5 text-xs font-bold text-primary-foreground"
          >
            <item.icon className="h-3 w-3" />
            {item.text}
          </span>
        ))}
      </div>
      <style jsx>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 20s linear infinite;
          width: max-content;
        }
      `}</style>
    </div>
  )
}
