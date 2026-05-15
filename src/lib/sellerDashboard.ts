'use client';

import type { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabaseClient';
import type { Order, OrderItem, OrderStatus } from '@/types/order';

type OrderRow = {
  id: string | number;
  customer_name: string | null;
  items: OrderItem[] | string[] | null;
  total_price: number | null;
  status: OrderStatus | null;
  created_at: string | null;
  stitch_image: string | null;
  seller_user_id: string | null;
};

export type HistoryAggregate = {
  day: string;
  orderCount: number;
  totalRevenue: number;
};

export type SellerProfile = {
  businessName: string;
  ownerName: string;
  phone: string;
  location: string;
  foodCategory: string;
};

const ORDER_STATUS_FLOW: Record<OrderStatus, { next: OrderStatus | null; label: string }> = {
  pending: { next: 'cooking', label: 'Mark Cooking' },
  cooking: { next: 'ready', label: 'Mark Ready' },
  ready: { next: 'completed', label: 'Complete' },
  completed: { next: null, label: 'Completed' },
};

const normalizeItems = (items: OrderRow['items']): OrderItem[] => {
  if (!Array.isArray(items)) return [];
  if (items.length === 0) return [];
  if (typeof items[0] === 'string') {
    return (items as string[]).map((name) => ({ name, quantity: 1 }));
  }
  return items as OrderItem[];
};

const mapRowToOrder = (row: OrderRow): Order => ({
  id: String(row.id),
  customerName: row.customer_name ?? 'Unknown Customer',
  items: normalizeItems(row.items),
  totalPrice: row.total_price ?? 0,
  status: row.status ?? 'pending',
  timestamp: row.created_at ?? new Date().toISOString(),
  stitchImage: row.stitch_image,
});

const getDayBoundsIso = () => {
  const now = new Date();
  const start = new Date(now);
  start.setUTCHours(0, 0, 0, 0);
  const end = new Date(now);
  end.setUTCHours(23, 59, 59, 999);
  return {
    startIso: start.toISOString(),
    endIso: end.toISOString(),
  };
};

export const getNextStatusMeta = (status: OrderStatus) => ORDER_STATUS_FLOW[status];

export const getSellerUserId = async (): Promise<string> => {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user?.id) {
    throw new Error('You need to sign in again.');
  }
  return data.user.id;
};

export const fetchTodayActiveOrders = async (sellerUserId: string): Promise<Order[]> => {
  const { startIso, endIso } = getDayBoundsIso();
  const { data, error } = await supabase
    .from('orders')
    .select('id, customer_name, items, total_price, status, created_at, stitch_image, seller_user_id')
    .eq('seller_user_id', sellerUserId)
    .gte('created_at', startIso)
    .lte('created_at', endIso)
    .neq('status', 'completed')
    .order('created_at', { ascending: true });

  if (error) throw error;
  return ((data ?? []) as OrderRow[]).map(mapRowToOrder);
};

export const fetchHistorySplit = async (
  sellerUserId: string,
): Promise<{ recent: Order[]; aggregated: HistoryAggregate[] }> => {
  const now = new Date();
  const cutoff = new Date(now);
  cutoff.setUTCDate(cutoff.getUTCDate() - 14);

  const { data, error } = await supabase
    .from('orders')
    .select('id, customer_name, items, total_price, status, created_at, stitch_image, seller_user_id')
    .eq('seller_user_id', sellerUserId)
    .order('created_at', { ascending: false });

  if (error) throw error;

  const recent: Order[] = [];
  const aggregatedMap = new Map<string, HistoryAggregate>();

  for (const row of (data ?? []) as OrderRow[]) {
    const date = new Date(row.created_at ?? 0);
    if (Number.isNaN(date.getTime())) continue;
    const order = mapRowToOrder(row);
    if (date >= cutoff) {
      recent.push(order);
      continue;
    }
    const day = date.toISOString().slice(0, 10);
    const existing = aggregatedMap.get(day) ?? { day, orderCount: 0, totalRevenue: 0 };
    existing.orderCount += 1;
    existing.totalRevenue += order.totalPrice;
    aggregatedMap.set(day, existing);
  }

  return {
    recent,
    aggregated: Array.from(aggregatedMap.values()).sort((a, b) => (a.day < b.day ? 1 : -1)),
  };
};

export const updateOrderStatus = async (orderId: string, status: OrderStatus): Promise<void> => {
  const { error } = await supabase.from('orders').update({ status }).eq('id', orderId);
  if (error) throw error;
};

export const subscribeToSellerOrders = (
  sellerUserId: string,
  onChange: () => void,
): RealtimeChannel => {
  return supabase
    .channel(`seller-orders-${sellerUserId}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'orders', filter: `seller_user_id=eq.${sellerUserId}` },
      onChange,
    )
    .subscribe();
};

export const fetchSellerProfile = async (sellerUserId: string): Promise<SellerProfile> => {
  const { data, error } = await supabase
    .from('sellers')
    .select('business_name, owner_name, phone, location, food_category')
    .eq('user_id', sellerUserId)
    .single();

  if (error) throw error;

  return {
    businessName: data.business_name ?? '',
    ownerName: data.owner_name ?? '',
    phone: data.phone ?? '',
    location: data.location ?? '',
    foodCategory: data.food_category ?? '',
  };
};

export const saveSellerProfile = async (sellerUserId: string, profile: SellerProfile): Promise<void> => {
  const { error } = await supabase
    .from('sellers')
    .update({
      business_name: profile.businessName,
      owner_name: profile.ownerName,
      phone: profile.phone,
      location: profile.location,
      food_category: profile.foodCategory,
    })
    .eq('user_id', sellerUserId);
  if (error) throw error;
};

export const fetchTrustedCustomers = async (sellerUserId: string): Promise<string[]> => {
  const { data, error } = await supabase
    .from('seller_trusted_customers')
    .select('customer_name')
    .eq('seller_user_id', sellerUserId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []).map((row) => row.customer_name).filter(Boolean);
};

export const addTrustedCustomer = async (sellerUserId: string, customerName: string): Promise<void> => {
  const cleanName = customerName.trim();
  if (!cleanName) return;
  const { error } = await supabase.from('seller_trusted_customers').insert({
    seller_user_id: sellerUserId,
    customer_name: cleanName,
  });
  if (error) throw error;
};

export const removeTrustedCustomer = async (sellerUserId: string, customerName: string): Promise<void> => {
  const { error } = await supabase
    .from('seller_trusted_customers')
    .delete()
    .eq('seller_user_id', sellerUserId)
    .eq('customer_name', customerName);
  if (error) throw error;
};
