'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChefHat } from 'lucide-react';

const NAV_ITEMS = [
  { href: '/seller/dashboard/queue', label: 'Queue' },
  { href: '/seller/dashboard/history', label: 'History' },
  { href: '/seller/dashboard/settings', label: 'Settings' },
];

export default function SellerDashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-surface">
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-40 border-b border-outline_variant/10">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ChefHat className="w-6 h-6 text-tertiary-fixed" />
            <span className="text-lg font-display font-bold text-on_surface">Kueue Seller</span>
          </div>
        </div>
        <div className="max-w-3xl mx-auto px-4 flex gap-6 border-t border-outline_variant/5">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`py-3 text-sm font-semibold transition relative ${
                  isActive ? 'text-primary' : 'text-on_surface/50 hover:text-on_surface/70'
                }`}
              >
                {item.label}
                {isActive && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-t-full" />}
              </Link>
            );
          })}
        </div>
      </header>
      <main key={pathname} className="max-w-3xl mx-auto px-4 py-6 pb-16 animate-[fadeIn_.25s_ease-out]">
        {children}
      </main>
    </div>
  );
}
