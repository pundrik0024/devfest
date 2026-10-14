import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Trash2, Plus, Minus, ShoppingCart, CheckCircle, Loader2, AlertTriangle } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { SampleDataLabel, SampleDataBanner } from '../components/ui/SampleDataLabel'
import { useLang } from '../context/LangContext'
import { apiFetch } from '../lib/api'

export default function Cart() {
  const { t } = useLang()
  const { items, removeItem, updateQty, clearCart, total, sessionId } = useCart()
  const navigate = useNavigate()

  const [name, setName]       = useState('')
  const [phone, setPhone]     = useState('')
  const [address, setAddress] = useState('')
  const [placing, setPlacing] = useState(false)
  const [order, setOrder]     = useState(null)
  const [error, setError]     = useState('')

  const handlePlaceOrder = async () => {
    if (!name.trim() || !phone.trim() || !address.trim()) {
      setError('Please fill in all delivery details.')
      return
    }
    // First sync cart to backend
    for (const item of items) {
      await apiFetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId, product_id: item.product.id, qty: item.qty }),
      }).catch(() => {})
    }

    setPlacing(true)
    setError('')
    try {
      const res = await apiFetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId,
          delivery_name: name,
          delivery_phone: phone,
          delivery_address: address,
          payment_method: 'COD',
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || 'Order failed')
      setOrder(data)
      clearCart()
    } catch (e) {
      setError(e.message)
    } finally {
      setPlacing(false)
    }
  }

  // ── Order confirmed screen ──
  if (order) {
    return (
      <div className="max-w-lg mx-auto px-4 py-12 text-center">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-text-primary mb-2">Order Confirmed!</h1>
        <p className="text-sm text-text-muted mb-4">
          Order ID: <strong>{order.order_id}</strong>
        </p>
        <div className="card text-left mb-6">
          <p className="text-xs text-text-muted mb-3">
            {order.items?.length || 0} item(s) · Total: <strong>₹{order.total}</strong>
            <SampleDataLabel className="ml-2" />
          </p>
          <div className="flex items-center justify-between text-sm">
            <span className="text-text-muted">Payment:</span>
            <span className="font-semibold text-text-primary">{order.payment_method} — Cash on Delivery</span>
          </div>
          <div className="flex items-center justify-between text-sm mt-2">
            <span className="text-text-muted">Estimated delivery:</span>
            <span className="font-semibold text-green-600">{order.estimated_delivery}</span>
          </div>
        </div>
        <div className="flex gap-3 justify-center">
          <Link to="/shop" className="btn-green">Continue Shopping</Link>
          <Link to="/" className="btn-outline">Go Home</Link>
        </div>
        <p className="text-xxs text-text-muted mt-4">This is a demo order. No real payment processed. Sample data only.</p>
      </div>
    )
  }

  // ── Empty cart ──
  if (items.length === 0) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h1 className="text-xl font-bold text-text-primary mb-2">{t('cart.empty')}</h1>
        <p className="text-sm text-text-muted mb-6">Add some agri-inputs from the shop to get started.</p>
        <Link to="/shop" className="btn-green">Browse Shop</Link>
      </div>
    )
  }

  return (
    <div className="max-w-container mx-auto px-3 md:px-6 py-4 md:py-6">
      <h1 className="text-xl md:text-2xl font-bold text-text-primary mb-4">Your Cart</h1>
      <SampleDataBanner />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cart items */}
        <div className="lg:col-span-2 space-y-3">
          {items.map(item => (
            <div key={item.cart_item_id} className="card flex gap-4 items-center">
              <div className="w-14 h-14 bg-primary-50 rounded-lg flex items-center justify-center text-2xl shrink-0">
                {item.product.category === 'fungicide' ? '🍄' :
                 item.product.category === 'insecticide' ? '🐛' :
                 item.product.category === 'bio_fertiliser' ? '🌱' :
                 item.product.category === 'kit' ? '📦' : '🧪'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-text-primary leading-snug">{item.product.name}</p>
                <p className="text-xxs text-text-muted">{item.product.unit}</p>
                <p className="font-bold text-primary mt-1">₹{item.product.price}<SampleDataLabel className="ml-1" /></p>
              </div>
              {/* Qty controls */}
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={() => updateQty(item.cart_item_id, item.qty - 1)}
                  className="w-8 h-8 rounded-full border border-border flex items-center justify-center hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  aria-label="Decrease quantity">
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-6 text-center text-sm font-medium">{item.qty}</span>
                <button onClick={() => updateQty(item.cart_item_id, item.qty + 1)}
                  className="w-8 h-8 rounded-full border border-border flex items-center justify-center hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  aria-label="Increase quantity">
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="text-right shrink-0">
                <p className="font-bold text-text-primary text-sm">₹{item.product.price * item.qty}</p>
                <button onClick={() => removeItem(item.cart_item_id)}
                  className="text-red-400 hover:text-red-600 mt-1 p-1 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
                  aria-label={`Remove ${item.product.name}`}>
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Order summary + checkout */}
        <div className="space-y-4">
          {/* Summary card */}
          <div className="card">
            <h2 className="font-bold text-text-primary mb-3">Order Summary</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-text-muted">
                <span>Subtotal ({items.reduce((s, i) => s + i.qty, 0)} items)</span>
                <span>₹{total}<SampleDataLabel className="ml-1" /></span>
              </div>
              <div className="flex justify-between text-text-muted">
                <span>Delivery</span><span className="text-green-600">Free</span>
              </div>
              <div className="border-t border-border pt-2 flex justify-between font-bold text-text-primary">
                <span>Total</span><span>₹{total}</span>
              </div>
            </div>
          </div>

          {/* Delivery form */}
          <div className="card">
            <h2 className="font-bold text-text-primary mb-3">Delivery Details</h2>
            <div className="space-y-3">
              <input placeholder="Full name" value={name} onChange={e => setName(e.target.value)}
                className="input text-sm" aria-label="Full name" />
              <input placeholder="Mobile number" value={phone} onChange={e => setPhone(e.target.value)}
                type="tel" className="input text-sm" aria-label="Mobile number" />
              <textarea placeholder="Full address with village / town, district" value={address}
                onChange={e => setAddress(e.target.value)} rows={3}
                className="input text-sm resize-none" aria-label="Delivery address" />
            </div>

            <div className="mt-3 flex items-center gap-2 text-xs bg-primary-50 rounded-lg px-3 py-2">
              <span>💵</span>
              <span className="font-medium text-primary">{t('cart.cod')} — Pay at your door</span>
            </div>

            {error && (
              <div className="mt-3 flex items-start gap-2 text-xs text-red-700 bg-red-50 rounded-lg p-3">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" /> {error}
              </div>
            )}

            <button onClick={handlePlaceOrder} disabled={placing} className="btn-primary w-full mt-4">
              {placing ? <><Loader2 className="w-4 h-4 animate-spin" /> Placing order…</> : `Place Order — ₹${total}`}
            </button>
            <p className="text-xxs text-text-muted text-center mt-2">
              Demo only · No real payment · Sample data
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
