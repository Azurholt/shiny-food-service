// src/app/page.tsx
// Kueue - Main Landing Page

import { ChefHat, Phone, CheckCircle, Clock, CreditCard, MapPin, Smartphone, Shield, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      
      {/* ==================== HEADER ==================== */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <ChefHat className="w-8 h-8 text-yellow-600" />
            <span className="text-xl font-bold text-gray-900">Kueue</span>
          </div>
          <nav className="hidden md:flex gap-6">
            <a href="#how-it-works" className="text-gray-600 hover:text-yellow-600 font-medium">How It Works</a>
            <a href="#sellers" className="text-gray-600 hover:text-yellow-600 font-medium">For Sellers</a>
            <a href="#contact" className="text-gray-600 hover:text-yellow-600 font-medium">Contact</a>
          </nav>
          <Link 
            href="/seller/signup" 
            className="bg-green-700 text-white px-4 py-2 rounded-lg hover:bg-green-800 transition font-medium"
          >
            Join as Seller
          </Link>
        </div>
      </header>

      {/* ==================== HERO ==================== */}
      <section className="bg-gradient-to-br from-yellow-50 via-white to-green-50 py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm mb-6">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            <span className="text-sm text-gray-600">Now serving Kumasi</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Order Food. <span className="text-green-700">Know Your Turn.</span> <br className="hidden md:block" />
            Pick Up with Confidence.
          </h1>
          
          <p className="text-lg md:text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            No more waiting in uncertain queues. No more wasted food from cancelled orders. 
            Built for Kumasi's busy food sellers and hungry customers.
          </p>
          
          {/* Primary CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link 
              href="#categories" 
              className="bg-green-700 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-green-800 transition shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
            >
              🍽️ I'm a Customer <ArrowRight className="w-5 h-5" />
            </Link>
            <Link 
              href="/seller/signup" 
              className="bg-white text-green-700 border-2 border-green-700 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-green-50 transition flex items-center justify-center gap-2"
            >
              👨‍🍳 I'm a Seller
            </Link>
          </div>
          
          {/* Trust Badges */}
          <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-green-600" />
              <span>Secure Mobile Money Payments</span>
            </div>
            <div className="flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-green-600" />
              <span>Works on Any Phone</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span>No App Download Needed</span>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== HOW IT WORKS ==================== */}
      <section id="how-it-works" className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">
            How It Works for Customers
          </h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            Three simple steps to get your food without the stress
          </p>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="text-center p-6 bg-gray-50 rounded-2xl hover:shadow-md transition">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-yellow-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900">1. Browse Sellers</h3>
              <p className="text-gray-600">Find food sellers near you by category — shawarma, bread & egg, waakye, and more.</p>
            </div>
            
            {/* Step 2 */}
            <div className="text-center p-6 bg-gray-50 rounded-2xl hover:shadow-md transition">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CreditCard className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900">2. Pay to Secure Your Spot</h3>
              <p className="text-gray-600">Pay with MTN MoMo, Telecel Cash, or card. Your order is confirmed instantly.</p>
            </div>
            
            {/* Step 3 */}
            <div className="text-center p-6 bg-gray-50 rounded-2xl hover:shadow-md transition">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900">3. Get Code + Pick Up</h3>
              <p className="text-gray-600">Receive a 4-digit pickup code and see your position in the queue. Plan your journey!</p>
            </div>
          </div>
          
          {/* Queue Preview Mockup */}
          <div className="mt-12 bg-green-50 border-2 border-green-200 rounded-2xl p-6 max-w-md mx-auto">
            <p className="text-center text-green-800 font-semibold mb-3 flex items-center justify-center gap-2">
              <Phone className="w-5 h-5" /> Your Order Status
            </p>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-700 mb-1">You are #3 in queue</div>
              <p className="text-green-600">Ready in ~12 minutes</p>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== FOOD CATEGORIES ==================== */}
      <section id="categories" className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">
            Popular Food Categories
          </h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            Find your favorite Kumasi meals from trusted local sellers
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { icon: '🍳', name: 'Bread & Egg', sellers: 12 },
              { icon: '🌯', name: 'Shawarma', sellers: 8 },
              { icon: '🍲', name: 'Waakye', sellers: 15 },
              { icon: '🍗', name: 'Chicken & Rice', sellers: 10 },
              { icon: '🥟', name: 'Snacks', sellers: 20 },
            ].map((category, index) => (
              <div 
                key={index}
                className="bg-white hover:bg-yellow-50 border-2 border-transparent hover:border-yellow-300 rounded-xl p-5 text-center cursor-pointer transition shadow-sm hover:shadow-md"
              >
                <div className="text-4xl mb-3">{category.icon}</div>
                <h3 className="font-semibold text-gray-900">{category.name}</h3>
                <p className="text-sm text-gray-500">{category.sellers} sellers near you</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== FOR SELLERS ==================== */}
      <section id="sellers" className="py-16 bg-gray-900 text-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left: Content */}
            <div>
              <h2 className="text-3xl font-bold mb-4">
                For Food Sellers
              </h2>
              <p className="text-gray-300 mb-8 text-lg">
                Never miss or mix an order again. Organize your queue, get paid upfront, and grow your business.
              </p>
              
              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-lg">Organized Order List</h3>
                    <p className="text-gray-300">Clear queue with status tags (Pending, Cooking, Ready)</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-lg">Payments Confirmed Upfront</h3>
                    <p className="text-gray-300">No more ghost orders wasting your ingredients</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-lg">Simple Dashboard</h3>
                    <p className="text-gray-300">Works on any phone — no expensive equipment needed</p>
                  </div>
                </div>
              </div>
              
              <Link 
                href="/seller/signup" 
                className="inline-flex items-center gap-2 bg-yellow-500 text-gray-900 px-6 py-3 rounded-lg font-semibold hover:bg-yellow-400 transition"
              >
                Register Your Stall – Free Trial <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
            
            {/* Right: Visual Card */}
            <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
              <h3 className="text-xl font-semibold mb-4">What You Need to Start</h3>
              <ul className="space-y-3 text-gray-300 mb-6">
                <li className="flex items-center gap-3">
                  <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                  A phone with internet
                </li>
                <li className="flex items-center gap-3">
                  <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                  Your food menu & prices
                </li>
                <li className="flex items-center gap-3">
                  <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                  10 minutes to set up
                </li>
                <li className="flex items-center gap-3">
                  <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                  Free for first 30 days
                </li>
              </ul>
              <div className="bg-gray-700 rounded-lg p-4 text-center">
                <p className="text-sm text-gray-400 mb-2">Join sellers in:</p>
                <div className="flex flex-wrap justify-center gap-2 text-xs">
                  <span className="bg-gray-600 px-3 py-1 rounded-full">Adum</span>
                  <span className="bg-gray-600 px-3 py-1 rounded-full">Kejetia</span>
                  <span className="bg-gray-600 px-3 py-1 rounded-full">Asawase</span>
                  <span className="bg-gray-600 px-3 py-1 rounded-full">Bomso</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== TRUST & LOCAL ==================== */}
      <section className="py-12 bg-yellow-50">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">
            Built for Kumasi 🇬🇭
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <Smartphone className="w-10 h-10 text-green-600 mx-auto mb-3" />
              <h3 className="font-semibold mb-2 text-gray-900">Works on MTN, Telecel, AT</h3>
              <p className="text-gray-600 text-sm">Optimized for Ghana's mobile networks — data-friendly design</p>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <Shield className="w-10 h-10 text-green-600 mx-auto mb-3" />
              <h3 className="font-semibold mb-2 text-gray-900">Secure Paystack Payments</h3>
              <p className="text-gray-600 text-sm">Mobile Money & Card support. Your money, protected.</p>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <Clock className="w-10 h-10 text-green-600 mx-auto mb-3" />
              <h3 className="font-semibold mb-2 text-gray-900">Real-Time Queue Updates</h3>
              <p className="text-gray-600 text-sm">Know exactly when your food is ready. No more guessing.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== FOOTER ==================== */}
      <footer id="contact" className="bg-gray-900 text-white py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <ChefHat className="w-6 h-6 text-yellow-500" />
                <span className="text-lg font-bold">Kueue</span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                Making food ordering simple for Kumasi's busy markets. Order. Track. Enjoy.
              </p>
            </div>
            
            {/* Quick Links */}
            <div>
              <h4 className="font-semibold mb-3 text-gray-200">Quick Links</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#how-it-works" className="hover:text-yellow-500 transition">How It Works</a></li>
                <li><a href="#categories" className="hover:text-yellow-500 transition">Food Categories</a></li>
                <li><a href="#sellers" className="hover:text-yellow-500 transition">For Sellers</a></li>
                <li><a href="/seller/signup" className="hover:text-yellow-500 transition">Seller Signup</a></li>
              </ul>
            </div>
            
            {/* Support */}
            <div>
              <h4 className="font-semibold mb-3 text-gray-200">Support</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-yellow-500 transition">Help Center</a></li>
                <li><a href="#" className="hover:text-yellow-500 transition">Contact Us</a></li>
                <li><a href="#" className="hover:text-yellow-500 transition">WhatsApp Support</a></li>
              </ul>
            </div>
            
            {/* Connect */}
            <div>
              <h4 className="font-semibold mb-3 text-gray-200">Connect</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-yellow-500 transition">Instagram</a></li>
                <li><a href="#" className="hover:text-yellow-500 transition">Facebook</a></li>
                <li><a href="#" className="hover:text-yellow-500 transition">Twitter</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 text-center text-gray-500 text-sm">
            <p>© 2026 Kueue. Made with ❤️ in Kumasi, Ghana.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}