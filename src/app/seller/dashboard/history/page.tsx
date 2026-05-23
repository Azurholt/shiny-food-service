'use client';

import { useEffect, useMemo, useState } from 'react';
import { ChevronDown, ClipboardList } from 'lucide-react';
import { fetchRecentHistory, getSellerUserId } from '@/lib/sellerDashboard';
import type { Order } from '@/types/order';

type OrderGroup = {
  key: string;
  label: string;
  orders: Order[];
};

const formatDateLabel = (value: Date): string => {
  const now = new Date();
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);
  const yesterdayStart = new Date(todayStart);
  yesterdayStart.setDate(yesterdayStart.getDate() - 1);
  const valueStart = new Date(value);
  valueStart.setHours(0, 0, 0, 0);

  if (valueStart.getTime() === todayStart.getTime()) return 'Today';
  if (valueStart.getTime() === yesterdayStart.getTime()) return 'Yesterday';

  const day = String(value.getDate()).padStart(2, '0');
  const month = String(value.getMonth() + 1).padStart(2, '0');
  const year = value.getFullYear();
  return `${day}/${month}/${year}`;
};

export default function HistoryPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const uid = await getSellerUserId();
        const data = await fetchRecentHistory(uid);
        if (!mounted) return;
        setOrders(data);
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

  const groupedOrders = useMemo<OrderGroup[]>(() => {
    const groupsMap = new Map<string, OrderGroup>();

    for (const order of orders) {
      const orderDate = new Date(order.timestamp);
      if (Number.isNaN(orderDate.getTime())) continue;
      const dayKey = orderDate.toISOString().slice(0, 10);
      const existing = groupsMap.get(dayKey);
      if (existing) {
        existing.orders.push(order);
      } else {
        groupsMap.set(dayKey, {
          key: dayKey,
          label: formatDateLabel(orderDate),
          orders: [order],
        });
      }
    }

    return Array.from(groupsMap.values()).sort((a, b) => (a.key < b.key ? 1 : -1));
  }, [orders]);

  useEffect(() => {
    if (groupedOrders.length === 0) return;
    setExpandedGroups((current) => {
      const next = { ...current };
      for (const group of groupedOrders) {
        if (next[group.key] === undefined) next[group.key] = true;
      }
      return next;
    });
  }, [groupedOrders]);

  const toggleGroup = (key: string) => {
    setExpandedGroups((current) => ({ ...current, [key]: !current[key] }));
  };

  if (loading) return <p className="text-on_surface/70 font-body font-semibold">Loading history...</p>;
  if (error) return <p className="text-secondary font-body font-semibold">{error}</p>;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-tertiary text-xs font-display font-bold uppercase tracking-widest mb-1">Orders</p>
        <h1 className="text-3xl font-display font-bold text-on_surface">History</h1>
      </div>

      {groupedOrders.length === 0 ? (
        <section className="bg-surface_container_lowest rounded-2xl p-10 shadow-ambient text-center">
          <ClipboardList className="w-8 h-8 text-on_surface/40 mx-auto mb-3" />
          <p className="text-on_surface/50 font-body font-semibold">No orders</p>
        </section>
      ) : (
        <section className="space-y-3">
          {groupedOrders.map((group) => {
            const expanded = Boolean(expandedGroups[group.key]);
            return (
              <article key={group.key} className="bg-surface_container_lowest rounded-2xl p-3 shadow-ambient">
                <button
                  onClick={() => toggleGroup(group.key)}
                  className="w-full bg-surface_container_low rounded-xl px-4 py-3 flex items-center justify-between text-left"
                >
                  <div>
                    <p className="font-display font-bold text-on_surface">{group.label}</p>
                    <p className="text-sm font-body text-on_surface/60">{group.orders.length} orders</p>
                  </div>
                  <ChevronDown
                    className={`w-5 h-5 text-on_surface/60 transition-transform duration-200 ${expanded ? 'rotate-180' : 'rotate-0'}`}
                  />
                </button>

                <div
                  className={`overflow-hidden transition-all duration-300 ease-out ${expanded ? 'max-h-[2000px] opacity-100 mt-3' : 'max-h-0 opacity-0 mt-0'}`}
                >
                  <div className="space-y-2">
                    {group.orders.map((order) => (
                      <div key={order.id} className="bg-surface_container_low rounded-xl p-4">
                        <div className="flex justify-between gap-4">
                          <p className="font-body font-semibold text-on_surface">{order.customerName}</p>
                          <p className="font-display font-semibold text-primary">GHS {order.totalPrice.toFixed(2)}</p>
                        </div>
                        <p className="text-sm text-on_surface/70 font-body">{new Date(order.timestamp).toLocaleTimeString()}</p>
                        <p className="text-sm text-on_surface/80 font-body mt-1">
                          {order.items.map((item) => `${item.name} x${item.quantity}`).join(', ') || 'Missing order details'}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </article>
            );
          })}
        </section>
      )}
    </div>
  );
}
