'use client';

import { useState } from 'react';
import Image from 'next/image'; // ✅ Import Next.js Image component
import { 
  ChefHat, 
  Settings, 
  Clock, 
  TrendingUp, 
  Star, 
  Plus, 
  ChevronRight, 
  ChevronRightCircleIcon,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';

// Mock Data
const MENU_ITEMS = [
  {
    id: 1,
    name: 'Bread and egg',
    description: 'The ultimate Ghanaian comfort breakfast. Soft butter bread served with spicy fried eggs and a touch of local tea.',
    time: '15-20 min',
    tag: 'Popular',
    tagColor: 'text-tertiary bg-tertiary_fixed_dim/20',
    image: '/images/b and e.jpg' // ✅ Path from public/images/
  },
  {
    id: 2,
    name: 'Waakye',
    description: 'Rice and beans infused with indigenous sorghum leaves, served with shito, gari, and the legendary wele stew.',
    time: '25-30 min',
    tag: 'Top Choice',
    tagColor: 'text-primary bg-primary_fixed_dim/20',
    image: '/images/waakye.jpg'
  },
  {
    id: 3,
    name: 'Spaghetti',
    description: 'The stomach filler. The hunger staver. Spicy, perfectly seasoned long-strand spaghetti that speaks for itself.',
    time: '30-45 min',
    tag: 'Trending',
    tagColor: 'text-secondary bg-secondary/10',
    image: '/images/spaghetti.jpg'
  }
];

export default function CustomerMarketplace() {
  const [activeTab, setActiveTab] = useState('marketplace');

  return (
    <div className="min-h-screen bg-surface font-body">
      
      {/* ==================== TOP NAVIGATION ==================== */}
      <header className="sticky top-0 z-40 bg-surface/85 backdrop-blur-md border-b border-outline_variant/10">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-2">
            <ChefHat className="w-6 h-6 text-tertiary-fixed" />
            <span className="text-xl font-display font-bold text-on_surface">Kueue</span>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center gap-6">
            <button
              onClick={() => setActiveTab('marketplace')}
              className={`py-2 text-sm font-semibold capitalize transition relative ${
                activeTab === 'marketplace' ? 'text-primary' : 'text-on_surface/50 hover:text-on_surface/80'
              }`}
            >
              Marketplace
              {activeTab === 'marketplace' && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-t-full"></span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`py-2 text-sm font-semibold capitalize transition relative ${
                activeTab === 'orders' ? 'text-primary' : 'text-on_surface/50 hover:text-on_surface/80'
              }`}
            >
              Orders
              {activeTab === 'orders' && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-t-full"></span>
              )}
            </button>
          </nav>

          {/* Settings Icon */}
          <button className="p-2 text-on_surface/60 hover:text-primary transition rounded-full hover:bg-surface_container_low">
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* ==================== MAIN CONTENT ==================== */}
      <main className="max-w-4xl mx-auto px-4 py-12">
        
        {/* Section Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-display font-bold text-on_surface tracking-tight">
            Daily Selections
          </h1>
          <p className="text-on_surface/60 mt-2 text-lg">
            Curated categories from the heart of Ghana
          </p>
        </div>

        {/* Menu List */}
        <div className="space-y-6">
          {MENU_ITEMS.map((item) => (
            <div 
              key={item.id}
              className="bg-surface_container_lowest rounded-xl p-5 shadow-ambient hover:shadow-md transition-all duration-300 group"
            >
              <div className="flex items-start gap-5">
                {/* Item Image - OPTIMIZED WITH NEXT.JS IMAGE COMPONENT */}
                <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 bg-surface_container_low relative">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill // ✅ Fills parent container
                    sizes="(max-width: 768px) 96px, 96px" // ✅ Responsive hint
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    priority={false} // ✅ Lazy loads by default
                  />
                </div>

                {/* Item Details */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-display font-semibold text-xl text-on_surface mb-1">
                    {item.name}
                  </h3>
                  <p className="text-on_surface/60 text-sm leading-relaxed line-clamp-2">
                    {item.description}
                  </p>
                  
                  {/* Meta Tags */}
                  <div className="flex items-center gap-3 mt-3">
                    <span className="flex items-center gap-1 text-xs text-on_surface/50 font-medium">
                      <Clock className="w-3.5 h-3.5" />
                      {item.time}
                    </span>
                    <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide ${item.tagColor}`}>
                      {item.tag === 'Popular' && <TrendingUp className="w-3 h-3" />}
                      {item.tag === 'Top Choice' && <Star className="w-3 h-3" />}
                      {item.tag === 'Trending' && <TrendingUp className="w-3 h-3" />}
                      {item.tag}
                    </span>
                  </div>
                </div>

                {/* Action Button */}
                <button className="w-10 h-10 rounded-lg bg-primary_fixed_dim text-tertiary-fixed flex items-center justify-center shadow-sm hover:bg-primary_fixed_dim/80 hover:-translate-y-0.5 transition-all duration-200 flex-shrink-0">
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Editorial CTA */}
        <div className="mt-12 text-center">
          <button className="inline-flex items-center gap-2 text-primary font-semibold hover:gap-3 transition-all">
            Browse All Categories
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </main>

      {/* ==================== FOOTER ==================== */}
      <footer className="border-t border-outline_variant/10 mt-12 py-8 bg-surface_container_low/50">
        <div className="max-w-4xl mx-auto px-4 flex flex-col items-center gap-4">
          <div className="flex items-center gap-2">
            <ChefHat className="w-5 h-5 text-tertiary-fixed" />
            <span className="font-display font-bold text-on_surface">Kueue</span>
          </div>
          <div className="flex gap-6 text-xs text-on_surface/50">
            <Link href="/privacy" className="hover:text-primary transition">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-primary transition">Terms of Service</Link>
            <Link href="/partner" className="hover:text-primary transition">Partner with Us</Link>
          </div>
          <p className="text-xs text-on_surface/40">
            © 2026 Kueue. Crafted with Ghanaian Excellence.
          </p>
        </div>
      </footer>
    </div>
  );
}
