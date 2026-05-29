'use client';

import { getBusynessLevel } from '@/lib/config';
import { supabase } from '@/lib/supabaseClient';

export type BusynessLevel = ReturnType<typeof getBusynessLevel>;

export type FoodCategory = {
  value: string;
  label: string;
  description: string;
};

export type DiscoverySeller = {
  userId: string;
  businessName: string;
  location: string;
  foodCategory: string;
  directionNote: string;
  ratingAvg: number;
  ratingCount: number;
  busynessLevel: BusynessLevel;
};

export type CustomerMenuItem = {
  id: string;
  sellerId: string;
  itemName: string;
  unitPrice: number;
};

type SellerRow = {
  user_id: string | null;
  business_name: string | null;
  location: string | null;
  food_category: string | null;
  direction_note: string | null;
  rating_avg: number | string | null;
  rating_count: number | null;
};

type LocationRow = {
  location: string | null;
};

type BusynessRow = {
  seller_user_id: string | null;
  active_order_count: number | string | null;
};

type MenuItemRow = {
  id: string;
  seller_id: string | null;
  item_name: string | null;
  unit_price: number | string | null;
};

export const FOOD_CATEGORIES: FoodCategory[] = [
  { value: 'waakye', label: 'Waakye', description: 'Rice, beans, shito, gari, and campus comfort.' },
  { value: 'shawarma', label: 'Shawarma', description: 'Fast wraps for lecture breaks and late cravings.' },
  { value: 'fufu', label: 'Fufu & Soup', description: 'Hearty bowls from nearby stalls.' },
  { value: 'rice', label: 'Rice & Stew', description: 'Reliable plates from familiar landmarks.' },
  { value: 'snacks', label: 'Snacks', description: 'Quick bites, pastries, and small chops.' },
  { value: 'other', label: 'Other', description: 'Everything delicious that refuses a neat box.' },
];

const mapSellerRow = (row: SellerRow, busynessLevel: BusynessLevel): DiscoverySeller => ({
  userId: row.user_id ?? '',
  businessName: row.business_name ?? 'Unnamed Stall',
  location: row.location ?? '',
  foodCategory: row.food_category ?? '',
  directionNote: row.direction_note ?? '',
  ratingAvg: Number(row.rating_avg ?? 0),
  ratingCount: row.rating_count ?? 0,
  busynessLevel,
});

export const fetchCategoryLocations = async (category: string): Promise<string[]> => {
  // TODO: Once admin approval is implemented, filter to status = 'active' only.
  const { data, error } = await supabase
    .from('sellers')
    .select('location')
    .eq('food_category', category)
    .or('status.is.null,status.in.(pending,active)')
    .order('location', { ascending: true });

  if (error) throw error;

  return Array.from(
    new Set(
      ((data ?? []) as LocationRow[])
        .map((row) => row.location?.trim() ?? '')
        .filter((location) => location.length > 0),
    ),
  );
};

export const fetchBusynessLevels = async (sellerUserIds: string[]): Promise<Map<string, BusynessLevel>> => {
  const levels = new Map<string, BusynessLevel>();
  if (sellerUserIds.length === 0) return levels;

  const { data, error } = await supabase
    .from('seller_hourly_busyness')
    .select('seller_user_id, active_order_count')
    .in('seller_user_id', sellerUserIds);

  if (error) throw error;

  for (const row of (data ?? []) as BusynessRow[]) {
    if (!row.seller_user_id) continue;
    levels.set(row.seller_user_id, getBusynessLevel(Number(row.active_order_count ?? 0)));
  }

  return levels;
};

export const fetchMarketplaceSellers = async (
  category: string,
  location: string,
): Promise<DiscoverySeller[]> => {
  // TODO: Once admin approval is implemented, filter to status = 'active' only.
  const { data, error } = await supabase
    .from('sellers')
    .select('user_id, business_name, location, food_category, direction_note, rating_avg, rating_count')
    .eq('food_category', category)
    .eq('location', location)
    .or('status.is.null,status.in.(pending,active)')
    .order('business_name', { ascending: true });

  if (error) throw error;

  const rows = ((data ?? []) as SellerRow[]).filter((row) => Boolean(row.user_id));
  const busynessLevels = await fetchBusynessLevels(rows.map((row) => row.user_id as string));

  return rows.map((row) => mapSellerRow(row, busynessLevels.get(row.user_id as string) ?? 'low'));
};

export const fetchStallDetails = async (stallId: string): Promise<DiscoverySeller> => {
  // TODO: Once admin approval is implemented, filter to status = 'active' only.
  const { data, error } = await supabase
    .from('sellers')
    .select('user_id, business_name, location, food_category, direction_note, rating_avg, rating_count')
    .eq('user_id', stallId)
    .or('status.is.null,status.in.(pending,active)')
    .single();

  if (error) throw error;

  const row = data as SellerRow;
  const busynessLevels = await fetchBusynessLevels(row.user_id ? [row.user_id] : []);
  return mapSellerRow(row, busynessLevels.get(row.user_id ?? '') ?? 'low');
};

export const fetchActiveMenuItems = async (sellerUserId: string): Promise<CustomerMenuItem[]> => {
  const { data, error } = await supabase
    .from('seller_menu_items')
    .select('id, seller_id, item_name, unit_price')
    .eq('seller_id', sellerUserId)
    .eq('is_active', true)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true });

  if (error) throw error;

  return ((data ?? []) as MenuItemRow[]).map((row) => ({
    id: row.id,
    sellerId: row.seller_id ?? '',
    itemName: row.item_name ?? '',
    unitPrice: Number(row.unit_price ?? 0),
  }));
};
