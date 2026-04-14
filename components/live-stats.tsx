"use client"

import { useInstagramFollowers } from "@/lib/use-instagram-followers"

export function LiveStats() {
  const followers = useInstagramFollowers()

  return (
    <div className="mt-8 flex items-center gap-6 text-center sm:mt-12 sm:gap-8 md:gap-12">
      <div>
        <p className="text-2xl font-bold text-foreground md:text-3xl">{followers}</p>
        <p className="text-xs font-medium text-muted-foreground">Instagram Fam</p>
      </div>
      <div className="h-8 w-px bg-border" />
      <div>
        <p className="text-2xl font-bold text-foreground md:text-3xl">1,000+</p>
        <p className="text-xs font-medium text-muted-foreground">Happy Customers</p>
      </div>
      <div className="h-8 w-px bg-border" />
      <div>
        <p className="text-2xl font-bold text-foreground md:text-3xl">100%</p>
        <p className="text-xs font-medium text-muted-foreground">Handmade</p>
      </div>
    </div>
  )
}
