'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import {
  FOOD_CATEGORIES,
  fetchCategoryLocations,
  fetchMarketplaceSellers,
  type BusynessLevel,
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

function truncateDirection(note: string): string {
  if (!note) return 'No direction note yet.';
  return note.length > 96 ? `${note.slice(0, 93)}...` : note;
}

function formatRating(ratingAvg: number, ratingCount: number): string {
  if (ratingCount === 0) return 'No ratings yet';
  return `${ratingAvg.toFixed(1)} ★ (${ratingCount})`;
}

function BusynessBadge({ level }: { level: BusynessLevel }) {
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-display font-bold uppercase tracking-wide ${BUSYNESS_STYLES[level]}`}>
      {BUSYNESS_LABELS[level]}
    </span>
  );
}

function StallCard({ seller }: { seller: DiscoverySeller }) {
  return (
    <article className="rounded-2xl bg-surface_container_lowest p-5 shadow-ambient">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-display font-bold uppercase tracking-widest text-tertiary">{seller.location}</p>
          <h2 className="mt-1 text-2xl font-display font-bold text-on_surface">{seller.businessName}</h2>
        </div>
        <BusynessBadge level={seller.busynessLevel} />
      </div>

      <p className="mb-4 text-sm font-body leading-relaxed text-on_surface/70">{truncateDirection(seller.directionNote)}</p>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <span className="rounded-full bg-surface_container_low px-3 py-1 text-xs font-body font-semibold text-on_surface/70">
          {formatRating(seller.ratingAvg, seller.ratingCount)}
        </span>
        <Link
          href={`/customer/stall/${seller.userId}`}
          className="rounded-lg bg-gradient-to-br from-primary to-primary-container px-5 py-3 text-center font-body font-semibold text-white"
        >
          View
        </Link>
      </div>
    </article>
  );
}

export default function CustomerMarketplacePage() {
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [locations, setLocations] = useState<string[]>([]);
  const [sellers, setSellers] = useState<DiscoverySeller[]>([]);
  const [loadingLocations, setLoadingLocations] = useState(false);
  const [loadingSellers, setLoadingSellers] = useState(false);
  const [error, setError] = useState('');

  const selectedCategoryMeta = useMemo(
    () => FOOD_CATEGORIES.find((category) => category.value === selectedCategory),
    [selectedCategory],
  );

  useEffect(() => {
    if (!selectedCategory) return;

    let mounted = true;
    const loadLocations = async () => {
      setLoadingLocations(true);
      setError('');
      setLocations([]);
      setSelectedLocation('');
      setSellers([]);
      try {
        const locationData = await fetchCategoryLocations(selectedCategory);
        if (!mounted) return;
        setLocations(locationData);
        setSelectedLocation(locationData[0] ?? '');
      } catch (loadError) {
        if (!mounted) return;
        setError(loadError instanceof Error ? loadError.message : 'Unable to load locations.');
      } finally {
        if (mounted) setLoadingLocations(false);
      }
    };

    loadLocations();
    return () => {
      mounted = false;
    };
  }, [selectedCategory]);

  useEffect(() => {
    if (!selectedCategory || !selectedLocation) {
      setSellers([]);
      return;
    }

    let mounted = true;
    const loadSellers = async () => {
      setLoadingSellers(true);
      setError('');
      try {
        const sellerData = await fetchMarketplaceSellers(selectedCategory, selectedLocation);
        if (mounted) setSellers(sellerData);
      } catch (loadError) {
        if (!mounted) return;
        setError(loadError instanceof Error ? loadError.message : 'Unable to load stalls.');
      } finally {
        if (mounted) setLoadingSellers(false);
      }
    };

    loadSellers();
    return () => {
      mounted = false;
    };
  }, [selectedCategory, selectedLocation]);

  return (
    <main className="min-h-screen bg-surface px-4 py-8 font-body">
      <div className="mx-auto max-w-5xl space-y-6">
        <section className="rounded-3xl bg-surface_container_low p-6 md:p-8">
          <p className="mb-2 text-xs font-display font-bold uppercase tracking-widest text-tertiary">Marketplace</p>
          <h1 className="text-4xl font-display font-bold tracking-tight text-on_surface">Find food by landmark.</h1>
          <p className="mt-3 max-w-2xl text-on_surface/70">
            Pick a category, choose a campus landmark, and compare nearby stalls by directions, rating, and busyness.
          </p>
        </section>

        <section className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {FOOD_CATEGORIES.map((category) => {
            const active = selectedCategory === category.value;
            return (
              <button
                key={category.value}
                type="button"
                onClick={() => setSelectedCategory(category.value)}
                className={`rounded-2xl p-5 text-left shadow-ambient transition ${
                  active ? 'bg-primary text-white' : 'bg-surface_container_lowest text-on_surface hover:bg-surface_container_low'
                }`}
              >
                <span className={`text-xs font-display font-bold uppercase tracking-widest ${active ? 'text-white/75' : 'text-tertiary'}`}>
                  Category
                </span>
                <span className="mt-2 block text-xl font-display font-bold">{category.label}</span>
                <span className={`mt-2 block text-sm leading-relaxed ${active ? 'text-white/80' : 'text-on_surface/65'}`}>
                  {category.description}
                </span>
              </button>
            );
          })}
        </section>

        {selectedCategory && (
          <section className="sticky top-0 z-30 rounded-2xl bg-surface/85 p-4 backdrop-blur-2xl">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs font-display font-bold uppercase tracking-widest text-tertiary">
                  {selectedCategoryMeta?.label ?? 'Selected Category'}
                </p>
                <h2 className="font-display text-2xl font-bold text-on_surface">Select Location</h2>
              </div>
              <select
                value={selectedLocation}
                onChange={(event) => setSelectedLocation(event.target.value)}
                disabled={loadingLocations || locations.length === 0}
                className="min-w-full bg-transparent px-1 py-3 font-body text-on_surface border-b border-outline_variant/40 focus:border-b-2 focus:border-primary focus:outline-none disabled:opacity-60 md:min-w-[280px]"
              >
                {locations.length === 0 ? (
                  <option value="">No landmarks yet</option>
                ) : (
                  locations.map((location) => (
                    <option key={location} value={location}>
                      {location}
                    </option>
                  ))
                )}
              </select>
            </div>
          </section>
        )}

        {error && <p className="rounded-xl bg-secondary/10 px-4 py-3 text-sm font-body font-semibold text-secondary">{error}</p>}

        {selectedCategory && loadingLocations && (
          <section className="rounded-2xl bg-surface_container_lowest p-10 text-center shadow-ambient">
            <p className="font-body font-semibold text-on_surface/60">Loading landmarks...</p>
          </section>
        )}

        {selectedCategory && !loadingLocations && locations.length === 0 && (
          <section className="rounded-2xl bg-surface_container_lowest p-10 text-center shadow-ambient">
            <p className="font-body font-semibold text-on_surface/60">No sellers in this region yet. Try another.</p>
          </section>
        )}

        {selectedCategory && selectedLocation && loadingSellers && (
          <section className="rounded-2xl bg-surface_container_lowest p-10 text-center shadow-ambient">
            <p className="font-body font-semibold text-on_surface/60">Loading stalls...</p>
          </section>
        )}

        {selectedCategory && selectedLocation && !loadingSellers && sellers.length === 0 && (
          <section className="rounded-2xl bg-surface_container_lowest p-10 text-center shadow-ambient">
            <p className="font-body font-semibold text-on_surface/60">No sellers in this region yet. Try another.</p>
          </section>
        )}

        {sellers.length > 0 && (
          <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {sellers.map((seller) => (
              <StallCard key={seller.userId} seller={seller} />
            ))}
          </section>
        )}
      </div>
    </main>
  );
}
