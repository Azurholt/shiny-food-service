'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import {
  fetchActiveMenuItems,
  fetchStallDetails,
  type BusynessLevel,
  type CustomerMenuItem,
  type DiscoverySeller,
} from '@/lib/customerDiscovery';

const BUSYNESS_LABELS: Record<BusynessLevel, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
};

const BUSYNESS_STYLES: Record<BusynessLevel, string> = {
  low: 'bg-tertiary_fixed_dim/20 text-tertiary',
  medium: 'bg-primary_fixed_dim/20 text-primary',
  high: 'bg-secondary/10 text-secondary',
};

function formatRating(ratingAvg: number, ratingCount: number): string {
  if (ratingCount === 0) return 'No ratings yet';
  return `${ratingAvg.toFixed(1)} ★ from ${ratingCount} ratings`;
}

function formatCurrency(value: number): string {
  return `₵${value.toFixed(2)}`;
}

export default function CustomerStallDetailPage() {
  const params = useParams<{ stallId: string }>();
  const stallId = useMemo(() => params.stallId, [params.stallId]);
  const [seller, setSeller] = useState<DiscoverySeller | null>(null);
  const [menuItems, setMenuItems] = useState<CustomerMenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const [sellerData, menuData] = await Promise.all([
          fetchStallDetails(stallId),
          fetchActiveMenuItems(stallId),
        ]);
        if (!mounted) return;
        setSeller(sellerData);
        setMenuItems(menuData);
      } catch (loadError) {
        if (!mounted) return;
        setError(loadError instanceof Error ? loadError.message : 'Unable to load stall.');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, [stallId]);

  if (loading) {
    return (
      <main className="min-h-screen bg-surface px-4 py-10 font-body">
        <section className="mx-auto max-w-3xl rounded-2xl bg-surface_container_lowest p-10 text-center shadow-ambient">
          <p className="font-semibold text-on_surface/60">Loading stall...</p>
        </section>
      </main>
    );
  }

  if (error || !seller) {
    return (
      <main className="min-h-screen bg-surface px-4 py-10 font-body">
        <section className="mx-auto max-w-3xl rounded-2xl bg-secondary/10 p-6 text-secondary">
          <p className="font-semibold">{error || 'Unable to load stall.'}</p>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-surface px-4 py-8 font-body">
      <div className="mx-auto max-w-3xl space-y-6">
        <Link href="/customer/dashboard/marketplace" className="inline-flex text-sm font-body font-semibold text-primary">
          Back to marketplace
        </Link>

        <section className="rounded-3xl bg-surface_container_low p-6 md:p-8">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-display font-bold uppercase tracking-widest text-tertiary">{seller.location}</p>
              <h1 className="mt-2 text-4xl font-display font-bold tracking-tight text-on_surface">{seller.businessName}</h1>
            </div>
            <span className={`w-fit rounded-full px-3 py-1 text-xs font-display font-bold uppercase tracking-wide ${BUSYNESS_STYLES[seller.busynessLevel]}`}>
              {BUSYNESS_LABELS[seller.busynessLevel]} busyness
            </span>
          </div>
          <p className="text-sm font-body font-semibold text-on_surface/65">{formatRating(seller.ratingAvg, seller.ratingCount)}</p>
        </section>

        <section className="rounded-2xl bg-surface_container_lowest p-6 shadow-ambient">
          <h2 className="mb-2 text-xl font-display font-bold text-on_surface">Directions</h2>
          <p className="leading-relaxed text-on_surface/75">
            {seller.directionNote || 'This seller has not added precise directions yet.'}
          </p>
        </section>

        <section className="rounded-2xl bg-surface_container_lowest p-6 shadow-ambient">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-display font-bold text-on_surface">Menu Items</h2>
              <p className="text-sm text-on_surface/65">Preview active items before ordering.</p>
            </div>
            <Link
              href={`/customer/stall/${seller.userId}/order`}
              className="rounded-lg bg-gradient-to-br from-primary to-primary-container px-5 py-3 text-center font-body font-semibold text-white"
            >
              Order
            </Link>
          </div>

          {menuItems.length === 0 ? (
            <div className="rounded-xl bg-surface_container_low p-6 text-center">
              <p className="font-body text-on_surface/55">No menu items listed yet.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {menuItems.slice(0, 6).map((item) => (
                <div key={item.id} className="flex items-center justify-between rounded-xl bg-surface_container_low p-4">
                  <span className="font-body font-semibold text-on_surface">{item.itemName}</span>
                  <span className="font-display font-bold text-primary">{formatCurrency(item.unitPrice)}</span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
