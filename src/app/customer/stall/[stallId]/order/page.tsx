'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import {
  fetchActiveMenuItems,
  fetchStallDetails,
  type CustomerMenuItem,
  type DiscoverySeller,
} from '@/lib/customerDiscovery';
import { supabase } from '@/lib/supabaseClient';

type OrderLine = {
  clientId: string;
  itemName: string;
  quantity: number;
  unitPrice: number;
};

function formatCurrency(value: number): string {
  return `₵${value.toFixed(2)}`;
}

function getLineTotal(line: OrderLine): number {
  return line.quantity * line.unitPrice;
}

function createClientId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export default function CustomerStallOrderPage() {
  const params = useParams<{ stallId: string }>();
  const stallId = useMemo(() => params.stallId, [params.stallId]);
  const [seller, setSeller] = useState<DiscoverySeller | null>(null);
  const [menuItems, setMenuItems] = useState<CustomerMenuItem[]>([]);
  const [lines, setLines] = useState<OrderLine[]>([]);
  const [customName, setCustomName] = useState('');
  const [customPrice, setCustomPrice] = useState('');
  const [calculatedTotal, setCalculatedTotal] = useState<number | null>(null);
  const [orderId, setOrderId] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
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
        setError(loadError instanceof Error ? loadError.message : 'Unable to load order form.');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, [stallId]);

  const resetCalculatedTotal = () => setCalculatedTotal(null);

  const addMenuItem = (item: CustomerMenuItem) => {
    setLines((current) => {
      const existing = current.find((line) => line.itemName === item.itemName && line.unitPrice === item.unitPrice);
      if (existing) {
        return current.map((line) =>
          line.clientId === existing.clientId ? { ...line, quantity: line.quantity + 1 } : line,
        );
      }
      return [
        ...current,
        {
          clientId: createClientId(),
          itemName: item.itemName,
          quantity: 1,
          unitPrice: item.unitPrice,
        },
      ];
    });
    resetCalculatedTotal();
  };

  const addCustomItem = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const cleanName = customName.trim();
    const price = Number(customPrice);

    if (!cleanName || cleanName.length > 80 || !Number.isFinite(price) || price < 0) {
      setError('Custom item needs a name up to 80 characters and a valid price.');
      return;
    }

    setLines((current) => [
      ...current,
      {
        clientId: createClientId(),
        itemName: cleanName,
        quantity: 1,
        unitPrice: Number(price.toFixed(2)),
      },
    ]);
    setCustomName('');
    setCustomPrice('');
    setError('');
    resetCalculatedTotal();
  };

  const updateQuantity = (clientId: string, quantity: number) => {
    setLines((current) =>
      current.map((line) =>
        line.clientId === clientId ? { ...line, quantity: Math.max(1, Math.min(99, quantity)) } : line,
      ),
    );
    resetCalculatedTotal();
  };

  const removeLine = (clientId: string) => {
    setLines((current) => current.filter((line) => line.clientId !== clientId));
    resetCalculatedTotal();
  };

  const calculateTotal = () => {
    if (lines.length === 0) {
      setError('Add at least one item before calculating total.');
      return;
    }
    setCalculatedTotal(lines.reduce((total, line) => total + getLineTotal(line), 0));
    setError('');
  };

  const submitOrder = async () => {
    if (!seller || lines.length === 0) return;
    if (calculatedTotal === null) {
      setError('Click Calculate Total before submitting your order.');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      const { data, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !data.session?.access_token) {
        throw new Error('You need to sign in again.');
      }

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${data.session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sellerId: seller.userId,
          items: lines.map((line) => ({
            itemName: line.itemName,
            quantity: line.quantity,
            unitPrice: line.unitPrice,
          })),
        }),
      });

      const body = (await response.json()) as { orderId?: string; error?: string };
      if (!response.ok) {
        throw new Error(body.error ?? 'Unable to place order.');
      }

      setOrderId(body.orderId ?? '');
      setLines([]);
      setCalculatedTotal(null);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Unable to place order.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-surface px-4 py-10 font-body">
        <section className="mx-auto max-w-3xl rounded-2xl bg-surface_container_lowest p-10 text-center shadow-ambient">
          <p className="font-semibold text-on_surface/60">Loading order form...</p>
        </section>
      </main>
    );
  }

  if (error && !seller) {
    return (
      <main className="min-h-screen bg-surface px-4 py-10 font-body">
        <section className="mx-auto max-w-3xl rounded-2xl bg-secondary/10 p-6 text-secondary">
          <p className="font-semibold">{error}</p>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-surface px-4 py-8 font-body">
      <div className="mx-auto max-w-3xl space-y-6">
        <Link href={`/customer/stall/${stallId}`} className="inline-flex text-sm font-body font-semibold text-primary">
          Back to stall
        </Link>

        <section className="rounded-3xl bg-surface_container_low p-6 md:p-8">
          <p className="mb-2 text-xs font-display font-bold uppercase tracking-widest text-tertiary">Order</p>
          <h1 className="text-4xl font-display font-bold tracking-tight text-on_surface">{seller?.businessName ?? 'Stall'}</h1>
          <p className="mt-3 text-on_surface/70">Add seller menu items or enter a custom item with your price.</p>
        </section>

        {orderId && (
          <section className="rounded-2xl bg-primary_fixed_dim/20 p-5 text-primary">
            <p className="font-body font-semibold">Order placed. Reference: {orderId}</p>
          </section>
        )}

        {error && seller && <p className="rounded-xl bg-secondary/10 px-4 py-3 text-sm font-body font-semibold text-secondary">{error}</p>}

        <section className="rounded-2xl bg-surface_container_lowest p-6 shadow-ambient">
          <h2 className="mb-4 text-xl font-display font-bold text-on_surface">Quick Add</h2>
          {menuItems.length === 0 ? (
            <div className="rounded-xl bg-surface_container_low p-6 text-center">
              <p className="font-body text-on_surface/55">This seller has not listed quick-add items yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => addMenuItem(item)}
                  className="rounded-xl bg-surface_container_low p-4 text-left transition hover:bg-primary_fixed_dim/20"
                >
                  <span className="block font-body font-semibold text-on_surface">{item.itemName}</span>
                  <span className="mt-1 block font-display font-bold text-primary">{formatCurrency(item.unitPrice)}</span>
                </button>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-2xl bg-surface_container_lowest p-6 shadow-ambient">
          <h2 className="mb-4 text-xl font-display font-bold text-on_surface">Custom Item</h2>
          <form onSubmit={addCustomItem} className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_160px_160px]">
            <input
              value={customName}
              onChange={(event) => setCustomName(event.target.value)}
              placeholder="Item name"
              maxLength={80}
              className="bg-transparent px-1 py-3 font-body text-on_surface placeholder:text-on_surface/40 border-b border-outline_variant/40 focus:border-b-2 focus:border-primary focus:outline-none"
            />
            <input
              value={customPrice}
              onChange={(event) => setCustomPrice(event.target.value)}
              placeholder="Unit price"
              inputMode="decimal"
              className="bg-transparent px-1 py-3 font-body text-on_surface placeholder:text-on_surface/40 border-b border-outline_variant/40 focus:border-b-2 focus:border-primary focus:outline-none"
            />
            <button type="submit" className="rounded-lg bg-gradient-to-br from-primary to-primary-container px-4 py-3 font-body font-semibold text-white">
              Add Custom
            </button>
          </form>
        </section>

        <section className="rounded-2xl bg-surface_container_lowest p-6 shadow-ambient">
          <h2 className="mb-4 text-xl font-display font-bold text-on_surface">Your Order</h2>
          {lines.length === 0 ? (
            <div className="rounded-xl bg-surface_container_low p-6 text-center">
              <p className="font-body text-on_surface/55">No items added yet.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {lines.map((line) => (
                <div key={line.clientId} className="rounded-xl bg-surface_container_low p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-body font-semibold text-on_surface">{line.itemName}</p>
                      <p className="text-sm font-body text-on_surface/65">
                        {formatCurrency(line.unitPrice)} each · line total {formatCurrency(getLineTotal(line))}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={1}
                        max={99}
                        value={line.quantity}
                        onChange={(event) => updateQuantity(line.clientId, Number(event.target.value))}
                        className="w-20 bg-transparent px-1 py-2 text-center font-body text-on_surface border-b border-outline_variant/40 focus:border-b-2 focus:border-primary focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => removeLine(line.clientId)}
                        className="rounded-lg bg-secondary/10 px-3 py-2 text-sm font-body font-semibold text-secondary"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-lg font-display font-bold text-on_surface">
              Total: {calculatedTotal === null ? 'Click Calculate Total' : formatCurrency(calculatedTotal)}
            </p>
            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                onClick={calculateTotal}
                className="rounded-lg bg-primary_fixed_dim/20 px-5 py-3 font-body font-semibold text-primary"
              >
                Calculate Total
              </button>
              <button
                type="button"
                onClick={submitOrder}
                disabled={submitting || lines.length === 0}
                className="rounded-lg bg-gradient-to-br from-primary to-primary-container px-5 py-3 font-body font-semibold text-white disabled:opacity-60"
              >
                {submitting ? 'Submitting...' : 'Submit Order'}
              </button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
