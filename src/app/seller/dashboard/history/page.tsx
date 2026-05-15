'use client';

import { useEffect, useState } from 'react';
import { fetchHistorySplit, getSellerUserId, type HistoryAggregate } from '@/lib/sellerDashboard';
import type { Order } from '@/types/order';

export default function HistoryPage() {
  const [recent, setRecent] = useState<Order[]>([]);
  const [aggregated, setAggregated] = useState<HistoryAggregate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const uid = await getSellerUserId();
        const data = await fetchHistorySplit(uid);
        if (!mounted) return;
        setRecent(data.recent);
        setAggregated(data.aggregated);
      } catch (err: any) {
        if (mounted) setError(err.message ?? 'Unable to load history.');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) return <p className="text-on_surface/70 font-semibold">Loading history...</p>;
  if (error) return <p className="text-secondary font-semibold">{error}</p>;
  if (recent.length === 0 && aggregated.length === 0) {
    return <p className="text-on_surface/70 font-semibold">No history data yet.</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-tertiary text-xs font-bold uppercase tracking-widest mb-1">Orders</p>
        <h1 className="text-3xl font-display font-bold text-on_surface">History</h1>
      </div>

      <section className="bg-surface_container_lowest rounded-xl p-5 shadow-ambient">
        <h2 className="text-lg font-display font-bold text-on_surface mb-4">Detailed (Last 14 Days)</h2>
        {recent.length === 0 ? (
          <p className="text-on_surface/60">No orders in the last 14 days.</p>
        ) : (
          <div className="space-y-3">
            {recent.map((order) => (
              <div key={order.id} className="p-4 bg-surface rounded-lg">
                <div className="flex justify-between gap-4">
                  <p className="font-semibold text-on_surface">{order.customerName}</p>
                  <p className="font-semibold text-primary">GHS {order.totalPrice.toFixed(2)}</p>
                </div>
                <p className="text-sm text-on_surface/70">{new Date(order.timestamp).toLocaleString()}</p>
                <p className="text-sm text-on_surface/80 mt-1">
                  {order.items.map((item) => `${item.name} x${item.quantity}`).join(', ') || 'Missing order details'}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="bg-surface_container_low rounded-xl p-5">
        <h2 className="text-lg font-display font-bold text-on_surface mb-4">Aggregated (Older Than 14 Days)</h2>
        {aggregated.length === 0 ? (
          <p className="text-on_surface/60">No aggregated history yet.</p>
        ) : (
          <div className="space-y-2">
            {aggregated.map((entry) => (
              <div key={entry.day} className="grid grid-cols-3 p-3 bg-surface_container_lowest rounded-lg text-sm">
                <span className="font-semibold text-on_surface">{entry.day}</span>
                <span className="text-on_surface/70">{entry.orderCount} orders</span>
                <span className="text-primary font-semibold">GHS {entry.totalRevenue.toFixed(2)}</span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
