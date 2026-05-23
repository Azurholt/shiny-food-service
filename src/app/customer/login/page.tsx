'use client';

import { FormEvent, useState } from 'react';
import { AlertCircle, ArrowLeft, ChefHat, Loader2, Lock, Phone } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

type LoginSuccess = {
  accessToken: string;
  refreshToken: string;
};

type OtpChallenge = {
  requiresOtp: boolean;
  method: 'otp';
  phone: string;
};

function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 10);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)} ${digits.slice(3)}`;
  return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
}

export default function CustomerLoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/customer/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: phone.trim(),
          pin: pin.trim(),
        }),
      });

      const body = (await response.json()) as LoginSuccess | OtpChallenge | { error?: string };

      if (response.status === 202 && 'requiresOtp' in body && body.requiresOtp) {
        setError('Customer auth is currently set to OTP mode. Switch AUTH_CONFIG.method to pin.');
        setLoading(false);
        return;
      }

      if (!response.ok || !('accessToken' in body) || !('refreshToken' in body)) {
        const fallbackMessage = 'Unable to sign in right now.';
        const message = 'error' in body && body.error ? body.error : fallbackMessage;
        setError(message);
        setLoading(false);
        return;
      }

      const { error: sessionError } = await supabase.auth.setSession({
        access_token: body.accessToken,
        refresh_token: body.refreshToken,
      });

      if (sessionError) {
        setError(sessionError.message);
        setLoading(false);
        return;
      }

      router.push('/customer/dashboard/marketplace');
      setLoading(false);
    } catch {
      setError('Unable to process login right now.');
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-surface font-body">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl items-center px-6 py-12 lg:px-12">
        <div className="hidden w-1/2 lg:block">
          <div className="rounded-3xl bg-surface_container_low p-10">
            <div className="mb-6 flex items-center gap-3">
              <ChefHat className="h-6 w-6 text-tertiary-fixed" />
              <span className="text-2xl font-display font-bold text-on_surface">Kueue</span>
            </div>
            <p className="text-xs font-display uppercase tracking-[0.2em] text-tertiary">Welcome Back</p>
            <h1 className="mt-4 text-5xl font-display font-bold leading-tight text-on_surface">
              Welcome Back,
              <span className="block text-primary">Let&apos;s Eat.</span>
            </h1>
            <p className="mt-6 max-w-md text-lg text-on_surface/70">
              Sign in with your phone and PIN to continue where you left off.
            </p>
          </div>
        </div>

        <div className="w-full lg:w-1/2 lg:pl-14">
          <Link href="/" className="mb-8 inline-flex items-center gap-2 text-sm text-on_surface/60 hover:text-primary">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>

          <div className="rounded-3xl bg-surface_container_low p-8">
            <p className="text-xs font-display uppercase tracking-[0.2em] text-tertiary">Customer Login</p>
            <h2 className="mt-3 text-3xl font-display font-bold text-on_surface">Sign In</h2>

            {error && (
              <div className="mt-6 flex items-start gap-2 rounded-xl bg-secondary/10 px-4 py-3 text-sm text-secondary">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <div>
                <label className="mb-2 block text-xs font-display uppercase tracking-[0.16em] text-tertiary">Phone Number</label>
                <div className="relative">
                  <Phone className="pointer-events-none absolute left-0 top-1/2 h-5 w-5 -translate-y-1/2 text-on_surface/35" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(event) => setPhone(formatPhone(event.target.value))}
                    maxLength={12}
                    autoComplete="tel"
                    placeholder="054 123 4567"
                    className="w-full bg-transparent py-3 pl-8 pr-2 text-lg text-on_surface placeholder:text-on_surface/35 border-b border-outline_variant/40 focus:border-b-2 focus:border-primary focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-xs font-display uppercase tracking-[0.16em] text-tertiary">4-Digit PIN</label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-0 top-1/2 h-5 w-5 -translate-y-1/2 text-on_surface/35" />
                  <input
                    type="password"
                    value={pin}
                    onChange={(event) => setPin(event.target.value.replace(/\D/g, '').slice(0, 4))}
                    inputMode="numeric"
                    maxLength={4}
                    autoComplete="current-password"
                    placeholder="1234"
                    className="w-full bg-transparent py-3 pl-8 pr-2 text-lg text-on_surface placeholder:text-on_surface/35 border-b border-outline_variant/40 focus:border-b-2 focus:border-primary focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="text-right">
                <Link href="#" className="text-sm font-medium text-primary hover:underline">
                  Forgot PIN?
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mt-1 flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-br from-primary to-primary-container px-4 py-4 font-semibold text-white transition hover:from-primary-container hover:to-primary disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Signing In...
                  </>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

            <p className="mt-8 text-center text-sm text-on_surface/65">
              Need an account?{' '}
              <Link href="/customer/signup" className="font-semibold text-primary hover:underline">
                Create one
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
