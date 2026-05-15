'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  addTrustedCustomer,
  fetchSellerProfile,
  fetchTrustedCustomers,
  getSellerUserId,
  removeTrustedCustomer,
  saveSellerProfile,
  type SellerProfile,
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
  const [trustedCustomers, setTrustedCustomers] = useState<string[]>([]);
  const [newTrustedCustomer, setNewTrustedCustomer] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const uid = await getSellerUserId();
        const [profileData, trustedData] = await Promise.all([fetchSellerProfile(uid), fetchTrustedCustomers(uid)]);
        if (!mounted) return;
        setSellerUserId(uid);
        setProfile(profileData);
        setTrustedCustomers(trustedData);
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

  const onAddTrustedCustomer = async (e: FormEvent) => {
    e.preventDefault();
    if (!sellerUserId || !newTrustedCustomer.trim()) return;
    setError('');
    try {
      await addTrustedCustomer(sellerUserId, newTrustedCustomer);
      setTrustedCustomers((current) => [newTrustedCustomer.trim(), ...current]);
      setNewTrustedCustomer('');
    } catch (err: any) {
      setError(err.message ?? 'Failed to add trusted customer.');
    }
  };

  const onRemoveTrustedCustomer = async (name: string) => {
    if (!sellerUserId) return;
    setError('');
    try {
      await removeTrustedCustomer(sellerUserId, name);
      setTrustedCustomers((current) => current.filter((entry) => entry !== name));
    } catch (err: any) {
      setError(err.message ?? 'Failed to remove trusted customer.');
    }
  };

  const onSignOut = async () => {
    const confirmed = window.confirm('Are you sure you want to sign out?');
    if (!confirmed) return;
    await supabase.auth.signOut();
    router.push('/seller/login');
  };

  if (loading) return <p className="text-on_surface/70 font-semibold">Loading settings...</p>;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-tertiary text-xs font-bold uppercase tracking-widest mb-1">Account</p>
        <h1 className="text-3xl font-display font-bold text-on_surface">Settings</h1>
      </div>

      {error && <p className="text-secondary font-semibold">{error}</p>}
      {success && <p className="text-primary font-semibold">{success}</p>}

      <section className="bg-surface_container_lowest rounded-xl p-5 shadow-ambient">
        <h2 className="text-lg font-display font-bold text-on_surface mb-4">Account</h2>
        <form onSubmit={onSaveProfile} className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            ['businessName', 'Business Name'],
            ['ownerName', 'Owner Name'],
            ['phone', 'Phone'],
            ['location', 'Location'],
            ['foodCategory', 'Food Category'],
          ].map(([key, label]) => (
            <label key={key} className="text-sm font-semibold text-on_surface">
              {label}
              <input
                value={profile[key as keyof SellerProfile]}
                onChange={(e) => setProfile((current) => ({ ...current, [key]: e.target.value }))}
                className="mt-1 w-full rounded-lg px-3 py-2 bg-surface border border-outline_variant/30 font-normal"
              />
            </label>
          ))}
          <button
            type="submit"
            disabled={saving}
            className="md:col-span-2 mt-2 bg-gradient-to-br from-primary to-primary-container text-white rounded-lg py-3 font-semibold disabled:opacity-60"
          >
            {saving ? 'Saving...' : 'Save Account'}
          </button>
        </form>
      </section>

      <section className="bg-surface_container_lowest rounded-xl p-5 shadow-ambient">
        <h2 className="text-lg font-display font-bold text-on_surface mb-4">Set Special Customers</h2>
        <p className="text-sm text-on_surface/70 mb-3">Trusted customers can place orders without immediate payment. Payment happens on pickup.</p>
        <form onSubmit={onAddTrustedCustomer} className="flex gap-2 mb-3">
          <input
            value={newTrustedCustomer}
            onChange={(e) => setNewTrustedCustomer(e.target.value)}
            placeholder="Customer name"
            className="flex-1 rounded-lg px-3 py-2 bg-surface border border-outline_variant/30"
          />
          <button className="px-4 py-2 rounded-lg bg-primary text-white font-semibold" type="submit">
            Add
          </button>
        </form>
        {trustedCustomers.length === 0 ? (
          <p className="text-on_surface/60 text-sm">No trusted customers yet.</p>
        ) : (
          <div className="space-y-2">
            {trustedCustomers.map((name) => (
              <div key={name} className="flex items-center justify-between bg-surface p-3 rounded-lg">
                <span className="text-on_surface">{name}</span>
                <button onClick={() => onRemoveTrustedCustomer(name)} className="text-secondary font-semibold">
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="bg-surface_container_low rounded-xl p-5">
        <h2 className="text-lg font-display font-bold text-on_surface mb-4">Sign Out</h2>
        <button onClick={onSignOut} className="px-4 py-2 rounded-lg bg-secondary text-white font-semibold">
          Sign Out
        </button>
      </section>
    </div>
  );
}
