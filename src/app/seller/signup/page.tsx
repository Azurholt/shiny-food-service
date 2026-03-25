// src/app/seller/signup/page.tsx
// Kueue - Seller Registration Form

'use client';  // This tells Next.js this is a client component (uses useState)

import { useState } from 'react';
import { ChefHat, MapPin, Phone, Utensils, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '../../lib/supabaseClient';

// Food categories available in Kumasi
const FOOD_CATEGORIES = [
  { value: '', label: 'Select your food type' },
  { value: 'bread-egg', label: '🍳 Bread & Egg' },
  { value: 'shawarma', label: '🌯 Shawarma' },
  { value: 'waakye', label: '🍲 Waakye' },
  { value: 'chicken-rice', label: '🍗 Chicken & Rice' },
  { value: 'fufu', label: '🥣 Fufu & Soup' },
  { value: 'kebabs', label: '🍢 Kebabs' },
  { value: 'snacks', label: '🥟 Snacks & Small Chops' },
  { value: 'other', label: '🍽️ Other' },
];

// Popular locations in Kumasi
const KUMASI_LOCATIONS = [
  { value: '', label: 'Select your location' },
  { value: 'adum', label: 'Adum' },
  { value: 'ayeduase gate', label: 'Ayeduase Gate' },
  { value: 'engineering gate', label: 'Engineering Gate' },
  { value: 'kejetia', label: 'Kejetia' },
  { value: 'asawase', label: 'Asawase' },
  { value: 'bomso', label: 'Bomso' },
  { value: 'ahodwo', label: 'Ahodwo' },
  { value: 'nhyiaeso', label: 'Nhyiaeso' },
  { value: 'tafo', label: 'Tafo' },
  { value: 'suame', label: 'Suame' },
  { value: 'kronum', label: 'Kronum' },
  { value: 'other', label: 'Other (specify in notes)' },
];

export default function SellerSignup() {
  // Form state - stores all the input values
  const [formData, setFormData] = useState({
    businessName: '',
    ownerName: '',
    phone: '',
    location: '',
    foodCategory: '',
    notes: '',
  });

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Basic validation
    if (!formData.businessName || !formData.ownerName || !formData.phone || !formData.location || !formData.foodCategory) {
      setError('Please fill in all required fields');
      return;
    }

    // Validate phone number (Ghana format - 10 digits)
    const phoneRegex = /^0[1-9]\d{8}$/;
    if (!phoneRegex.test(formData.phone.replace(/\s/g, ''))) {
      setError('Please enter a valid Ghana phone number (e.g., 0541234567)');
      return;
    }

    setIsSubmitting(true);

    try {
      // Send data to Supabase
      const { data, error: supabaseError } = await supabase
        .from('sellers')
        .insert([
          {
            business_name: formData.businessName,
            owner_name: formData.ownerName,
            phone: formData.phone,
            location: formData.location,
            food_category: formData.foodCategory,
            notes: formData.notes || null,
            status: 'pending',
          },
        ]);
        
      if (supabaseError) {
        throw supabaseError;
      }

      console.log('Seller registered successfully:', data);
      setIsSubmitted(true);
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(err.message || 'Failed to register. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  // Show success message after submission
  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Registration Received!</h1>
          <p className="text-gray-600 mb-6">
            Thank you, <strong>{formData.ownerName}</strong>! We'll review your application for 
            <strong> {formData.businessName}</strong> and contact you at <strong>{formData.phone}</strong> within 24 hours.
          </p>
          <Link 
            href="/" 
            className="inline-block bg-green-700 text-white px-6 py-3 rounded-lg hover:bg-green-800 transition"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/" className="text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div className="flex items-center gap-2">
            <ChefHat className="w-8 h-8 text-yellow-600" />
            <span className="text-xl font-bold text-gray-800">Kueue</span>
          </div>
        </div>
      </header>

      {/* Main Form */}
      <main className="max-w-3xl mx-auto px-4 py-8">
        
        {/* Page Title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Register Your Food Stall</h1>
          <p className="text-gray-600">Join Kueue and organize your orders today</p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
          
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Business Name */}
            <div>
              <label htmlFor="businessName" className="block text-sm font-semibold text-gray-700 mb-2">
                Business / Stall Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Utensils className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  id="businessName"
                  name="businessName"
                  value={formData.businessName}
                  onChange={handleChange}
                  placeholder="e.g., Auntie Ama's Shawarma"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition text-gray-900"
                  required
                />
              </div>
            </div>

            {/* Owner Name */}
            <div>
              <label htmlFor="ownerName" className="block text-sm font-semibold text-gray-700 mb-2">
                Your Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="ownerName"
                name="ownerName"
                value={formData.ownerName}
                onChange={handleChange}
                placeholder="e.g., Ama Mensah"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition text-gray-900"
                required
              />
            </div>

            {/* Phone Number */}
            <div>
              <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">
                Phone Number (Mobile Money) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="e.g., 0541234567"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition text-gray-900"
                  required
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">We'll use this for payments and notifications</p>
            </div>

            {/* Location */}
            <div>
              <label htmlFor="location" className="block text-sm font-semibold text-gray-700 mb-2">
                Your Location in Kumasi <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <select
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition bg-white text-gray-900"
                  required
                >
                  {KUMASI_LOCATIONS.map(loc => (
                    <option key={loc.value} value={loc.value}>
                      {loc.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Food Category */}
            <div>
              <label htmlFor="foodCategory" className="block text-sm font-semibold text-gray-700 mb-2">
                Primary Food Category <span className="text-red-500">*</span>
              </label>
              <select
                id="foodCategory"
                name="foodCategory"
                value={formData.foodCategory}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition bg-white text-gray-900"
                required
              >
                {FOOD_CATEGORIES.map(cat => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Additional Notes */}
            <div>
              <label htmlFor="notes" className="block text-sm font-semibold text-gray-700 mb-2">
                Additional Notes <span className="text-gray-400">(optional)</span>
              </label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Tell us about your menu, operating hours, or any special requirements..."
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition resize-none text-gray-900"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-green-700 text-white py-4 rounded-lg font-semibold text-lg hover:bg-green-800 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isSubmitting ? '⏳ Submitting...' : '✅ Register My Stall'}
            </button>

            {/* Terms */}
            <p className="text-xs text-gray-500 text-center">
              By registering, you agree to our Terms of Service. Free trial for the first 30 days.
            </p>
          </form>
        </div>

        {/* Benefits Section */}
        <div className="mt-8 grid md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4 text-center shadow-sm">
            <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <h3 className="font-semibold text-gray-800">Free 30-Day Trial</h3>
            <p className="text-sm text-gray-600">No payment required to start</p>
          </div>
          <div className="bg-white rounded-lg p-4 text-center shadow-sm">
            <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <h3 className="font-semibold text-gray-800">Works on Any Phone</h3>
            <p className="text-sm text-gray-600">No expensive equipment needed</p>
          </div>
          <div className="bg-white rounded-lg p-4 text-center shadow-sm">
            <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <h3 className="font-semibold text-gray-800">Get Paid Faster</h3>
            <p className="text-sm text-gray-600">Mobile Money payments upfront</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 text-center mt-12">
        <p className="text-gray-400">© 2026 Kueue. Made with ❤️ in Kumasi.</p>
      </footer>
    </div>
  );
}
