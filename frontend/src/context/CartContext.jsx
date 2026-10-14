import { createContext, useContext, useState, useCallback, useEffect } from 'react'

const CartContext = createContext(null)

const SESSION_KEY = 'aravalli_session'
const CART_KEY = 'aravalli_cart'

function getSessionId() {
  let sid = localStorage.getItem(SESSION_KEY)
  if (!sid) {
    sid = `sess-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
    localStorage.setItem(SESSION_KEY, sid)
  }
  return sid
}

export function CartProvider({ children }) {
  const sessionId = getSessionId()
  const [items, setItems] = useState(() => {
    try { return JSON.parse(localStorage.getItem(CART_KEY) || '[]') } catch { return [] }
  })

  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(items))
  }, [items])

  const addItem = useCallback((product, qty = 1) => {
    setItems(prev => {
      const existing = prev.find(i => i.product.id === product.id)
      if (existing) {
        return prev.map(i => i.product.id === product.id ? { ...i, qty: i.qty + qty } : i)
      }
      return [...prev, { product, qty, cart_item_id: Date.now() }]
    })
  }, [])

  const removeItem = useCallback((cartItemId) => {
    setItems(prev => prev.filter(i => i.cart_item_id !== cartItemId))
  }, [])

  const updateQty = useCallback((cartItemId, qty) => {
    if (qty <= 0) {
      setItems(prev => prev.filter(i => i.cart_item_id !== cartItemId))
    } else {
      setItems(prev => prev.map(i => i.cart_item_id === cartItemId ? { ...i, qty } : i))
    }
  }, [])

  const clearCart = useCallback(() => setItems([]), [])

  const total = items.reduce((sum, i) => sum + i.product.price * i.qty, 0)
  const count = items.reduce((sum, i) => sum + i.qty, 0)

  return (
    <CartContext.Provider value={{ items, sessionId, addItem, removeItem, updateQty, clearCart, total, count }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used inside CartProvider')
  return ctx
}
