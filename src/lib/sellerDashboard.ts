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
  payment_status: 'paid' | 'pending' | 'credit' | null;
  is_special_customer: boolean | null;
  created_at: string | null;
  stitch_image: string | null;
  seller_user_id: string | null;
};

export type SellerProfile = {
  businessName: string;
  ownerName: string;
  phone: string;
  location: string;
  foodCategory: string;
};

export type SpecialCustomer = {
  id: string;
  phone: string;
  customerName: string;
  createdAt?: string;
};

const ORDER_STATUS_FLOW: Record<OrderStatus, { next: OrderStatus | null; label: string }> = {
  pending: { next: 'cooking', label: 'Mark Cooking' },
  cooking: { next: 'ready', label: 'Mark Ready' },
  ready: { next: 'completed', label: 'Complete' },
  completed: { next: null, label: 'Completed' },
};

const normalizeItems = (items: OrderRow['items']): OrderItem[] => {
  if (!Array.isArray(items) || items.length === 0) return [];
  if (typeof items[0] === 'string') {
    return (items as string[]).map((name) => ({ name, quantity: 1 }));
  }
  return items as OrderItem[];
};

const mapRowToOrder = (row: OrderRow): Order => ({
  id: String(row.id),
  customerName: row.customer_name?.trim() || 'Unknown Customer',
  items: normalizeItems(row.items),
  totalPrice: Number(row.total_price ?? 0),
  status: row.status ?? 'pending',
  paymentStatus: row.payment_status ?? 'paid',
  isSpecialCustomer: Boolean(row.is_special_customer),
  timestamp: row.created_at ?? new Date().toISOString(),
  stitchImage: row.stitch_image,
});

const getLocalDayBoundsIso = () => {
  const now = new Date();
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  const end = new Date(now);
  end.setHours(23, 59, 59, 999);
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
  const { startIso, endIso } = getLocalDayBoundsIso();
  const { data, error } = await supabase
    .from('orders')
    .select(
      'id, customer_name, items, total_price, status, payment_status, is_special_customer, created_at, stitch_image, seller_user_id',
    )
    .eq('seller_user_id', sellerUserId)
    .gte('created_at', startIso)
    .lte('created_at', endIso)
    .neq('status', 'completed')
    .order('created_at', { ascending: true });

  if (error) throw error;
  return ((data ?? []) as OrderRow[]).map(mapRowToOrder);
};

export const fetchRecentHistory = async (sellerUserId: string): Promise<Order[]> => {
  const now = new Date();
  const cutoff = new Date(now);
  cutoff.setDate(cutoff.getDate() - 14);

  const { data, error } = await supabase
    .from('orders')
    .select(
      'id, customer_name, items, total_price, status, payment_status, is_special_customer, created_at, stitch_image, seller_user_id',
    )
    .eq('seller_user_id', sellerUserId)
    .gte('created_at', cutoff.toISOString())
    .order('created_at', { ascending: false });

  if (error) throw error;
  return ((data ?? []) as OrderRow[]).map(mapRowToOrder);
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

export const fetchSpecialCustomers = async (sellerUserId: string): Promise<SpecialCustomer[]> => {
  const { data, error } = await supabase
    .from('special_customers')
    .select('id, phone, customer_name, created_at')
    .eq('seller_id', sellerUserId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []).map((row) => ({
    id: String(row.id),
    phone: row.phone ?? '',
    customerName: row.customer_name ?? '',
    createdAt: row.created_at ?? undefined,
  }));
};

export const addSpecialCustomer = async (
  sellerUserId: string,
  phone: string,
  customerName: string,
): Promise<SpecialCustomer> => {
  const cleanPhone = phone.trim();
  const cleanName = customerName.trim();
  if (!cleanPhone || !cleanName) {
    throw new Error('Phone and customer name are required.');
  }

  const { data, error } = await supabase
    .from('special_customers')
    .insert({
      seller_id: sellerUserId,
      phone: cleanPhone,
      customer_name: cleanName,
    })
    .select('id, phone, customer_name, created_at')
    .single();

  if (error) throw error;
  return {
    id: String(data.id),
    phone: data.phone ?? cleanPhone,
    customerName: data.customer_name ?? cleanName,
    createdAt: data.created_at ?? undefined,
  };
};

export const removeSpecialCustomer = async (sellerUserId: string, customerId: string): Promise<void> => {
  const { error } = await supabase
    .from('special_customers')
    .delete()
    .eq('seller_id', sellerUserId)
    .eq('id', customerId);
  if (error) throw error;
};
