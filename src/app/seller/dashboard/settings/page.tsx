'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  addSpecialCustomer,
  createSellerMenuItem,
  deleteSellerMenuItem,
  fetchSellerMenuItems,
  fetchSellerProfile,
  fetchSpecialCustomers,
  getSellerUserId,
  removeSpecialCustomer,
  saveSellerProfile,
  setSellerMenuItemActive,
  updateSellerMenuItem,
  type SellerMenuItem,
  type SellerProfile,
  type SpecialCustomer,
} from '@/lib/sellerDashboard';
import { supabase } from '@/lib/supabaseClient';

const DIRECTION_NOTE_MAX_LENGTH = 200;

const EMPTY_PROFILE: SellerProfile = {
  businessName: '',
  ownerName: '',
  phone: '',
  location: '',
  foodCategory: '',
  directionNote: '',
  status: '',
};

const PROFILE_FIELDS: Array<{
  key: keyof Pick<SellerProfile, 'businessName' | 'ownerName' | 'phone' | 'location' | 'foodCategory'>;
  label: string;
}> = [
  { key: 'businessName', label: 'Business Name' },
  { key: 'ownerName', label: 'Owner Name' },
  { key: 'phone', label: 'Phone' },
  { key: 'location', label: 'Location' },
  { key: 'foodCategory', label: 'Food Category' },
];

function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

function formatCurrency(value: number): string {
  return `₵${value.toFixed(2)}`;
}

