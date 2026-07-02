'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { AlertCircle, CalendarDays, CheckCircle2, Clock, Phone, RefreshCw, ShieldCheck, ShoppingBag, Store } from 'lucide-react';
import {
  fetchCustomerProfile,
  fetchLatestActiveCustomerOrder,
  type CustomerActiveOrder,
  type CustomerProfile,
} from '@/lib/customerDashboard';
import type { OrderStatus } from '@/types/order';

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Pending',
  cooking: 'Cooking',
  ready: 'Ready',
  completed: 'Completed',
};

const STATUS_STYLES: Record<OrderStatus, string> = {
  pending: 'bg-tertiary_fixed_dim/25 text-tertiary',
  cooking: 'bg-primary_fixed_dim/25 text-primary',
  ready: 'bg-secondary/15 text-secondary',
  completed: 'bg-on_surface/10 text-on_surface/60',
};

function formatCurrency(value: number): string {
  return `GHS ${value.toFixed(2)}`;
}

function formatOrderTime(value: string): string {
  return new Date(value).toLocaleString([], {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function formatProfileDate(value: string | null): string {
  if (!value) return 'Not available';

  return new Date(value).toLocaleDateString([], {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatLastUpdated(value: Date | null): string {
  if (!value) return 'Not updated yet';

  const elapsedMinutes = Math.floor((Date.now() - value.getTime()) / 60000);
  if (elapsedMinutes <= 0) return 'Just now';
  if (elapsedMinutes === 1) return '1 min ago';
  return `${elapsedMinutes} min ago`;
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Unable to load your order status.';
}

export default function CustomerDashboardPage() {
  const [activeOrder, setActiveOrder] = useState<CustomerActiveOrder | null>(null);
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [customerProfile, order] = await Promise.all([
        fetchCustomerProfile(),
        fetchLatestActiveCustomerOrder(),
      ]);
      setProfile(customerProfile);
      setActiveOrder(order);
      setLastUpdated(new Date());
    } catch (loadError) {
      setError(getErrorMessage(loadError));
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshActiveOrder = useCallback(async () => {
    setRefreshing(true);
    setError('');
    try {
      const order = await fetchLatestActiveCustomerOrder();
      setActiveOrder(order);
      setLastUpdated(new Date());
    } catch (loadError) {
      setError(getErrorMessage(loadError));
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard().catch(() => undefined);
  }, [loadDashboard]);

  const lastUpdatedLabel = useMemo(() => formatLastUpdated(lastUpdated), [lastUpdated]);
  const isReady = activeOrder?.status === 'ready';

  return (
    <main className="min-h-screen bg-surface px-4 py-8 font-body">
      <div className="mx-auto max-w-4xl space-y-6">
        <section className="rounded-3xl bg-surface_container_low p-6 md:p-8">
          <p className="mb-2 text-xs font-display font-bold uppercase tracking-widest text-tertiary">Customer Dashboard</p>
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-4xl font-display font-bold tracking-tight text-on_surface">Your order status</h1>
              <p className="mt-3 max-w-2xl text-on_surface/70">
                Track your latest active order and refresh when you want a status check.
              </p>
            </div>
            <Link
              href="/customer/dashboard/marketplace"
              className="rounded-lg bg-gradient-to-br from-primary to-primary-container px-5 py-3 text-center font-body font-semibold text-white"
            >
              Browse Marketplace
            </Link>
          </div>
        </section>

        {error && (
          <section className="flex items-start gap-3 rounded-2xl bg-secondary/10 p-5 text-secondary">
            <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0" />
            <p className="font-body font-semibold">{error}</p>
          </section>
        )}

        <section className="rounded-2xl bg-surface_container_lowest p-6 shadow-ambient">
          <div className="mb-5">
            <h2 className="text-2xl font-display font-bold text-on_surface">Account Details</h2>
            <p className="mt-1 text-sm text-on_surface/60">Your customer profile for ordering and pickup updates.</p>
          </div>

          {loading ? (
            <div className="rounded-xl bg-surface_container_low p-6 text-center">
              <p className="font-body font-semibold text-on_surface/55">Loading your account details...</p>
            </div>
          ) : profile ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-xl bg-surface_container_low p-4">
                <Phone className="mb-2 h-4 w-4 text-primary" />
                <p className="text-xs font-body font-semibold uppercase tracking-wide text-on_surface/45">Phone</p>
                <p className="mt-1 font-body font-semibold text-on_surface">{profile.phone}</p>
              </div>
              <div className="rounded-xl bg-surface_container_low p-4">
                <CalendarDays className="mb-2 h-4 w-4 text-primary" />
                <p className="text-xs font-body font-semibold uppercase tracking-wide text-on_surface/45">Member Since</p>
                <p className="mt-1 font-body font-semibold text-on_surface">{formatProfileDate(profile.createdAt)}</p>
              </div>
              <div className="rounded-xl bg-surface_container_low p-4">
                <ShieldCheck className="mb-2 h-4 w-4 text-primary" />
                <p className="text-xs font-body font-semibold uppercase tracking-wide text-on_surface/45">Status</p>
                <p className="mt-1 font-body font-semibold text-on_surface">Signed in</p>
              </div>
            </div>
          ) : (
            <div className="rounded-xl bg-surface_container_low p-6 text-center">
              <p className="font-body font-semibold text-on_surface/55">Account details are unavailable.</p>
            </div>
          )}
        </section>

        <section className="rounded-2xl bg-surface_container_lowest p-6 shadow-ambient">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-display font-bold text-on_surface">Current Order</h2>
              <p className="mt-1 text-sm text-on_surface/60">Last updated: {lastUpdatedLabel}</p>
            </div>
            <button
              type="button"
              onClick={refreshActiveOrder}
              disabled={loading || refreshing}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary_fixed_dim/20 px-4 py-3 font-body font-semibold text-primary disabled:opacity-60"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Refreshing...' : 'Refresh Status'}
            </button>
          </div>

          {loading ? (
            <div className="rounded-xl bg-surface_container_low p-10 text-center">
              <p className="font-body font-semibold text-on_surface/55">Loading your latest order...</p>
            </div>
          ) : activeOrder ? (
            <article className={`rounded-2xl p-5 ${isReady ? 'bg-secondary/10' : 'bg-surface_container_low'}`}>
              <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-xs font-display font-bold uppercase tracking-widest text-tertiary">Order #{activeOrder.id}</p>
                  <h3 className="mt-1 text-3xl font-display font-bold text-on_surface">{activeOrder.sellerName}</h3>
                </div>
                <div className="flex flex-wrap gap-2 sm:justify-end">
                  <span className={`rounded-full px-3 py-1 text-xs font-display font-bold uppercase tracking-wide ${STATUS_STYLES[activeOrder.status]}`}>
                    {STATUS_LABELS[activeOrder.status]}
                  </span>
                  {isReady && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-xs font-display font-bold uppercase tracking-wide text-white">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Ready for pickup!
                    </span>
                  )}
                </div>
              </div>

              <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="rounded-xl bg-surface_container_lowest p-4">
                  <Store className="mb-2 h-4 w-4 text-primary" />
                  <p className="text-xs font-body font-semibold uppercase tracking-wide text-on_surface/45">Seller</p>
                  <p className="mt-1 font-body font-semibold text-on_surface">{activeOrder.sellerName}</p>
                </div>
                <div className="rounded-xl bg-surface_container_lowest p-4">
                  <Clock className="mb-2 h-4 w-4 text-primary" />
                  <p className="text-xs font-body font-semibold uppercase tracking-wide text-on_surface/45">Placed</p>
                  <p className="mt-1 font-body font-semibold text-on_surface">{formatOrderTime(activeOrder.timestamp)}</p>
                </div>
                <div className="rounded-xl bg-surface_container_lowest p-4">
                  <ShoppingBag className="mb-2 h-4 w-4 text-primary" />
                  <p className="text-xs font-body font-semibold uppercase tracking-wide text-on_surface/45">Total</p>
                  <p className="mt-1 font-display font-bold text-primary">{formatCurrency(activeOrder.totalPrice)}</p>
                </div>
              </div>

              <div className="rounded-xl bg-surface_container_lowest p-4">
                <p className="mb-3 text-sm font-body font-semibold text-on_surface">Items</p>
                {activeOrder.items.length === 0 ? (
                  <p className="text-sm text-on_surface/55">No item details were saved for this order.</p>
                ) : (
                  <div className="space-y-2">
                    {activeOrder.items.map((item) => (
                      <div key={`${item.name}-${item.quantity}-${item.price ?? 0}`} className="flex items-center justify-between gap-3 text-sm">
                        <span className="font-body text-on_surface/80">{item.name}</span>
                        <span className="font-body font-semibold text-on_surface">x{item.quantity}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </article>
          ) : (
            <div className="rounded-xl bg-surface_container_low p-10 text-center">
              <ShoppingBag className="mx-auto mb-3 h-8 w-8 text-on_surface/35" />
              <h3 className="text-xl font-display font-bold text-on_surface">No active order</h3>
              <p className="mx-auto mt-2 max-w-md text-sm text-on_surface/60">
                You do not have a pending, cooking, or ready order right now.
              </p>
              <Link
                href="/customer/dashboard/marketplace"
                className="mt-5 inline-flex rounded-lg bg-gradient-to-br from-primary to-primary-container px-5 py-3 font-body font-semibold text-white"
              >
                Find food nearby
              </Link>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
