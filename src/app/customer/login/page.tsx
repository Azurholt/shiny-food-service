'use client';

import { useState, useEffect } from 'react';
import { ChefHat, Phone, ArrowLeft, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

export default function CustomerLogin() {
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(0);
  const router = useRouter();

  // Countdown timer for OTP resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Format phone as user types (Ghana format)
  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 10);
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)} ${digits.slice(3)}`;
    return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
  };

  const handleSendOtp = async () => {
    setError('');
    
    // Validate Ghana phone format
    const cleanPhone = phone.replace(/\s/g, '');
    if (!/^0[1-9]\d{8}$/.test(cleanPhone)) {
      setError('Enter a valid Ghana number (e.g., 054 123 4567)');
      return;
    }

    setLoading(true);
    try {
      // Convert to E.164 format for Supabase
      const e164Phone = `+233${cleanPhone.slice(1)}`;
      
      const { error } = await supabase.auth.signInWithOtp({
        phone: e164Phone,
        options: {
          channel: 'sms',
        },
      });

      if (error) throw error;
      
      setStep('otp');
      setCountdown(60); // 60 second resend cooldown
    } catch (err: any) {
      setError(err.message || 'Failed to send code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setError('');
    
    if (otp.length !== 6) {
      setError('Enter the 6-digit code');
      return;
    }

    setLoading(true);
    try {
      const cleanPhone = phone.replace(/\s/g, '');
      const e164Phone = `+233${cleanPhone.slice(1)}`;
      
      const { data: { user }, error } = await supabase.auth.verifyOtp({
        phone: e164Phone,
        token: otp,
        type: 'sms',
      });

      if (error) throw error;
      if (!user) throw new Error('Verification failed');

      router.push('/customer/dashboard');
    } catch (err: any) {
      setError(err.message || 'Invalid code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = () => {
    if (countdown === 0) {
      setCountdown(60);
      handleSendOtp();
    }
  };

  return (
    <div className="min-h-screen bg-surface flex font-body">
      
      {/* ==================== LEFT SIDE: Kente Background ==================== */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        
        {/* Kente Pattern Background */}
        <div className="absolute inset-0 z-0"
          style={{
            backgroundImage: `url('/images/trad kente.png')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
          }}
        >
          {/*Overlay to ensure text readability*/}
          <div className="absolute inset-0 bg-surface/70 backdrop-blur-[2px]" >
          </div>
        </div>

        {/* Content Overlay */}
        <div className="relative z-10 flex flex-col justify-center px-16 xl:px-24 h-full">
          
          <div className="max-w-xl">
          
            {/* Hero Headline */}
            <h1 className="text-5xl xl:text-6xl font-display font-bold text-on_surface leading-[1.05] mb-6 tracking-tight">
              Welcome Back,<br/>
              <span className="text-primary italic">Let&apos;s Eat.</span>
            </h1>

            {/* Subheadline */}
            <p className="text-xl text-on_surface/80 leading-relaxed mb-10">
              Come to wait for your queue in the comfort of your own space?. Sign in to pick up where you left off.
            </p>

            {/* Social Proof */}
            <div className="flex items-center gap-4 pt-4">
              <div className="flex -space-x-3">
                {[1, 2, 3].map((i) => (
                  <div 
                    key={i} 
                    className={`w-10 h-10 rounded-full border-2 border-surface ${
                      i === 1 ? 'bg-primary_fixed_dim' : 
                      i === 2 ? 'bg-tertiary_fixed_dim' : 
                      'bg-surface_container_low flex items-center justify-center text-xs font-bold text-on_surface'
                    }`}
                  >
                    {i === 3 && '5^??'}
                  </div>
                ))}
              </div>
              <div className="text-sm font-medium text-on_surface/60">
                <p className="font-semibold text-on_surface">5 bajillion</p>
                <p>Students eating daily</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ==================== RIGHT SIDE: LOGIN FORM ==================== */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12 lg:px-16 bg-surface">
        <div className="w-full max-w-md">
          
          {/* Back Link (Mobile) */}
          <Link 
            href="/" 
            className="lg:hidden inline-flex items-center gap-2 text-on_surface/60 hover:text-primary mb-8 transition font-body text-sm"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Home
          </Link>

          {/* Header */}
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-6">
                <ChefHat className="w-6 h-6 text-tertiary-fixed" />
              <span className="text-2xl font-display font-bold text-on_surface">Kueue</span>
            </div>
            <h2 className="text-3xl font-display font-bold text-on_surface mb-2">
              {step === 'phone' ? 'Sign In' : 'Verify Code'}
            </h2>
            <p className="text-on_surface/60 text-lg">
              {step === 'phone' 
                ? 'Enter your phone number to receive a verification code.' 
                : `Enter the code we sent to ${formatPhone(phone)}`
              }
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-secondary/10 border border-secondary/20 text-secondary px-4 py-3 rounded-lg mb-6 text-sm font-body flex items-start gap-2">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* STEP 1: Phone Input */}
          {step === 'phone' && (
            <div className="space-y-8">
              {/* Phone Field */}
              <div className="group">
                <label className="block text-xs font-bold text-tertiary mb-3 uppercase tracking-widest font-display">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-0 top-1/2 -translate-y-1/2 w-5 h-5 text-on_surface/30 group-focus-within:text-primary transition-colors" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(formatPhone(e.target.value))}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendOtp()}
                    className="w-full pl-8 pr-4 py-4 bg-transparent border-b border-outline_variant/40 focus:border-primary focus:border-b-2 focus:outline-none transition-all font-body text-on_surface text-lg placeholder:text-on_surface/30"
                    placeholder="054 123 4567"
                    maxLength={12}
                    autoFocus
                  />
                </div>
                <p className="text-xs text-on_surface/50 mt-2 ml-1">
                  We&apos;ll send a 6-digit code via SMS. Standard rates apply.
                </p>
              </div>

              {/* Send Code Button */}
              <button
                onClick={handleSendOtp}
                disabled={loading || phone.replace(/\s/g, '').length < 10}
                className="w-full bg-gradient-to-br from-primary to-primary-container hover:from-primary-container hover:to-primary text-white py-4 rounded-lg font-body font-bold text-lg transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    Send Code
                    <ArrowLeft className="w-5 h-5 rotate-180" />
                  </>
                )}
              </button>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-outline_variant/20"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-surface px-4 text-on_surface/40 font-semibold tracking-wider">
                    or
                  </span>
                </div>
              </div>

              {/* Google Sign-In (Future) */}
              <button
                type="button"
                disabled
                className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-outline_variant/30 rounded-lg bg-surface_container_low/50 text-on_surface/40 cursor-not-allowed font-semibold"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Continue with Google
              </button>
            </div>
          )}

          {/* STEP 2: OTP Verification */}
          {step === 'otp' && (
            <div className="space-y-8">
              {/* OTP Input */}
              <div className="group">
                <label className="block text-xs font-bold text-tertiary mb-3 uppercase tracking-widest font-display">
                  Enter 6-Digit Code
                </label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && otp.length === 6) handleVerifyOtp();
                    if (e.key === 'Backspace' && otp.length === 0) setStep('phone');
                  }}
                  className="w-full px-4 py-4 bg-transparent border-b border-outline_variant/40 focus:border-primary focus:border-b-2 focus:outline-none transition-all font-body text-on_surface text-2xl text-center tracking-[0.5em] placeholder:text-on_surface/30"
                  placeholder="000000"
                  maxLength={6}
                  autoFocus
                  pattern="\d{6}"
                  inputMode="numeric"
                />
                <p className="text-xs text-on_surface/50 mt-2 text-center">
                  Didn&apos;t receive the code?{' '}
                  {countdown > 0 ? (
                    <span className="text-on_surface/40">Resend in {countdown}s</span>
                  ) : (
                    <button 
                      onClick={handleResendOtp}
                      className="text-primary font-semibold hover:underline"
                    >
                      Resend Code
                    </button>
                  )}
                </p>
              </div>

              {/* Verify Button */}
              <button
                onClick={handleVerifyOtp}
                disabled={loading || otp.length !== 6}
                className="w-full bg-gradient-to-br from-primary to-primary-container hover:from-primary-container hover:to-primary text-white py-4 rounded-lg font-body font-bold text-lg transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    Sign In
                    <CheckCircle className="w-5 h-5" />
                  </>
                )}
              </button>

              {/* Change Phone */}
              <button
                onClick={() => {
                  setStep('phone');
                  setOtp('');
                  setError('');
                }}
                className="w-full text-center text-sm font-medium text-on_surface/60 hover:text-primary transition"
              >
                ← Use a different phone number
              </button>
            </div>
          )}

          {/* Footer */}
          <div className="mt-12 pt-6 border-t border-outline_variant/15">
            <p className="text-center text-xs text-on_surface/40 font-body">
              Don&apos;t have an account?{' '}
              <Link href="/customer/signup" className="text-primary font-bold hover:underline">
                Sign Up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
