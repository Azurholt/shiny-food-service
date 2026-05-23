'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { ClipboardList, MapPin, User, Utensils, X } from 'lucide-react';
import type { Order, OrderStatus } from '@/types/order';
import {
  fetchTodayActiveOrders,
  getNextStatusMeta,
  getSellerUserId,
  subscribeToSellerOrders,
  updateOrderStatus,
} from '@/lib/sellerDashboard';
import { supabase } from '@/lib/supabaseClient';

const statusStyles: Record<OrderStatus, string> = {
  pending: 'bg-tertiary_fixed_dim/30 text-tertiary',
  cooking: 'bg-primary_fixed_dim/30 text-primary',
  ready: 'bg-secondary/20 text-secondary',
  completed: 'bg-on_surface/10 text-on_surface/60',
};

const paymentStatusStyles: Record<Order['paymentStatus'], string> = {
  paid: 'bg-primary_fixed_dim/30 text-primary',
  pending: 'bg-tertiary_fixed_dim/30 text-tertiary',
  credit: 'bg-secondary/20 text-secondary',
};

export default function QueuePage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [sellerUserId, setSellerUserId] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadOrders = useCallback(async (uid: string) => {
    const data = await fetchTodayActiveOrders(uid);
    setOrders(data);
  }, []);

  useEffect(() => {
    let mounted = true;
    const init = async () => {
      try {
        const uid = await getSellerUserId();
        if (!mounted) return;
        setSellerUserId(uid);
        await loadOrders(uid);
      } catch (err: any) {
        setError(err.message ?? 'Unable to load queue.');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    init();
    return () => {
      mounted = false;
    };
  }, [loadOrders]);

  useEffect(() => {
    if (!sellerUserId) return;
    const channel = subscribeToSellerOrders(sellerUserId, () => {
      loadOrders(sellerUserId).catch(() => undefined);
    });
    return () => {
      supabase.removeChannel(channel);
    };
  }, [sellerUserId, loadOrders]);

  const onAdvanceStatus = async (order: Order) => {
    const meta = getNextStatusMeta(order.status);
    if (!meta.next) return;

    const previous = orders;
    const nextStatus = meta.next;
    setOrders((current) =>
      current
        .map((entry) => (entry.id === order.id ? { ...entry, status: nextStatus } : entry))
        .filter((entry) => entry.status !== 'completed'),
    );
    try {
      await updateOrderStatus(order.id, nextStatus);
      if (selectedOrder?.id === order.id) {
        if (nextStatus === 'completed') setSelectedOrder(null);
        else setSelectedOrder({ ...selectedOrder, status: nextStatus });
      }
    } catch {
      setOrders(previous);
      setError('Failed to update order status. Please try again.');
    }
  };

  const emptyMessage = useMemo(() => {
    if (loading) return 'Loading queue...';
    if (error) return error;
    return 'No orders';
  }, [loading, error]);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-tertiary text-xs font-bold uppercase tracking-widest mb-1">Live Dashboard</p>
        <h1 className="text-3xl font-display font-bold text-on_surface">Queue</h1>
      </div>

      {orders.length === 0 ? (
        <div className="bg-surface_container_lowest rounded-2xl p-10 shadow-ambient text-center">
          <ClipboardList className="w-8 h-8 text-on_surface/40 mx-auto mb-3" />
          <p className="text-on_surface/50 font-body font-semibold">{emptyMessage}</p>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => {
            const meta = getNextStatusMeta(order.status);
            return (
              <article key={order.id} className="bg-surface_container_lowest rounded-xl p-5 shadow-ambient">
                <div className="flex justify-between items-start mb-4 gap-2">
                  <div>
                    <p className="text-xs text-on_surface/50 font-medium mb-0.5">Order</p>
                    <h2 className="text-2xl font-display font-bold text-primary tracking-tight">{order.id}</h2>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${statusStyles[order.status]}`}>
                      {order.status}
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide ${paymentStatusStyles[order.paymentStatus]}`}
                    >
                      {order.paymentStatus}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 mb-5">
                  <div className="flex items-center gap-2 text-on_surface/80">
                    <User className="w-4 h-4 text-primary/60" />
                    <span className="text-sm font-medium">{order.customerName}</span>
                  </div>
                  <div className="flex items-center gap-2 text-on_surface/80">
                    <MapPin className="w-4 h-4 text-primary/60" />
                    <span className="text-sm font-medium">{new Date(order.timestamp).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-2 text-on_surface/80">
                    <Utensils className="w-4 h-4 text-primary/60" />
                    <span className="text-sm">{order.items.map((item) => `${item.name} x${item.quantity}`).join(', ') || 'Missing order details'}</span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setSelectedOrder(order)}
                    className="flex-1 py-3 px-4 rounded-lg text-sm font-semibold text-on_surface bg-surface_container_low hover:bg-surface transition"
                  >
                    View Details
                  </button>
                  <button
                    disabled={!meta.next}
                    onClick={() => onAdvanceStatus(order)}
                    className="flex-1 py-3 px-4 bg-gradient-to-br from-primary to-primary-container text-white rounded-lg text-sm font-semibold shadow-sm hover:opacity-90 transition disabled:bg-on_surface/30 disabled:cursor-not-allowed"
                  >
                    {meta.label}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {selectedOrder && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-on_surface/10 backdrop-blur p-4" onClick={() => setSelectedOrder(null)}>
          <div className="bg-surface_container_lowest w-full max-w-md rounded-2xl p-6 shadow-ambient relative" onClick={(e) => e.stopPropagation()}>
            <button
              aria-label="Close"
              onClick={() => setSelectedOrder(null)}
              className="absolute right-4 top-4 p-1 text-on_surface/60 hover:text-on_surface"
            >
              <X className="w-5 h-5" />
            </button>
            <p className="text-tertiary text-xs font-bold uppercase tracking-widest mb-1">Order #{selectedOrder.id}</p>
            <h2 className="text-2xl font-display font-bold text-primary mb-4">{selectedOrder.customerName}</h2>
            <div className="aspect-video rounded-lg bg-surface_container_low overflow-hidden mb-4">
              {selectedOrder.stitchImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={selectedOrder.stitchImage} alt="Stitch order preview" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-on_surface/50 text-sm">Missing order image</div>
              )}
            </div>
            <div className="space-y-2 text-sm text-on_surface/80 mb-5">
              {selectedOrder.items.length > 0 ? (
                selectedOrder.items.map((item) => (
                  <div key={`${item.name}-${item.quantity}`} className="flex justify-between">
                    <span>{item.name}</span>
                    <span>x{item.quantity}</span>
                  </div>
                ))
              ) : (
                <p>Missing order details</p>
              )}
              <div className="pt-2 border-t border-outline_variant/15 flex justify-between font-semibold text-on_surface">
                <span>Total</span>
                <span>GHS {selectedOrder.totalPrice.toFixed(2)}</span>
              </div>
            </div>
            <button
              onClick={() => onAdvanceStatus(selectedOrder)}
              className="w-full bg-gradient-to-br from-primary to-primary-container text-white py-3 rounded-lg font-semibold shadow-sm hover:opacity-90 transition"
            >
              {getNextStatusMeta(selectedOrder.status).label}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
