'use client';

// src/app/seller/login/page.tsx
import { useState } from 'react';
import { ChefHat, ArrowLeft, Mail, Lock } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

export default function SellerLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
    } else {
      router.push('/seller/dashboard');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Back Link */}
        <Link href="/" className="inline-flex items-center gap-2 text-on_surface/60 hover:text-primary mb-8 transition">
          <ArrowLeft className="w-5 h-5" />
          <span className="font-body text-sm">Back to Home</span>
        </Link>

        {/* Login Card */}
        <div className="bg-surface_container_lowest rounded-2xl p-8 shadow-sm">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <ChefHat className="w-12 h-12 text-tertiary-fixed" />
            </div>
            <h1 className="text-2xl font-display font-bold text-on_surface mb-2">
              Seller Login
            </h1>
            <p className="font-body text-on_surface/60 text-sm">
              Manage your queue and orders
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-secondary/10 border border-secondary/20 text-secondary px-4 py-3 rounded-lg mb-6 text-sm font-body">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-6">
            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-tertiary mb-2 uppercase tracking-wide">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-on_surface/40" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-transparent border-b border-outline_variant/40 focus:border-primary focus:outline-none transition font-body text-on_surface"
                  placeholder="seller@example.com"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-tertiary mb-2 uppercase tracking-wide">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-on_surface/40" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-transparent border-b border-outline_variant/40 focus:border-primary focus:outline-none transition font-body text-on_surface"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-br from-primary to-primary-container hover:from-primary-container hover:to-primary text-white py-4 rounded-lg font-body font-semibold transition shadow-sm disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Footer */}
          <p className="text-center mt-6 text-sm font-body text-on_surface/60">
            Don't have an account?{' '}
            <Link href="/seller/signup" className="text-primary font-semibold hover:underline">
              Register Stall
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}