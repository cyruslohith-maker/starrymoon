"use client"

import { createContext, useContext, useState, useCallback, type ReactNode } from "react"
import type { Product } from "@/lib/data"

export interface CartItem {
  product: Product
  quantity: number
  size?: string
  customizationNote?: string
}

interface CartContextType {
  items: CartItem[]
  addItem: (product: Product, size?: string, customizationNote?: string) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  itemCount: number
  subtotal: number
  specialRequest: string
  setSpecialRequest: (value: string) => void
  isCartOpen: boolean
  openCart: () => void
  closeCart: () => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [specialRequest, setSpecialRequest] = useState("")
  const [isCartOpen, setIsCartOpen] = useState(false)

  const addItem = useCallback(
    (product: Product, size?: string, customizationNote?: string) => {
      setItems((prev) => {
        const existing = prev.find((i) => i.product.id === product.id && i.size === size)
        if (existing) {
          return prev.map((i) =>
            i.product.id === product.id && i.size === size
              ? { ...i, quantity: i.quantity + 1 }
              : i
          )
        }
        return [...prev, { product, quantity: 1, size: size || "7cm", customizationNote }]
      })
      setIsCartOpen(true)
    },
    []
  )

  const removeItem = useCallback((productId: string) => {
    setItems((prev) => prev.filter((i) => i.product.id !== productId))
  }, [])

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      setItems((prev) => prev.filter((i) => i.product.id !== productId))
    } else {
      setItems((prev) =>
        prev.map((i) => (i.product.id === productId ? { ...i, quantity } : i))
      )
    }
  }, [])

  const clearCart = useCallback(() => {
    setItems([])
    setSpecialRequest("")
  }, [])

  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0)
  const subtotal = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0)

  const openCart = useCallback(() => setIsCartOpen(true), [])
  const closeCart = useCallback(() => setIsCartOpen(false), [])

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        itemCount,
        subtotal,
        specialRequest,
        setSpecialRequest,
        isCartOpen,
        openCart,
        closeCart,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) throw new Error("useCart must be used within a CartProvider")
  return context
}
