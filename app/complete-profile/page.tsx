'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';

/**
 * ✅ Complete Profile Page
 * 
 * User flow after Shopify OAuth login:
 * 1. User completes email OTP on Shopify
 * 2. Redirected to /api/auth/callback
 * 3. Callback checks profile status via /api/account/profile-status
 * 4. If incomplete, redirects here to complete profile
 * 5. User fills form (Full Name, Mobile, Age, Gender)
 * 6. Form submitted to /api/account/complete-profile
 * 7. Metafields saved to Shopify
 * 8. Redirects to /account
 * 
 * Also reached by:
 * - Client-side redirect if manually visiting /account with incomplete profile
 * 
 * Security:
 * - All data validated on server before sending to Shopify
 * - Token never exposed to client
 * - No localStorage for tokens
 */

interface ValidationError {
  field: string;
  message: string;
}

interface FormData {
  fullName: string;
  mobileNumber: string;
  age: string;
  gender: string;
}

const GENDERS = ['Male', 'Female', 'Other'];

export default function CompleteProfilePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState<string | null>(null);

  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    mobileNumber: '',
    age: '',
    gender: '',
  });

  // On mount, verify user is authenticated and has incomplete profile
  useEffect(() => {
    const verifyProfile = async () => {
      try {
        console.log('[Complete Profile Page] Verifying profile status on mount');

        const response = await fetch('/api/account/profile-status', {
          credentials: 'include',
        });

        console.log('[Complete Profile Page] Profile status response:', response.status);

        if (response.status === 401) {
          console.log('[Complete Profile Page] Not authenticated, redirecting to login');
          router.replace('/login');
          return;
        }

        // 500 errors are OK - show form anyway for user to complete profile
        if (response.status === 500) {
          console.warn('[Complete Profile Page] Profile status check failed (500), showing form anyway');
          setIsLoading(false);
          return;
        }

        if (!response.ok) {
          console.error('[Complete Profile Page] Profile status check failed:', response.status);
          // Show form anyway
          setIsLoading(false);
          return;
        }

        const data = await response.json();

        console.log('[Complete Profile Page] Profile status:', {
          success: data.success,
          isComplete: data.isComplete,
        });

        if (data.success && data.isComplete) {
          console.log('[Complete Profile Page] Profile already complete, redirecting to /account');
          router.replace('/account');
          return;
        }

        // Profile incomplete (or API returned error) - show form
        setIsLoading(false);
      } catch (error) {
        console.warn('[Complete Profile Page] Error verifying profile:', error);
        // Network error or parse error - show form anyway
        setIsLoading(false);
      }
    };

    verifyProfile();
  }, [router]);

  const handleInputChange = (
    field: keyof FormData,
    value: string
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});
    setApiError(null);

    try {
      console.log('[Complete Profile Page] Submitting profile completion form');

      // Client-side validation
      const newErrors: Record<string, string> = {};

      if (!formData.fullName.trim()) {
        newErrors.fullName = 'Full name is required';
      } else if (formData.fullName.length > 100) {
        newErrors.fullName = 'Full name must be 100 characters or less';
      }

      if (!formData.mobileNumber.trim()) {
        newErrors.mobileNumber = 'Mobile number is required';
      } else {
        const cleanNumber = formData.mobileNumber.replace(/^\+91/, '').trim();
        if (!/^[6-9]\d{9}$/.test(cleanNumber)) {
          newErrors.mobileNumber = 'Invalid mobile number. Please enter a 10-digit number (e.g., 9876543210)';
        }
      }

      if (!formData.age) {
        newErrors.age = 'Age is required';
      } else {
        const ageNum = parseInt(formData.age, 10);
        if (isNaN(ageNum) || ageNum < 13 || ageNum > 120) {
          newErrors.age = 'Age must be between 13 and 120';
        }
      }

      if (!formData.gender) {
        newErrors.gender = 'Gender is required';
      }

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        setIsSubmitting(false);
        return;
      }

      // Submit to server
      const response = await fetch('/api/account/complete-profile', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        console.error('[Complete Profile Page] Failed to parse response');
        setApiError('An error occurred while saving your profile. Please try again.');
        setIsSubmitting(false);
        return;
      }

      if (!response.ok) {
        if (response.status === 401) {
          console.log('[Complete Profile Page] Session expired (401)');
          setApiError('Your session has expired. Please log in again.');
          setTimeout(() => router.replace('/login'), 2000);
          setIsSubmitting(false);
          return;
        }

        // Handle validation errors from server
        if (data.errors && Array.isArray(data.errors)) {
          const serverErrors: Record<string, string> = {};
          data.errors.forEach((error: ValidationError) => {
            serverErrors[error.field] = error.message;
          });
          setErrors(serverErrors);
        } else {
          setApiError(data.message || 'Failed to save profile. Please try again.');
        }

        setIsSubmitting(false);
        return;
      }

      // Success
      console.log('[Complete Profile Page] Profile saved successfully');
      setIsSuccess(true);

      // Redirect after showing success message
      setTimeout(() => {
        router.replace('/account');
      }, 2000);
    } catch (error) {
      console.error('[Complete Profile Page] Unexpected error:', error);
      setApiError('An unexpected error occurred. Please try again.');
      setIsSubmitting(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream-50 px-4">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-brand-600" />
          <p className="text-muted-foreground">Verifying profile status...</p>
        </div>
      </div>
    );
  }

  // Success state
  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream-50 px-4">
        <div className="w-full max-w-md text-center">
          <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto mb-4" />
          <h1 className="font-serif text-3xl text-brand-900 mb-2">Profile Complete!</h1>
          <p className="text-muted-foreground mb-6">
            Your profile has been saved successfully. Redirecting to your account...
          </p>
          <Loader2 className="w-5 h-5 animate-spin mx-auto text-brand-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream-50 px-4 py-8 md:py-12">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground mb-4 inline-block">
            ← Back
          </Link>
          <h1 className="font-serif text-4xl text-brand-900 mb-2">Complete Your Profile</h1>
          <p className="text-muted-foreground">
            Help us get to know you better. This information will be saved to your account.
          </p>
        </div>

        {/* Error Alert */}
        {apiError && (
          <div className="mb-6 p-4 rounded-lg border border-red-200 bg-red-50">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-900">{apiError}</p>
              </div>
            </div>
          </div>
        )}

        {/* Form Card */}
        <div className="bg-white rounded-lg border border-border p-6 md:p-8 mb-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Full Name */}
            <div>
              <Label htmlFor="fullName" className="text-sm font-medium">
                Full Name *
              </Label>
              <Input
                id="fullName"
                type="text"
                placeholder="Enter your full name"
                value={formData.fullName}
                onChange={e => handleInputChange('fullName', e.target.value)}
                disabled={isSubmitting}
                maxLength={100}
                className={errors.fullName ? 'border-red-500 focus-visible:ring-red-500' : ''}
              />
              {errors.fullName && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.fullName}
                </p>
              )}
            </div>

            {/* Mobile Number */}
            <div>
              <Label htmlFor="mobileNumber" className="text-sm font-medium">
                Mobile Number *
              </Label>
              <Input
                id="mobileNumber"
                type="tel"
                placeholder="9876543210 or +91 9876543210"
                value={formData.mobileNumber}
                onChange={e => handleInputChange('mobileNumber', e.target.value)}
                disabled={isSubmitting}
                maxLength={13}
                className={errors.mobileNumber ? 'border-red-500 focus-visible:ring-red-500' : ''}
              />
              {errors.mobileNumber && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.mobileNumber}
                </p>
              )}
              <p className="mt-1 text-xs text-muted-foreground">
                Indian mobile number (10 digits)
              </p>
            </div>

            {/* Age */}
            <div>
              <Label htmlFor="age" className="text-sm font-medium">
                Age *
              </Label>
              <Input
                id="age"
                type="number"
                placeholder="e.g., 28"
                value={formData.age}
                onChange={e => handleInputChange('age', e.target.value)}
                disabled={isSubmitting}
                min="13"
                max="120"
                className={errors.age ? 'border-red-500 focus-visible:ring-red-500' : ''}
              />
              {errors.age && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.age}
                </p>
              )}
            </div>

            {/* Gender */}
            <div>
              <Label htmlFor="gender" className="text-sm font-medium">
                Gender *
              </Label>
              <select
                id="gender"
                value={formData.gender}
                onChange={e => handleInputChange('gender', e.target.value)}
                disabled={isSubmitting}
                className={`w-full px-3 py-2 rounded-md border border-input bg-background text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                  errors.gender ? 'border-red-500 focus-visible:ring-red-500' : ''
                }`}
              >
                <option value="">Select your gender</option>
                {GENDERS.map(g => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
              {errors.gender && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.gender}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isSubmitting}
              size="lg"
              className="w-full"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Profile'
              )}
            </Button>
          </form>
        </div>

        {/* Info */}
        <div className="text-center text-sm text-muted-foreground">
          <p>
            All information is securely stored in your account. You can update these details later.
          </p>
        </div>
      </div>
    </div>
  );
}
