export interface Product {
  id: string
  name: string
  price: number
  image: string
  images?: string[]
  tag?: string
  category: string
  description?: string
  colors?: string[]
  sizes?: string[]
  inStock?: boolean
}

export const categories = [
  "All",
  "Bracelets",
  "Necklaces",
  "Phone Charms",
  "Key Chains",
  "Hair Clips",
] as const

export type Category = (typeof categories)[number]

export const products: Product[] = [
  {
    id: "1",
    name: "Sakura Dream Bracelet",
    price: 199,
    image: "/placeholder.svg?height=400&width=400",
    tag: "Bestseller",
    category: "Bracelets",
    description:
      "Delicate pink and white glass beads with cherry blossom charms. A dreamy bracelet for sakura lovers.",
    colors: ["Pink", "White"],
    sizes: ["5cm", "6cm", "7cm", "8cm", "9cm"],
    inStock: true,
  },
  {
    id: "2",
    name: "Moonlit Pearl Necklace",
    price: 349,
    image: "/placeholder.svg?height=400&width=400",
    tag: "New",
    category: "Necklaces",
    description:
      "Faux pearl beads with tiny silver moon charms. Elegant enough for everyday wear.",
    colors: ["White", "Silver"],
    sizes: ["14cm", "15cm"],
    inStock: true,
  },
  {
    id: "3",
    name: "Starry Night Phone Charm",
    price: 149,
    image: "/placeholder.svg?height=400&width=400",
    category: "Phone Charms",
    description:
      "Star and moon charms with iridescent beads. Clip it onto your phone case for instant sparkle.",
    colors: ["Blue", "Silver"],
    inStock: true,
  },
  {
    id: "4",
    name: "Butterfly Garden Bracelet",
    price: 249,
    image: "/placeholder.svg?height=400&width=400",
    tag: "Popular",
    category: "Bracelets",
    description:
      "Pastel butterfly charms woven between crystal clear beads. Nature-inspired cuteness.",
    colors: ["Pastel", "Clear"],
    sizes: ["5cm", "6cm", "7cm", "8cm"],
    inStock: true,
  },
  {
    id: "5",
    name: "Cotton Candy Key Chain",
    price: 129,
    image: "/placeholder.svg?height=400&width=400",
    category: "Key Chains",
    description:
      "Pink and blue beads that look good enough to eat! A sweet addition to your keys or bag.",
    colors: ["Pink", "Blue"],
    inStock: true,
  },
  {
    id: "6",
    name: "Rose Petal Hair Clip Set",
    price: 179,
    image: "/placeholder.svg?height=400&width=400",
    tag: "New",
    category: "Hair Clips",
    description:
      "Set of 3 beaded hair clips with rose-shaped charms. The prettiest way to style your hair.",
    colors: ["Pink", "Red"],
    inStock: true,
  },
  {
    id: "7",
    name: "Lavender Haze Bracelet",
    price: 219,
    image: "/placeholder.svg?height=400&width=400",
    category: "Bracelets",
    description:
      "Purple and lilac glass beads with silver star charms. Inspired by lavender fields and twilight skies.",
    colors: ["Purple", "Lilac"],
    sizes: ["5cm", "6cm", "7cm", "8cm", "9cm"],
    inStock: true,
  },
  {
    id: "8",
    name: "Cloud Nine Necklace",
    price: 399,
    image: "/placeholder.svg?height=400&width=400",
    category: "Necklaces",
    description:
      "White fluffy cloud charms with pastel rainbow beads. Wear your head in the clouds!",
    colors: ["White", "Pastel"],
    sizes: ["14cm", "15cm"],
    inStock: true,
  },
  {
    id: "9",
    name: "Daisy Chain Bracelet",
    price: 189,
    image: "/placeholder.svg?height=400&width=400",
    tag: "Popular",
    category: "Bracelets",
    description:
      "Tiny daisy charms linked with yellow and white seed beads. Spring vibes all year round.",
    colors: ["Yellow", "White"],
    sizes: ["5cm", "6cm", "7cm", "8cm"],
    inStock: true,
  },
  {
    id: "10",
    name: "Heart Throb Phone Charm",
    price: 159,
    image: "/placeholder.svg?height=400&width=400",
    category: "Phone Charms",
    description:
      "Red and pink heart charms with sparkly crystal beads. Show your phone some love.",
    colors: ["Red", "Pink"],
    inStock: true,
  },
  {
    id: "11",
    name: "Ocean Breeze Key Chain",
    price: 139,
    image: "/placeholder.svg?height=400&width=400",
    category: "Key Chains",
    description:
      "Blue and turquoise beads with tiny shell charms. Carry the ocean wherever you go.",
    colors: ["Blue", "Turquoise"],
    inStock: true,
  },
  {
    id: "12",
    name: "Sparkle Bow Hair Clip",
    price: 149,
    image: "/placeholder.svg?height=400&width=400",
    category: "Hair Clips",
    description:
      "Beaded bow-shaped clip with rhinestone accents. Add sparkle to any hairstyle.",
    colors: ["Pink", "Silver"],
    inStock: true,
  },
]
