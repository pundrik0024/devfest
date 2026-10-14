import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { LangProvider } from './context/LangContext'
import { CartProvider } from './context/CartContext'
import TopBar from './components/layout/TopBar'
import Header from './components/layout/Header'
import MainNav from './components/layout/MainNav'
import BottomTabs from './components/layout/BottomTabs'
import Footer from './components/layout/Footer'

import Home from './pages/Home'
import CropDoctor from './pages/CropDoctor'
import Shop from './pages/Shop'
import SoilPlan from './pages/SoilPlan'
import Prices from './pages/Prices'
import Alerts from './pages/Alerts'
import LakeWatch from './pages/LakeWatch'
import Dashboard from './pages/Dashboard'
import MyFarm from './pages/MyFarm'
import Cart from './pages/Cart'

function Layout() {
  const { pathname } = useLocation()
  // Full-bleed pages (no extra padding needed)
  const noFooter = false

  return (
    <div className="flex flex-col min-h-screen">
      <TopBar />
      <Header />
      <MainNav />
      <main className="flex-1 pb-20 md:pb-0">
        <Routes>
          <Route path="/"           element={<Home />} />
          <Route path="/crop-doctor" element={<CropDoctor />} />
          <Route path="/shop"       element={<Shop />} />
          <Route path="/soil-plan"  element={<SoilPlan />} />
          <Route path="/prices"     element={<Prices />} />
          <Route path="/alerts"     element={<Alerts />} />
          <Route path="/lake-watch" element={<LakeWatch />} />
          <Route path="/dashboard"  element={<Dashboard />} />
          <Route path="/my-farm"    element={<MyFarm />} />
          <Route path="/cart"       element={<Cart />} />
          <Route path="*"           element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
      <BottomTabs />
    </div>
  )
}

function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-64 gap-4 text-text-muted">
      <span className="text-5xl">🌿</span>
      <p className="text-lg font-semibold">Page not found</p>
      <a href="/" className="btn-green">Go Home</a>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <LangProvider>
        <CartProvider>
          <Layout />
        </CartProvider>
      </LangProvider>
    </BrowserRouter>
  )
}
