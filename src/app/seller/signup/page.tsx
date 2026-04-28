'use client';

import { useState } from 'react';
import { ChefHat, ArrowLeft, Store, User, Phone, Lock, MapPin, Loader2, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

export default function SellerSignup() {
  const [form, setForm] = useState({
    businessName: '',
    ownerName: '',
    phone: '',
    pin: '',
    location: '',
    category: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const redirectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current);
      }
    };
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validation
    if (!/^\d{4}$/.test(form.pin)) {
      setError('PIN must be exactly 4 digits.');
      setLoading(false);
      return;
    }
    if (!/^0[1-9]\d{8}$/.test(form.phone.replace(/\s/g, ''))) {
      setError('Enter a valid Ghanaian phone number (024..., 054..., etc.).');
      setLoading(false);
      return;
    }

    try {
      const signupResponse = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      });
      const signupBody = await signupResponse.json();
      if (!signupResponse.ok) {
        throw new Error(signupBody.error || 'Signup failed. Please try again.');
      }

      if (!signupBody.userId) {
        throw new Error('Signup failed. Please try again.');
      }

      if (signupBody.accessToken && signupBody.refreshToken) {
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: signupBody.accessToken,
          refresh_token: signupBody.refreshToken,
        });
        if (sessionError) throw sessionError;
      }

      // Create seller profile linked to auth user
      const { error: profileError } = await supabase
        .from('sellers')
        .insert({
          user_id: signupBody.userId,
          business_name: form.businessName,
          owner_name: form.ownerName,
          phone: form.phone,
          location: form.location,
          food_category: form.category,
          status: 'pending'
        });

      if (profileError) throw profileError;

      setSuccess(true);
      redirectTimeoutRef.current = setTimeout(() => router.push('/seller/login'), 2000);
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center px-4">
        <div className="text-center">
          <CheckCircle className="w-16 h-16 text-primary mx-auto mb-4" />
          <h2 className="text-2xl font-display font-bold text-on_surface mb-2">Stall Registered!</h2>
          <p className="font-body text-on_surface/60">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg relative">
        {/* Adinkra Watermark (Nyame Nti - Faith) */}
        <div className="absolute -top-12 -right-12 w-48 h-48 opacity-[0.04] pointer-events-none">
          <svg viewBox="0 0 100 100" className="w-full h-full fill-on_surface">
            <path d="M50 10 C30 10 10 30 10 50 C10 70 30 90 50 90 C70 90 90 70 90 50 C90 30 70 10 50 10 Z M50 25 C60 25 70 35 70 50 C70 65 60 75 50 75 C40 75 30 65 30 50 C30 35 40 25 50 25 Z" />
          </svg>
        </div>

        <Link href="/" className="inline-flex items-center gap-2 text-on_surface/60 hover:text-primary mb-8 transition font-body text-sm">
          <ArrowLeft className="w-5 h-5" /> Back to Home
        </Link>

        <div className="bg-surface_container_lowest rounded-2xl p-8 shadow-sm">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <ChefHat className="w-12 h-12 text-tertiary-fixed" />
            </div>
            <h1 className="text-2xl font-display font-bold text-on_surface mb-2">Register Your Stall</h1>
            <p className="font-body text-on_surface/60 text-sm">Free for 30 days. No setup fees.</p>
          </div>

          {error && (
            <div className="bg-secondary/10 border border-secondary/20 text-secondary px-4 py-3 rounded-lg mb-6 text-sm font-body">
              {error}
            </div>
          )}

          <form onSubmit={handleSignup} method="post" className="space-y-5">
            <InputField label="Stall Name" name="businessName" icon={<Store className="w-5 h-5" />} placeholder="e.g. Auntie Ama's Waakye" value={form.businessName} onChange={handleChange} required />
            <InputField label="Owner Name" name="ownerName" icon={<User className="w-5 h-5" />} placeholder="Your full name" value={form.ownerName} onChange={handleChange} required />
            <InputField label="Phone Number" name="phone" icon={<Phone className="w-5 h-5" />} placeholder="054 123 4567" value={form.phone} onChange={handleChange} required />
            <InputField label="Create 4-Digit PIN" name="pin" icon={<Lock className="w-5 h-5" />} placeholder="1234" type="password" maxLength={4} value={form.pin} onChange={handleChange} required />
            
            <div className="grid grid-cols-2 gap-4">
              <InputField label="Location" name="location" icon={<MapPin className="w-5 h-5" />} placeholder="e.g. Engineering Gate" value={form.location} onChange={handleChange} required />
              <SelectField label="Food Category" name="category" value={form.category} onChange={handleChange} required>
                <option value="">Select...</option>
                <option value="waakye">Waakye</option>
                <option value="shawarma">Shawarma</option>
                <option value="fufu">Fufu & Soup</option>
                <option value="rice">Rice & Stew</option>
                <option value="snacks">Snacks</option>
                <option value="other">Other</option>
              </SelectField>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-br from-primary to-primary-container hover:from-primary-container hover:to-primary text-white py-4 rounded-lg font-body font-semibold transition shadow-sm disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Start Selling'}
            </button>
          </form>

          <p className="text-center mt-6 text-sm font-body text-on_surface/60">
            Already have a stall?{' '}
            <Link href="/seller/login" className="text-primary font-semibold hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

// Reusable Input Component (DESIGN.md Compliant)
type InputFieldProps = {
  label: string;
  name: string;
  icon: React.ReactNode;
  placeholder: string;
  type?: string;
  maxLength?: number;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  required?: boolean;
};

function InputField({
  label,
  name,
  icon,
  placeholder,
  type = "text",
  maxLength,
  value,
  onChange,
  required,
}: InputFieldProps) {
  return (
    <div>
      <label className="block text-xs font-semibold text-tertiary mb-2 uppercase tracking-wide font-display">{label}</label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-on_surface/40">{icon}</span>
        <input
          type={type}
          name={name}
          maxLength={maxLength}
          value={value}
          onChange={onChange}
          className="w-full pl-10 pr-4 py-3 bg-transparent border-b border-outline_variant/40 focus:border-primary focus:outline-none transition font-body text-on_surface placeholder:text-on_surface/30"
          placeholder={placeholder}
          required={required}
        />
      </div>
    </div>
  );
}

type SelectFieldProps = {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  children: React.ReactNode;
  required?: boolean;
};

function SelectField({
  label,
  name,
  value,
  onChange,
  children,
  required,
}: SelectFieldProps) {
  return (
    <div>
      <label className="block text-xs font-semibold text-tertiary mb-2 uppercase tracking-wide font-display">{label}</label>
      <select
        name={name}
        value={value}
        onChange={onChange}
        className="w-full px-4 py-3 bg-transparent border-b border-outline_variant/40 focus:border-primary focus:outline-none transition font-body text-on_surface appearance-none"
        required={required}
      >
        {children}
      </select>
    </div>
  );
}
