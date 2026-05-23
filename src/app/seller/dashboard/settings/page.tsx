'use client';

import { FormEvent, useEffect, useState } from 'react';
import { UserRoundPlus, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
  addSpecialCustomer,
  fetchSellerProfile,
  fetchSpecialCustomers,
  getSellerUserId,
  removeSpecialCustomer,
  saveSellerProfile,
  type SellerProfile,
  type SpecialCustomer,
} from '@/lib/sellerDashboard';
import { supabase } from '@/lib/supabaseClient';

const EMPTY_PROFILE: SellerProfile = {
  businessName: '',
  ownerName: '',
  phone: '',
  location: '',
  foodCategory: '',
};

export default function SettingsPage() {
  const router = useRouter();
  const [sellerUserId, setSellerUserId] = useState('');
  const [profile, setProfile] = useState<SellerProfile>(EMPTY_PROFILE);
  const [specialCustomers, setSpecialCustomers] = useState<SpecialCustomer[]>([]);
  const [newPhone, setNewPhone] = useState('');
  const [newCustomerName, setNewCustomerName] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const uid = await getSellerUserId();
        const [profileData, customersData] = await Promise.all([
          fetchSellerProfile(uid),
          fetchSpecialCustomers(uid),
        ]);
        if (!mounted) return;
        setSellerUserId(uid);
        setProfile(profileData);
        setSpecialCustomers(customersData);
      } catch (err: any) {
        if (mounted) setError(err.message ?? 'Unable to load settings.');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  const onSaveProfile = async (e: FormEvent) => {
    e.preventDefault();
    if (!sellerUserId) return;
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      await saveSellerProfile(sellerUserId, profile);
      setSuccess('Account details saved.');
    } catch (err: any) {
      setError(err.message ?? 'Failed to save account details.');
    } finally {
      setSaving(false);
    }
  };

  const onAddSpecialCustomer = async (e: FormEvent) => {
    e.preventDefault();
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
    } catch (err: any) {
      setError(err.message ?? 'Failed to add special customer.');
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
    } catch (err: any) {
      setError(err.message ?? 'Failed to remove special customer.');
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
        <h1 className="text-3xl font-display font-bold text-on_surface">Settings</h1>
      </div>

      {error && <p className="text-secondary font-body font-semibold">{error}</p>}
      {success && <p className="text-primary font-body font-semibold">{success}</p>}

      <section className="bg-surface_container_lowest rounded-2xl p-6 shadow-ambient">
        <h2 className="text-lg font-display font-bold text-on_surface mb-4">Account Profile</h2>
        <form onSubmit={onSaveProfile} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            ['businessName', 'Business Name'],
            ['ownerName', 'Owner Name'],
            ['phone', 'Phone'],
            ['location', 'Location'],
            ['foodCategory', 'Food Category'],
          ].map(([key, label]) => (
            <label key={key} className="text-sm font-body font-semibold text-on_surface">
              {label}
              <input
                value={profile[key as keyof SellerProfile]}
                onChange={(e) => setProfile((current) => ({ ...current, [key]: e.target.value }))}
                className="mt-2 w-full rounded-xl px-3 py-3 bg-surface_container_low text-on_surface placeholder:text-on_surface/40 font-body focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </label>
          ))}
          <button
            type="submit"
            disabled={saving}
            className="md:col-span-2 mt-2 bg-gradient-to-br from-primary to-primary-container text-white rounded-xl py-3 font-body font-semibold disabled:opacity-60"
          >
            {saving ? 'Saving...' : 'Save Account'}
          </button>
        </form>
      </section>

      <section className="bg-surface_container_lowest rounded-2xl p-6 shadow-ambient">
        <div className="flex items-center gap-2 mb-2">
          <UserRoundPlus className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-display font-bold text-on_surface">Special Customers</h2>
        </div>
        <p className="text-sm font-body text-on_surface/70 mb-4">
          Special customers can pay later. Save their name and phone to flag credit orders.
        </p>

        <form onSubmit={onAddSpecialCustomer} className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
          <input
            value={newCustomerName}
            onChange={(e) => setNewCustomerName(e.target.value)}
            placeholder="Customer name"
            className="rounded-xl px-3 py-3 bg-surface_container_low text-on_surface placeholder:text-on_surface/40 font-body focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          <input
            value={newPhone}
            onChange={(e) => setNewPhone(e.target.value)}
            placeholder="Phone number"
            className="rounded-xl px-3 py-3 bg-surface_container_low text-on_surface placeholder:text-on_surface/40 font-body focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          <button className="rounded-xl bg-primary text-white font-body font-semibold px-4 py-3" type="submit">
            Add Customer
          </button>
        </form>

        {specialCustomers.length === 0 ? (
          <div className="bg-surface rounded-xl p-6 text-center">
            <Users className="w-6 h-6 text-on_surface/40 mx-auto mb-2" />
            <p className="text-on_surface/50 font-body">No special customers</p>
          </div>
        ) : (
          <div className="space-y-2">
            {specialCustomers.map((entry) => (
              <div key={entry.id} className="flex items-center justify-between bg-surface_container_low rounded-xl p-3">
                <div>
                  <p className="text-on_surface font-body font-semibold">{entry.customerName}</p>
                  <p className="text-on_surface/70 text-sm font-body">{entry.phone}</p>
                </div>
                <button
                  onClick={() => onRemoveSpecialCustomer(entry.id)}
                  className="text-secondary font-body font-semibold px-3 py-2 rounded-lg bg-secondary/10 hover:bg-secondary/20 transition"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="bg-surface_container_low rounded-2xl p-6">
        <h2 className="text-lg font-display font-bold text-on_surface mb-4">Sign Out</h2>
        <button onClick={onSignOut} className="px-4 py-3 rounded-xl bg-secondary text-white font-body font-semibold">
          Sign Out
        </button>
      </section>
    </div>
  );
}
