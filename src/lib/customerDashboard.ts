'use client';

import { supabase } from '@/lib/supabaseClient';
import type { Order, OrderItem, OrderStatus } from '@/types/order';

type CustomerOrderRow = {
  id: string | number;
  customer_name: string | null;
  items: OrderItem[] | string[] | null;
  total_price: number | string | null;
  status: OrderStatus | null;
  payment_status: 'paid' | 'pending' | 'credit' | null;
  is_special_customer: boolean | null;
  created_at: string | null;
  stitch_image: string | null;
  seller_user_id: string | null;
};

type SellerNameRow = {
  business_name: string | null;
};

type CustomerProfileRow = {
  id: string | null;
  phone: string | null;
  created_at: string | null;
};

export type CustomerActiveOrder = Order & {
  sellerId: string;
  sellerName: string;
};

export type CustomerProfile = {
  id: string;
  phone: string;
  createdAt: string | null;
};

const ACTIVE_ORDER_STATUSES: OrderStatus[] = ['pending', 'cooking', 'ready'];

const normalizeItems = (items: CustomerOrderRow['items']): OrderItem[] => {
  if (!Array.isArray(items) || items.length === 0) return [];
  if (typeof items[0] === 'string') {
    return (items as string[]).map((name) => ({ name, quantity: 1 }));
  }
  return items as OrderItem[];
};

const mapRowToCustomerOrder = (row: CustomerOrderRow, sellerName: string): CustomerActiveOrder => ({
  id: String(row.id),
  customerName: row.customer_name?.trim() || 'Customer',
  items: normalizeItems(row.items),
  totalPrice: Number(row.total_price ?? 0),
  status: row.status ?? 'pending',
  paymentStatus: row.payment_status ?? 'pending',
  isSpecialCustomer: Boolean(row.is_special_customer),
  timestamp: row.created_at ?? new Date().toISOString(),
  stitchImage: row.stitch_image,
  sellerId: row.seller_user_id ?? '',
  sellerName,
});

const fetchSellerName = async (sellerUserId: string | null): Promise<string> => {
  if (!sellerUserId) return 'Your seller';

  const { data, error } = await supabase
    .from('sellers')
    .select('business_name')
    .eq('user_id', sellerUserId)
    .maybeSingle();

  if (error) return 'Your seller';

  const row = data as SellerNameRow | null;
  return row?.business_name?.trim() || 'Your seller';
};

export const getCustomerUserId = async (): Promise<string> => {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user?.id) {
    throw new Error('You need to sign in again.');
  }
  return data.user.id;
};

export const fetchLatestActiveCustomerOrder = async (): Promise<CustomerActiveOrder | null> => {
  const customerUserId = await getCustomerUserId();
  const { data, error } = await supabase
    .from('orders')
    .select(
      'id, customer_name, items, total_price, status, payment_status, is_special_customer, created_at, stitch_image, seller_user_id',
    )
    .eq('customer_id', customerUserId)
    .in('status', ACTIVE_ORDER_STATUSES)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  const orderRow = data as CustomerOrderRow;
  const sellerName = await fetchSellerName(orderRow.seller_user_id);
  return mapRowToCustomerOrder(orderRow, sellerName);
};

export const fetchCustomerProfile = async (): Promise<CustomerProfile> => {
  const customerUserId = await getCustomerUserId();
  const { data, error } = await supabase
    .from('customers')
    .select('id, phone, created_at')
    .eq('id', customerUserId)
    .maybeSingle();

  if (error) throw error;

  const row = data as CustomerProfileRow | null;
  return {
    id: row?.id ?? customerUserId,
    phone: row?.phone?.trim() || 'Phone unavailable',
    createdAt: row?.created_at ?? null,
  };
};
