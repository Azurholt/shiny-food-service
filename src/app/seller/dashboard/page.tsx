'use client';

import { useState } from 'react';
import { 
  ChefHat, 
  Bell, 
  MapPin, 
  User, 
  Utensils, 
  Clock, 
  Pause, 
  Play,
  MoreVertical
} from 'lucide-react';

// Mock Data representing the Stitch output
const INITIAL_ORDERS = [
  {
    id: '4821',
    customer: 'Kwame A.',
    location: 'Ayeduase Gate',
    items: 'Fufu & Light Soup (2), Extra Goat Meat',
    status: 'pending', // pending, cooking, ready
    time: '12:04 PM'
  },
  {
    id: '1052',
    customer: 'Amara O.',
    location: 'Engineering Gate',
    items: 'Jollof Rice (Regular), Fried Plantain, Grilled Chicken',
    status: 'cooking',
    time: '11:58 AM'
  },
  {
    id: '9934',
    customer: 'Kofi B.',
    location: 'KNUST Post Office',
    items: 'Banku & Tilapia (Large), Extra Shito',
    status: 'ready',
    time: '11:45 AM'
  }
];

export default function SellerDashboard() {
  const [activeTab, setActiveTab] = useState('queue');
  const [isPaused, setIsPaused] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  // Toggle Pause Logic
  const togglePause = () => {
    setIsPaused(!isPaused);
    // TODO: Update Supabase sellers.is_accepting_app_orders here
  };

  // Status Badge Component (Design.md compliant)
  const StatusBadge = ({ status }: { status: string }) => {
    const styles: any = {
      pending: 'bg-tertiary_fixed_dim/30 text-tertiary', // Soft Gold
      cooking: 'bg-primary_fixed_dim/30 text-primary',   // Soft Green
      ready: 'bg-secondary/20 text-secondary',           // Soft Red
    };
    
    const labels: any = {
      pending: 'Pending',
      cooking: 'Cooking',
      ready: 'Ready',
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-surface font-body">
      
      {/* ==================== TOP HEADER ==================== */}
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-40 border-b border-outline_variant/10">
        <div className="max-w-2xl mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <ChefHat className="w-6 h-6 text-primary" />
            <span className="text-lg font-display font-bold text-on_surface">Kueue</span>
          </div>
          
          {/* Notification Bell */}
          <button className="relative p-2 text-on_surface/60 hover:text-primary transition">
            <Bell className="w-6 h-6" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-secondary rounded-full"></span>
          </button>
        </div>

        {/* Sub-Navigation (Tabs) */}
        <div className="max-w-2xl mx-auto px-4 flex gap-6 border-t border-outline_variant/5">
          {['queue', 'today', 'settings'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-3 text-sm font-semibold capitalize transition relative ${
                activeTab === tab ? 'text-primary' : 'text-on_surface/50 hover:text-on_surface/70'
              }`}
            >
              {tab}
              {activeTab === tab && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-t-full"></span>
              )}
            </button>
          ))}
        </div>
      </header>

      {/* ==================== MAIN CONTENT ==================== */}
      <main className="max-w-2xl mx-auto px-4 py-6 pb-32 relative">
        
        {/* Adinkra Watermark (Nyame Nti) */}
        <div className="absolute top-4 right-4 opacity-[0.03] pointer-events-none">
           <ChefHat className="w-48 h-48" />
        </div>

        {/* Header Section */}
        <div className="mb-6">
          <p className="text-tertiary text-xs font-bold uppercase tracking-widest mb-1">Live Dashboard</p>
          <h1 className="text-3xl font-display font-bold text-on_surface">Active Orders</h1>
        </div>

        {/* PAUSED STATE OVERLAY */}
        {isPaused && (
          <div className="bg-tertiary_fixed_dim/20 border border-tertiary_fixed_dim/40 rounded-xl p-4 mb-6 flex items-center gap-3">
            <Pause className="w-5 h-5 text-tertiary" />
            <p className="text-sm font-semibold text-tertiary">App Orders Paused. Walk-ups only.</p>
          </div>
        )}

        {/* Order List */}
        <div className="space-y-6">
          {INITIAL_ORDERS.map((order) => (
            <div 
              key={order.id}
              className="bg-surface_container_lowest rounded-xl p-5 shadow-ambient group hover:shadow-md transition-all duration-300 relative overflow-hidden"
            >
              {/* Top Row: Code & Status */}
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-xs text-on_surface/50 font-medium mb-0.5">Pickup Code</p>
                  <h2 className="text-3xl font-display font-bold text-primary tracking-tight">{order.id}</h2>
                </div>
                <StatusBadge status={order.status} />
              </div>

              {/* Customer Details */}
              <div className="space-y-2 mb-5">
                <div className="flex items-center gap-2 text-on_surface/80">
                  <User className="w-4 h-4 text-primary/60" />
                  <span className="text-sm font-medium">{order.customer}</span>
                </div>
                <div className="flex items-center gap-2 text-on_surface/80">
                  <MapPin className="w-4 h-4 text-primary/60" />
                  <span className="text-sm font-medium">{order.location}</span>
                </div>
                <div className="flex items-center gap-2 text-on_surface/80">
                  <Utensils className="w-4 h-4 text-primary/60" />
                  <span className="text-sm">{order.items}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button 
                  onClick={() => setSelectedOrder(order)}
                  className="flex-1 py-3 px-4 border border-outline_variant/30 rounded-lg text-sm font-semibold text-on_surface hover:bg-surface_container_low transition text-center"
                >
                  View Details
                </button>
                
                {order.status === 'pending' && (
                  <button className="flex-1 py-3 px-4 bg-gradient-to-br from-primary to-primary-container text-white rounded-lg text-sm font-semibold shadow-sm hover:opacity-90 transition text-center">
                    Mark Cooking
                  </button>
                )}
                
                {order.status === 'cooking' && (
                  <button className="flex-1 py-3 px-4 bg-gradient-to-br from-primary to-primary-container text-white rounded-lg text-sm font-semibold shadow-sm hover:opacity-90 transition text-center">
                    Mark Ready
                  </button>
                )}

                {order.status === 'ready' && (
                  <button className="flex-1 py-3 px-4 bg-surface_container_low text-primary rounded-lg text-sm font-semibold border border-primary/20 transition text-center">
                    Completed
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* ==================== FLOATING ACTION BUTTON (Panic Button) ==================== */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={togglePause}
          className={`flex items-center gap-2 px-5 py-3 rounded-full shadow-lg font-semibold text-white transition-all duration-300 ${
            isPaused 
              ? 'bg-secondary hover:bg-red-700' 
              : 'bg-primary hover:bg-primary-container'
          }`}
        >
          {isPaused ? (
            <>
              <Play className="w-5 h-5" />
              <span>Resume Orders</span>
            </>
          ) : (
            <>
              <Pause className="w-5 h-5" />
              <span>Pause Orders</span>
            </>
          )}
        </button>
      </div>

      {/* ==================== ORDER DETAILS MODAL (Simple Overlay) ==================== */}
      {selectedOrder && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-on_surface/40 backdrop-blur-sm p-4" onClick={() => setSelectedOrder(null)}>
          <div 
            className="bg-surface_container_lowest w-full max-w-sm rounded-2xl p-6 shadow-2xl animate-in slide-in-from-bottom-10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-display font-bold text-on_surface">Order #{selectedOrder.id}</h3>
              <button onClick={() => setSelectedOrder(null)} className="text-on_surface/50 hover:text-on_surface">
                <MoreVertical className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4 mb-8">
              <div className="bg-surface_container_low p-4 rounded-lg">
                <p className="text-xs text-on_surface/50 uppercase tracking-wide mb-1">Customer</p>
                <p className="font-semibold text-on_surface">{selectedOrder.customer}</p>
                <p className="text-sm text-primary">{selectedOrder.location}</p>
              </div>
              
              <div className="bg-surface_container_low p-4 rounded-lg">
                <p className="text-xs text-on_surface/50 uppercase tracking-wide mb-1">Items</p>
                <p className="font-medium text-on_surface">{selectedOrder.items}</p>
              </div>
            </div>

            <button 
              onClick={() => setSelectedOrder(null)}
              className="w-full bg-primary text-white py-3 rounded-lg font-semibold"
            >
              Close
            </button>
          </div>
        </div>
      )}

    </div>
  );
}