export default function SettingsPage() {
  const router = useRouter();
  const [sellerUserId, setSellerUserId] = useState('');
  const [profile, setProfile] = useState<SellerProfile>(EMPTY_PROFILE);
  const [specialCustomers, setSpecialCustomers] = useState<SpecialCustomer[]>([]);
  const [menuItems, setMenuItems] = useState<SellerMenuItem[]>([]);
  const [newPhone, setNewPhone] = useState('');
  const [newCustomerName, setNewCustomerName] = useState('');
  const [menuName, setMenuName] = useState('');
  const [menuPrice, setMenuPrice] = useState('');
  const [editingMenuId, setEditingMenuId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingDirections, setSavingDirections] = useState(false);
  const [savingMenu, setSavingMenu] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const uid = await getSellerUserId();
        const [profileData, customersData, menuData] = await Promise.all([
          fetchSellerProfile(uid),
          fetchSpecialCustomers(uid),
          fetchSellerMenuItems(uid),
        ]);
        if (!mounted) return;
        setSellerUserId(uid);
        setProfile(profileData);
        setSpecialCustomers(customersData);
        setMenuItems(menuData);
      } catch (loadError) {
        if (mounted) setError(getErrorMessage(loadError, 'Unable to load settings.'));
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  const onSaveProfile = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!sellerUserId) return;
    setSavingProfile(true);
    setError('');
    setSuccess('');
    try {
      await saveSellerProfile(sellerUserId, profile);
      setSuccess('Account details saved.');
    } catch (saveError) {
      setError(getErrorMessage(saveError, 'Failed to save account details.'));
    } finally {
      setSavingProfile(false);
    }
  };

  const onSaveDirections = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSavingDirections(true);
    setError('');
    setSuccess('');

    try {
      const { data, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !data.session?.access_token) {
        throw new Error('You need to sign in again.');
      }

      const response = await fetch('/api/seller/profile', {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${data.session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ direction_note: profile.directionNote }),
      });
      const body = (await response.json()) as { direction_note?: string; error?: string };
      if (!response.ok) {
        throw new Error(body.error ?? 'Failed to save stall directions.');
      }

      setProfile((current) => ({ ...current, directionNote: body.direction_note ?? current.directionNote }));
      setSuccess('Stall directions saved.');
    } catch (saveError) {
      setError(getErrorMessage(saveError, 'Failed to save stall directions.'));
    } finally {
      setSavingDirections(false);
    }
  };

  const onSaveMenuItem = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!sellerUserId) return;

    const cleanName = menuName.trim();
    const price = Number(menuPrice);
    if (!cleanName || cleanName.length > 80 || !Number.isFinite(price) || price <= 0) {
      setError('Menu item needs a name up to 80 characters and a valid price.');
      return;
    }

    setSavingMenu(true);
    setError('');
    setSuccess('');
    try {
      if (editingMenuId) {
        const updated = await updateSellerMenuItem(sellerUserId, editingMenuId, cleanName, price);
        setMenuItems((current) => current.map((item) => (item.id === updated.id ? updated : item)));
        setSuccess('Menu item updated.');
      } else {
        const created = await createSellerMenuItem(sellerUserId, cleanName, price, menuItems.length);
        setMenuItems((current) => [...current, created]);
        setSuccess('Menu item added.');
      }
      setMenuName('');
      setMenuPrice('');
      setEditingMenuId(null);
    } catch (saveError) {
      setError(getErrorMessage(saveError, 'Failed to save menu item.'));
    } finally {
      setSavingMenu(false);
    }
  };

  const onEditMenuItem = (item: SellerMenuItem) => {
    setEditingMenuId(item.id);
    setMenuName(item.itemName);
    setMenuPrice(item.unitPrice.toFixed(2));
  };

  const onToggleMenuItem = async (item: SellerMenuItem) => {
    if (!sellerUserId) return;
    setError('');
    setSuccess('');
    try {
      const updated = await setSellerMenuItemActive(sellerUserId, item.id, !item.isActive);
      setMenuItems((current) => current.map((entry) => (entry.id === updated.id ? updated : entry)));
      setSuccess(updated.isActive ? 'Menu item is visible to customers.' : 'Menu item hidden from customers.');
    } catch (toggleError) {
      setError(getErrorMessage(toggleError, 'Failed to update menu item.'));
    }
  };

  const onDeleteMenuItem = async (item: SellerMenuItem) => {
    if (!sellerUserId) return;
    const confirmed = window.confirm(`Delete ${item.itemName}?`);
    if (!confirmed) return;

    setError('');
    setSuccess('');
    try {
      await deleteSellerMenuItem(sellerUserId, item.id);
      setMenuItems((current) => current.filter((entry) => entry.id !== item.id));
      if (editingMenuId === item.id) {
        setEditingMenuId(null);
        setMenuName('');
        setMenuPrice('');
      }
      setSuccess('Menu item deleted.');
    } catch (deleteError) {
      setError(getErrorMessage(deleteError, 'Failed to delete menu item.'));
    }
  };

  const onAddSpecialCustomer = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!sellerUserId) return;

    const cleanPhone = newPhone.trim();
    const cleanName = newCustomerName.trim();
    if (!cleanPhone || !cleanName) {
      setError('Phone and customer name are required.');
      return;
    }

    const duplicate = specialCustomers.some((entry) => entry.phone.toLowerCase() === cleanPhone.toLowerCase());
    if (duplicate) {
      setError('That phone number already exists in Special Customers.');
      return;
    }

    setError('');
    setSuccess('');
    try {
      const created = await addSpecialCustomer(sellerUserId, cleanPhone, cleanName);
      setSpecialCustomers((current) => [created, ...current]);
      setNewPhone('');
      setNewCustomerName('');
      setSuccess('Special customer added.');
    } catch (addError) {
      setError(getErrorMessage(addError, 'Failed to add special customer.'));
    }
  };

  const onRemoveSpecialCustomer = async (customerId: string) => {
    if (!sellerUserId) return;
    setError('');
    setSuccess('');
    try {
      await removeSpecialCustomer(sellerUserId, customerId);
      setSpecialCustomers((current) => current.filter((entry) => entry.id !== customerId));
      setSuccess('Special customer removed.');
    } catch (removeError) {
      setError(getErrorMessage(removeError, 'Failed to remove special customer.'));
    }
  };

  const onSignOut = async () => {
    const confirmed = window.confirm('Are you sure you want to sign out?');
    if (!confirmed) return;
    await supabase.auth.signOut();
    router.push('/seller/login');
  };

  if (loading) return <p className="text-on_surface/70 font-body font-semibold">Loading settings...</p>;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-tertiary text-xs font-display font-bold uppercase tracking-widest mb-1">Account</p>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-3xl font-display font-bold text-on_surface">Settings</h1>
          {profile.status === 'pending' && (
            <span className="w-fit rounded-full bg-tertiary_fixed_dim/20 px-3 py-1 text-xs font-display font-bold uppercase tracking-wide text-tertiary">
              Account pending approval
            </span>
          )}
        </div>
      </div>

      {error && <p className="rounded-xl bg-secondary/10 px-4 py-3 text-sm font-body font-semibold text-secondary">{error}</p>}
      {success && <p className="rounded-xl bg-primary_fixed_dim/20 px-4 py-3 text-sm font-body font-semibold text-primary">{success}</p>}

      <section className="rounded-2xl bg-surface_container_lowest p-6 shadow-ambient">
        <h2 className="mb-4 text-lg font-display font-bold text-on_surface">Account Profile</h2>
        <form onSubmit={onSaveProfile} className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {PROFILE_FIELDS.map((field) => (
            <label key={field.key} className="text-sm font-body font-semibold text-on_surface">
              {field.label}
              <input
                value={profile[field.key]}
                onChange={(event) => setProfile((current) => ({ ...current, [field.key]: event.target.value }))}
                className="mt-2 w-full bg-transparent px-1 py-3 font-body text-on_surface placeholder:text-on_surface/40 border-b border-outline_variant/40 focus:border-b-2 focus:border-primary focus:outline-none"
              />
            </label>
          ))}
          <button
            type="submit"
            disabled={savingProfile}
            className="mt-2 rounded-lg bg-gradient-to-br from-primary to-primary-container py-3 font-body font-semibold text-white disabled:opacity-60 md:col-span-2"
          >
            {savingProfile ? 'Saving...' : 'Save Account'}
          </button>
        </form>
      </section>

      <section className="rounded-2xl bg-surface_container_lowest p-6 shadow-ambient">
        <h2 className="mb-2 text-lg font-display font-bold text-on_surface">Stall Directions</h2>
        <p className="mb-4 text-sm font-body text-on_surface/70">
          Add a precise note customers can use once they reach your landmark.
        </p>
        <form onSubmit={onSaveDirections} className="space-y-4">
          <label className="block text-sm font-body font-semibold text-on_surface">
            Direction Note
            <textarea
              value={profile.directionNote}
              onChange={(event) =>
                setProfile((current) => ({
                  ...current,
                  directionNote: event.target.value.slice(0, DIRECTION_NOTE_MAX_LENGTH),
                }))
              }
              maxLength={DIRECTION_NOTE_MAX_LENGTH}
              rows={4}
              placeholder="e.g. Behind Engineering Gate, first blue kiosk after the photocopy shop."
              className="mt-2 w-full resize-none bg-transparent px-1 py-3 font-body text-on_surface placeholder:text-on_surface/40 border-b border-outline_variant/40 focus:border-b-2 focus:border-primary focus:outline-none"
            />
          </label>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs font-body text-on_surface/55">
              {profile.directionNote.length}/{DIRECTION_NOTE_MAX_LENGTH} characters
            </p>
            <button
              type="submit"
              disabled={savingDirections}
              className="rounded-lg bg-gradient-to-br from-primary to-primary-container px-5 py-3 font-body font-semibold text-white disabled:opacity-60"
            >
              {savingDirections ? 'Saving...' : 'Save Directions'}
            </button>
          </div>
        </form>
      </section>

      <section className="rounded-2xl bg-surface_container_lowest p-6 shadow-ambient">
        <h2 className="mb-2 text-lg font-display font-bold text-on_surface">Menu Items</h2>
        <p className="mb-4 text-sm font-body text-on_surface/70">
          Define the quick-add items customers can select before placing an order.
        </p>

        <form onSubmit={onSaveMenuItem} className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-[1fr_160px_160px]">
          <input
            value={menuName}
            onChange={(event) => setMenuName(event.target.value)}
            placeholder="Item name"
            maxLength={80}
            className="bg-transparent px-1 py-3 font-body text-on_surface placeholder:text-on_surface/40 border-b border-outline_variant/40 focus:border-b-2 focus:border-primary focus:outline-none"
          />
          <input
            value={menuPrice}
            onChange={(event) => setMenuPrice(event.target.value)}
            placeholder="Unit price"
            inputMode="decimal"
            className="bg-transparent px-1 py-3 font-body text-on_surface placeholder:text-on_surface/40 border-b border-outline_variant/40 focus:border-b-2 focus:border-primary focus:outline-none"
          />
          <button
            type="submit"
            disabled={savingMenu}
            className="rounded-lg bg-gradient-to-br from-primary to-primary-container px-4 py-3 font-body font-semibold text-white disabled:opacity-60"
          >
            {savingMenu ? 'Saving...' : editingMenuId ? 'Update Item' : 'Add Item'}
          </button>
        </form>

        {menuItems.length === 0 ? (
          <div className="rounded-xl bg-surface_container_low p-6 text-center">
            <p className="font-body text-on_surface/55">No menu items yet.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {menuItems.map((item) => (
              <div key={item.id} className="rounded-xl bg-surface_container_low p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-body font-semibold text-on_surface">{item.itemName}</p>
                    <p className="text-sm font-body text-on_surface/65">
                      {formatCurrency(item.unitPrice)} · {item.isActive ? 'Visible' : 'Hidden'}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => onEditMenuItem(item)}
                      className="rounded-lg bg-primary_fixed_dim/20 px-3 py-2 text-sm font-body font-semibold text-primary"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => onToggleMenuItem(item)}
                      className="rounded-lg bg-tertiary_fixed_dim/20 px-3 py-2 text-sm font-body font-semibold text-tertiary"
                    >
                      {item.isActive ? 'Hide' : 'Show'}
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteMenuItem(item)}
                      className="rounded-lg bg-secondary/10 px-3 py-2 text-sm font-body font-semibold text-secondary"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-2xl bg-surface_container_lowest p-6 shadow-ambient">
        <h2 className="mb-2 text-lg font-display font-bold text-on_surface">Special Customers</h2>
        <p className="mb-4 text-sm font-body text-on_surface/70">
          Special customers can pay later. Save their name and phone to flag credit orders.
        </p>

        <form onSubmit={onAddSpecialCustomer} className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-3">
          <input
            value={newCustomerName}
            onChange={(event) => setNewCustomerName(event.target.value)}
            placeholder="Customer name"
            className="bg-transparent px-1 py-3 font-body text-on_surface placeholder:text-on_surface/40 border-b border-outline_variant/40 focus:border-b-2 focus:border-primary focus:outline-none"
          />
          <input
            value={newPhone}
            onChange={(event) => setNewPhone(event.target.value)}
            placeholder="Phone number"
            className="bg-transparent px-1 py-3 font-body text-on_surface placeholder:text-on_surface/40 border-b border-outline_variant/40 focus:border-b-2 focus:border-primary focus:outline-none"
          />
          <button className="rounded-lg bg-gradient-to-br from-primary to-primary-container px-4 py-3 font-body font-semibold text-white" type="submit">
            Add Customer
          </button>
        </form>

        {specialCustomers.length === 0 ? (
          <div className="rounded-xl bg-surface_container_low p-6 text-center">
            <p className="font-body text-on_surface/55">No special customers</p>
          </div>
        ) : (
          <div className="space-y-2">
            {specialCustomers.map((entry) => (
              <div key={entry.id} className="flex items-center justify-between rounded-xl bg-surface_container_low p-3">
                <div>
                  <p className="font-body font-semibold text-on_surface">{entry.customerName}</p>
                  <p className="text-sm font-body text-on_surface/70">{entry.phone}</p>
                </div>
                <button
                  onClick={() => onRemoveSpecialCustomer(entry.id)}
                  className="rounded-lg bg-secondary/10 px-3 py-2 font-body font-semibold text-secondary transition hover:bg-secondary/20"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-2xl bg-surface_container_low p-6">
        <h2 className="mb-4 text-lg font-display font-bold text-on_surface">Sign Out</h2>
        <button onClick={onSignOut} className="rounded-lg bg-gradient-to-br from-primary to-primary-container px-4 py-3 font-body font-semibold text-white">
          Sign Out
        </button>
      </section>
    </div>
  );
}
