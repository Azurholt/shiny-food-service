'use client';

import { FormEvent, useEffect, useState } from 'react';
import { AlertCircle, ArrowLeft, CheckCircle2, ChefHat, Loader2, Lock, Phone } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

type SignupSuccess = {
  userId: string;
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

export default function CustomerSignupPage() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [created, setCreated] = useState(false);

  useEffect(() => {
    if (!created) {
      return;
    }

    const timer = setTimeout(() => {
      router.push('/customer/dashboard/marketplace');
    }, 2000);

    return () => clearTimeout(timer);
  }, [created, router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/customer/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: phone.trim(),
          pin: pin.trim(),
        }),
      });

      const body = (await response.json()) as SignupSuccess | OtpChallenge | { error?: string };

      if (response.status === 202 && 'requiresOtp' in body && body.requiresOtp) {
        setError('Customer auth is currently set to OTP mode. Switch AUTH_CONFIG.method to pin.');
        setLoading(false);
        return;
      }

      if (!response.ok || !('accessToken' in body) || !('refreshToken' in body)) {
        const fallbackMessage = 'Unable to create your account right now.';
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

      setCreated(true);
      setLoading(false);
    } catch {
      setError('Unable to process signup right now.');
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
            <p className="text-xs font-display uppercase tracking-[0.2em] text-tertiary">Get Started</p>
            <h1 className="mt-4 text-5xl font-display font-bold leading-tight text-on_surface">
              Join Fast,
              <span className="block text-primary">Eat Faster.</span>
            </h1>
            <p className="mt-6 max-w-md text-lg text-on_surface/70">
              Create your customer account with your phone and 4-digit PIN in a few seconds.
            </p>
          </div>
        </div>

        <div className="w-full lg:w-1/2 lg:pl-14">
          <Link href="/" className="mb-8 inline-flex items-center gap-2 text-sm text-on_surface/60 hover:text-primary">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>

          <div className="rounded-3xl bg-surface_container_low p-8">
            <p className="text-xs font-display uppercase tracking-[0.2em] text-tertiary">Customer Signup</p>
            <h2 className="mt-3 text-3xl font-display font-bold text-on_surface">Create Account</h2>

            {error && (
              <div className="mt-6 flex items-start gap-2 rounded-xl bg-secondary/10 px-4 py-3 text-sm text-secondary">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {created ? (
              <div className="mt-8 rounded-2xl bg-primary_fixed_dim/30 px-5 py-6 text-on_surface">
                <div className="mb-3 flex items-center gap-2 text-primary">
                  <CheckCircle2 className="h-5 w-5" />
                  <span className="font-display text-lg font-semibold">Account Created</span>
                </div>
                <p className="text-sm text-on_surface/70">Redirecting you to marketplace...</p>
              </div>
            ) : (
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
                      autoComplete="new-password"
                      placeholder="1234"
                      className="w-full bg-transparent py-3 pl-8 pr-2 text-lg text-on_surface placeholder:text-on_surface/35 border-b border-outline_variant/40 focus:border-b-2 focus:border-primary focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-br from-primary to-primary-container px-4 py-4 font-semibold text-white transition hover:from-primary-container hover:to-primary disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Creating Account...
                    </>
                  ) : (
                    'Create Account'
                  )}
                </button>
              </form>
            )}

            <p className="mt-8 text-center text-sm text-on_surface/65">
              Already have an account?{' '}
              <Link href="/customer/login" className="font-semibold text-primary hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
