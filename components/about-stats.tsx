"use client"

import { useInstagramFollowers } from "@/lib/use-instagram-followers"

/**
 * Stats card for the About page with live Instagram follower count.
 */
export function AboutStats() {
  const followers = useInstagramFollowers()

  return (
    <div className="rounded-xl border border-border bg-card p-5 sm:rounded-2xl sm:p-8">
      <div className="grid grid-cols-2 gap-4 text-center md:flex md:flex-row md:items-center md:justify-around md:gap-8">
        <div>
          <p className="text-3xl font-bold text-foreground">{followers}</p>
          <p className="text-xs font-medium text-muted-foreground">Instagram Fam</p>
        </div>
        <div className="hidden h-12 w-px bg-border md:block" />
        <div>
          <p className="text-3xl font-bold text-foreground">1,000+</p>
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
  )
}
