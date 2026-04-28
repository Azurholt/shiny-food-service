'use client';
// src/app/page.tsx
// Kueue - Main Landing Page (DESIGN.md "Modern Weaver" Implementation)
import { 
  ChefHat, 
  Phone, 
  CheckCircle, 
  Clock, 
  CreditCard, 
  MapPin, 
  Smartphone, 
  Shield, 
  ArrowRight,
  Store,
  Utensils,
  TrendingUp,
  Menu,
  X
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-surface font-body">
      
      {/* ==================== HEADER ==================== */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-outline-variant/15">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <ChefHat className="w-7 h-7 text-tertiary-fixed" />
              <span className="text-xl font-display font-bold text-on_surface">Kueue</span>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              <a href="#marketplace" className="text-sm font-medium text-on_surface/70 hover:text-primary transition">
                Marketplace
              </a>
              <a href="#track-order" className="text-sm font-medium text-on_surface/70 hover:text-primary transition">
                Track Order
              </a>
              <a href="#sellers" className="text-sm font-medium text-on_surface/70 hover:text-primary transition">
                Sellers
              </a>
              <a href="#support" className="text-sm font-medium text-on_surface/70 hover:text-primary transition">
                Support
              </a>
            </nav>

            {/* CTA Buttons */}
            <div className="hidden md:flex items-center gap-4">
              <Link href="/seller/login" className="text-sm font-medium text-on_surface/70 hover:text-primary transition">
                Log In
              </Link>
              <Link 
                href="/seller/signup" 
                className="bg-gradient-to-br from-primary to-primary-container hover:from-primary-container hover:to-primary text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 shadow-sm"
              >
                Get Started
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden p-2 text-on_surface"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-outline-variant/15">
            <div className="px-4 py-6 space-y-4">
              <a href="#marketplace" className="block text-base font-medium text-on_surface">Marketplace</a>
              <a href="#track-order" className="block text-base font-medium text-on_surface">Track Order</a>
              <a href="#sellers" className="block text-base font-medium text-on_surface">Sellers</a>
              <a href="#support" className="block text-base font-medium text-on_surface">Support</a>
              <div className="pt-4 border-t border-outline-variant/15 space-y-3">
                <Link href="/seller/signup" className="block text-base font-medium text-on_surface">Sign In</Link>
                <Link href="/seller/signup" className="block bg-primary text-white px-5 py-3 rounded-lg text-center font-semibold">
                  Get Started
                </Link>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* ==================== HERO SECTION ==================== */}
      <section className="relative pt-16 pb-24 lg:pt-24 lg:pb-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
            
            {/* Left: Text Content */}
            <div className="max-w-2xl">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-surface_container_lowest px-4 py-2 rounded-full shadow-sm mb-8">
                <span className="w-2 h-2 bg-primary rounded-full animate-pulse"></span>
                <span className="text-sm font-medium text-primary">Now serving KNUST & Ayeduase</span>
              </div>

              {/* Headline */}
              <h1 className="text-5xl lg:text-7xl font-display font-bold text-on_surface leading-[0.98] tracking-tight mb-6">
                Order Food.{' '}
                <span className="text-primary italic">Know Your Turn.</span>{' '}
                <br className="hidden lg:block" />
                Pick Up with Confidence.
              </h1>

              {/* Subheadline */}
              <p className="text-lg text-on_surface/70 mb-10 max-w-xl leading-relaxed font-body">
                No more waiting in uncertain queues after tiring lectures. No more wasted food from cancelled orders. 
                Built for KNUST&apos;s busy food sellers and hungry students.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 mb-10">
                <Link 
                  href="#categories" 
                  className="inline-flex items-center justify-center gap-2 bg-gradient-to-br from-primary to-primary-container hover:from-primary-container hover:to-primary text-white px-8 py-4 rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl group"
                >
                  I&apos;m a Customer 
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link 
                  href="/seller/signup" 
                  className="inline-flex items-center justify-center gap-2 bg-surface_container_lowest hover:bg-surface_container_low text-on_surface border-2 border-outline-variant/20 px-8 py-4 rounded-lg font-semibold transition-all duration-200"
                >
                  I&apos;m a Seller
                </Link>
              </div>

              {/* Trust Badges */}
              <div className="flex flex-wrap items-center gap-6 text-sm text-on_surface/60 font-body">
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary" />
                  <span>Secure Mobile Money Payments</span>
                </div>
                <div className="flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-primary" />
                  <span>Works on Any Phone</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  <span>No App Download Needed</span>
                </div>
              </div>
            </div>

            {/* Right: Hero Image */}
            <div className="relative lg:pl-12">
              {/* Main Image Container */}
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                {/* PLACEHOLDER - Replace with actual food image */}
                <div className="aspect-[4/3] bg-gradient-to-br from-surface_container_low to-surface flex items-center justify-center">
                  <div className="text-center p-8">
                    <Utensils className="w-20 h-20 text-primary/20 mx-auto mb-4" />
                    <p className="text-on_surface/50 font-body font-medium">Add hero food image here</p>
                    <p className="text-sm text-on_surface/40 mt-2 font-body">Overhead shot of Ghanaian dishes</p>
                  </div>
                </div>

                {/* Floating Prep Time Card */}
                <div className="absolute bottom-6 left-6 bg-surface_container_lowest/95 backdrop-blur-sm rounded-xl p-4 shadow-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary-fixed/20 rounded-lg flex items-center justify-center">
                      <Clock className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-on_surface/60 font-body font-medium">Average Prep Time</p>
                      <p className="text-lg font-display font-bold text-on_surface">18 Minutes</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Decorative Elements */}
              <div className="absolute -top-8 -right-8 w-64 h-64 bg-secondary/5 rounded-full blur-3xl -z-10"></div>
              <div className="absolute -bottom-8 -left-8 w-64 h-64 bg-tertiary/5 rounded-full blur-3xl -z-10"></div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== EXPLORE BY TASTE ==================== */}
      <section id="categories" className="py-24 bg-surface_container_low">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl lg:text-4xl font-display font-bold text-on_surface mb-3">
                Explore by Taste
              </h2>
              <p className="text-on_surface/60 font-body">
                Discover the best food from top-rated Hadjia&apos;s and Aunties and Uncles around KNUST.
              </p>
            </div>
            <Link href="#marketplace" className="hidden sm:inline-flex items-center gap-2 text-primary font-semibold hover:text-primary-container transition">
              View Marketplace
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>

          {/* Category Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {[
              { name: 'Fufu & Soup', stores: '142 Local Stores', emoji: '🍲', color: 'from-orange-100 to-orange-50' },
              { name: 'Jollof Rice', stores: '210 Local Stores', emoji: '🍛', color: 'from-red-100 to-red-50' },
              { name: 'Banku & Tilapia', stores: '89 Local Stores', emoji: '🐟', color: 'from-blue-100 to-blue-50' },
              { name: 'Waakye Special', stores: '156 Local Stores', emoji: '🍚', color: 'from-yellow-100 to-yellow-50' },
              { name: 'Street Snacks', stores: '304 Local Stores', emoji: '🥟', color: 'from-green-100 to-green-50' },
            ].map((category, index) => (
              <div 
                key={index}
                className="group cursor-pointer"
              >
                <div className={`bg-gradient-to-br ${category.color} rounded-2xl p-6 mb-4 aspect-square flex items-center justify-center transition-transform duration-300 group-hover:scale-105 shadow-sm`}>
                  <div className="text-6xl filter drop-shadow-lg">
                    {category.emoji}
                  </div>
                </div>
                <h3 className="font-display font-semibold text-on_surface mb-1">{category.name}</h3>
                <p className="text-sm font-body text-on_surface/50">{category.stores}</p>
              </div>
            ))}
          </div>

          {/* Mobile View Marketplace Link */}
          <div className="sm:hidden mt-8">
            <Link href="#marketplace" className="inline-flex items-center gap-2 text-primary font-semibold">
              View Marketplace
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ==================== HOW IT WORKS ==================== */}
      <section id="how-it-works" className="py-24 bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="max-w-2xl mb-16">
            <h2 className="text-3xl lg:text-4xl font-display font-bold text-on_surface mb-4">
              How It Works for Customers
            </h2>
            <p className="text-on_surface/60 text-lg font-body">
              Three simple steps to get your food without the stress
            </p>
          </div>

          {/* Steps Grid */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {[
              {
                icon: Store,
                iconBg: 'bg-tertiary-fixed/20',
                iconColor: 'text-tertiary',
                title: '1. Browse Sellers',
                description: 'Find food sellers near you by category — shawarma, bread & egg, waakye, and more .'
              },
              {
                icon: CreditCard,
                iconBg: 'bg-primary-fixed/20',
                iconColor: 'text-primary',
                title: '2. Pay to Secure Your Spot',
                description: 'Pay with MTN MoMo, Telecel Cash, or card. Your order is confirmed instantly.'
              },
              {
                icon: Phone,
                iconBg: 'bg-secondary/20',
                iconColor: 'text-secondary',
                title: '3. Get Code + Pick Up',
                description: 'Receive a 4-digit pickup code and see your position in the queue. Plan your journey!'
              }
            ].map((step, index) => (
              <div 
                key={index}
                className="bg-surface_container_lowest rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow duration-300"
              >
                <div className={`w-14 h-14 ${step.iconBg} rounded-xl flex items-center justify-center mb-6`}>
                  <step.icon className={`w-7 h-7 ${step.iconColor}`} />
                </div>
                <h3 className="text-xl font-display font-semibold text-on_surface mb-3">{step.title}</h3>
                <p className="text-on_surface/60 font-body leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>

          {/* Queue Status Card */}
          <div className="max-w-2xl mx-auto">
            <div className="bg-primary-fixed/20 border-2 border-primary-fixed/30 rounded-2xl p-8 text-center">
              <div className="flex items-center justify-center gap-2 mb-3">
                <Phone className="w-5 h-5 text-primary" />
                <span className="text-sm font-semibold text-primary font-body">Your Order Status</span>
              </div>
              <p className="text-2xl lg:text-3xl font-display font-bold text-primary mb-1">
                You are #3 in queue
              </p>
              <p className="text-primary/70 font-body">Ready in ~12 minutes</p>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== FOR SELLERS ==================== */}
      <section id="sellers" className="py-24 bg-on_surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            
            {/* Left: Content */}
            <div>
              <h2 className="text-3xl lg:text-4xl font-display font-bold text-white mb-4">
                For Food Sellers
              </h2>
              <p className="text-white/70 text-lg mb-10 leading-relaxed font-body">
                Never miss or mix an order again. Organize your queue, get paid upfront, and grow your business.
              </p>

              {/* Features List */}
              <div className="space-y-6 mb-10">
                {[
                  {
                    icon: CheckCircle,
                    title: 'Organized Order List',
                    description: 'Clear queue with status tags (Pending, Cooking, Ready)'
                  },
                  {
                    icon: CheckCircle,
                    title: 'Payments Confirmed Upfront',
                    description: 'No more ghost orders wasting your ingredients'
                  },
                  {
                    icon: CheckCircle,
                    title: 'Simple Dashboard',
                    description: 'Works on any phone — no expensive equipment needed'
                  }
                ].map((feature, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <div className="w-6 h-6 mt-1">
                      <feature.icon className="w-6 h-6 text-primary-fixed" />
                    </div>
                    <div>
                      <h3 className="font-display font-semibold text-white mb-1">{feature.title}</h3>
                      <p className="text-white/60 text-sm font-body">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* CTA Button */}
              <Link 
                href="/seller/signup" 
                className="inline-flex items-center gap-2 bg-tertiary-fixed hover:bg-tertiary-fixed/90 text-on_surface px-8 py-4 rounded-lg font-semibold transition-all duration-200 shadow-lg"
              >
                Register Your Stall – Free Trial
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>

            {/* Right: Info Card */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 lg:p-10 border border-white/20">
              <h3 className="text-xl font-display font-semibold text-white mb-6">
                What You Need to Start
              </h3>
              
              <ul className="space-y-4 mb-10">
                {[
                  'A phone with internet',
                  'Your food menu & prices',
                  '10 minutes to set up',
                  'Free for first 30 days'
                ].map((item, index) => (
                  <li key={index} className="flex items-center gap-3 text-white/70 font-body">
                    <span className="w-1.5 h-1.5 bg-primary-fixed rounded-full"></span>
                    {item}
                  </li>
                ))}
              </ul>

              {/* Locations */}
              <div className="border-t border-white/10 pt-6">
                <p className="text-sm text-white/50 mb-4 font-body">Join sellers in:</p>
                <div className="flex flex-wrap gap-2">
                  {['Ayeduase Gate', 'Engineering Gate', 'Conti Market', 'Kotei'].map((location, index) => (
                    <span 
                      key={index}
                      className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm text-white/80 font-body transition-colors cursor-default"
                    >
                      {location}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== BUILT FOR KNUST ==================== */}
      <section className="py-24 bg-tertiary-fixed/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-display font-bold text-on_surface mb-4">
              Built for KNUST 🇬🇭
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Smartphone,
                title: 'Works on MTN, Telecel, AT',
                description: 'Optimized for Ghana\'s mobile networks — data-friendly design'
              },
              {
                icon: Shield,
                title: 'Secure Paystack Payments',
                description: 'Mobile Money & Card support. Your money, protected.'
              },
              {
                icon: Clock,
                title: 'Real-Time Queue Updates',
                description: 'Know exactly when your food is ready. No more guessing.'
              }
            ].map((feature, index) => (
              <div key={index} className="bg-surface_container_lowest rounded-2xl p-8 text-center shadow-sm">
                <div className="w-14 h-14 bg-primary-fixed/20 rounded-xl flex items-center justify-center mx-auto mb-6">
                  <feature.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="font-display font-semibold text-on_surface mb-3">{feature.title}</h3>
                <p className="text-on_surface/60 text-sm font-body leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== FOOTER ==================== */}
      <footer id="contact" className="bg-on_surface border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            
            {/* Brand */}
            <div className="md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <ChefHat className="w-6 h-6 text-tertiary-fixed" />
                <span className="text-lg font-display font-bold text-white">Kueue</span>
              </div>
              <p className="text-white/60 text-sm leading-relaxed mb-6 font-body">
                Making food ordering simple for KNUST&apos;s busy markets. Order. Track. Enjoy.
              </p>
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center cursor-pointer hover:bg-white/20 transition">
                  <TrendingUp className="w-4 h-4 text-white/60" />
                </div>
                <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center cursor-pointer hover:bg-white/20 transition">
                  <TrendingUp className="w-4 h-4 text-white/60" />
                </div>
                <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center cursor-pointer hover:bg-white/20 transition">
                  <TrendingUp className="w-4 h-4 text-white/60" />
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-display font-semibold text-white mb-4">Quick Links</h4>
              <ul className="space-y-3 text-sm">
                <li><a href="#how-it-works" className="text-white/60 hover:text-tertiary-fixed transition font-body">How It Works</a></li>
                <li><a href="#categories" className="text-white/60 hover:text-tertiary-fixed transition font-body">Food Categories</a></li>
                <li><a href="#sellers" className="text-white/60 hover:text-tertiary-fixed transition font-body">For Sellers</a></li>
                <li><a href="/seller/signup" className="text-white/60 hover:text-tertiary-fixed transition font-body">Seller Signup</a></li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="font-display font-semibold text-white mb-4">Support</h4>
              <ul className="space-y-3 text-sm">
                <li><a href="#help" className="text-white/60 hover:text-tertiary-fixed transition font-body">Help Center</a></li>
                <li><a href="#contact" className="text-white/60 hover:text-tertiary-fixed transition font-body">Contact Us</a></li>
                <li><a href="#whatsapp" className="text-white/60 hover:text-tertiary-fixed transition font-body">WhatsApp Support</a></li>
              </ul>
            </div>

            {/* Connect */}
            <div>
              <h4 className="font-display font-semibold text-white mb-4">Connect</h4>
              <ul className="space-y-3 text-sm">
                <li><a href="#instagram" className="text-white/60 hover:text-tertiary-fixed transition font-body">Instagram</a></li>
                <li><a href="#facebook" className="text-white/60 hover:text-tertiary-fixed transition font-body">Facebook</a></li>
                <li><a href="#twitter" className="text-white/60 hover:text-tertiary-fixed transition font-body">Twitter</a></li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-white/40 text-sm font-body">
              © 2026 Kueue. Made with ❤️ in KNUST, Ghana.
            </p>
            <div className="flex items-center gap-6 text-sm">
              <a href="#privacy" className="text-white/40 hover:text-white/60 transition font-body">Privacy Policy</a>
              <a href="#terms" className="text-white/40 hover:text-white/60 transition font-body">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}