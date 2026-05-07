'use client';

// src/app/(auth)/reset-password/page.tsx

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Eye, EyeOff, CheckCircle2, XCircle, KeyRound } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const schema = z
    .object({
        newPassword: z
            .string()
            .min(8, 'Password must be at least 8 characters')
            .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
            .regex(/[0-9]/, 'Must contain at least one number'),
        confirmPassword: z.string().min(1, 'Please confirm your password'),
    })
    .refine((d) => d.newPassword === d.confirmPassword, {
        message: "Passwords don't match",
        path: ['confirmPassword'],
    });

type FormData = z.infer<typeof schema>;

// ── Inner component (needs useSearchParams, must be inside Suspense)
function ResetPasswordForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get('token');

    const [isLoading, setIsLoading] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [success, setSuccess] = useState(false);

    const { register, handleSubmit, formState: { errors }, watch } = useForm<FormData>({
        resolver: zodResolver(schema),
    });

    const newPasswordVal = watch('newPassword', '');

    // Redirect to forgot-password if no token
    useEffect(() => {
        if (!token) {
            router.replace('/forgot-password');
        }
    }, [token, router]);

    const onSubmit = async (data: FormData) => {
        if (!token) return;

        setIsLoading(true);
        setErrorMessage('');

        try {
            const res = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, newPassword: data.newPassword }),
            });

            const json = await res.json();

            if (!res.ok) {
                setErrorMessage(json.error || 'Something went wrong.');
                return;
            }

            setSuccess(true);
            // Redirect to login after 3 seconds
            setTimeout(() => router.push('/login'), 3000);
        } catch {
            setErrorMessage('Something went wrong. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    // Password strength indicator
    const getStrength = (pw: string) => {
        if (!pw) return { score: 0, label: '', color: '' };
        let score = 0;
        if (pw.length >= 8) score++;
        if (/[A-Z]/.test(pw)) score++;
        if (/[0-9]/.test(pw)) score++;
        if (/[^A-Za-z0-9]/.test(pw)) score++;
        if (score <= 1) return { score, label: 'Weak', color: '#EF4444' };
        if (score === 2) return { score, label: 'Fair', color: '#F59E0B' };
        if (score === 3) return { score, label: 'Good', color: '#3B82F6' };
        return { score, label: 'Strong', color: '#20A46B' };
    };

    const strength = getStrength(newPasswordVal);

    if (!token) return null;

    return (
        <AnimatePresence mode="wait">

            {/* ── SUCCESS STATE ── */}
            {success ? (
                <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    className="flex flex-col items-center text-center"
                >
                    <div className="w-16 h-16 bg-[#20A46B]/10 rounded-full flex items-center justify-center mb-6">
                        <CheckCircle2 className="w-8 h-8 text-[#20A46B]" />
                    </div>
                    <h1 className="text-2xl font-extrabold text-[#304250] tracking-tight mb-2">
                        Password Updated!
                    </h1>
                    <p className="text-[#304250]/60 text-sm font-medium mb-6">
                        Your password has been reset successfully.
                        <br />Redirecting you to login...
                    </p>
                    <div className="flex gap-1.5">
                        {[0, 1, 2].map((i) => (
                            <motion.div
                                key={i}
                                className="w-2 h-2 rounded-full bg-[#20A46B]"
                                animate={{ scale: [1, 1.4, 1] }}
                                transition={{ delay: i * 0.15, repeat: Infinity, duration: 0.8 }}
                            />
                        ))}
                    </div>
                    <Link href="/login" className="mt-8 text-sm font-bold text-[#20A46B] hover:opacity-80 transition-opacity">
                        Go to Login Now →
                    </Link>
                </motion.div>

            ) : (

                /* ── FORM STATE ── */
                <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>

                    <div className="flex flex-col items-center text-center mb-8">
                        <img
                            src="/wordmark-logo.svg"
                            alt="ZipSellix Logo"
                            className="h-12 w-auto mb-6 object-contain"
                        />
                        <div className="w-14 h-14 bg-[#20A46B]/10 rounded-2xl flex items-center justify-center mb-4">
                            <KeyRound className="w-7 h-7 text-[#20A46B]" />
                        </div>
                        <h1 className="text-2xl font-extrabold text-[#304250] tracking-tight mb-2">
                            Set new password
                        </h1>
                        <p className="text-[#304250]/60 text-sm font-medium">
                            Choose a strong password for your account.
                        </p>
                    </div>

                    {errorMessage && (
                        <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5">
                            <XCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                            <p className="text-red-600 text-sm font-medium">{errorMessage}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

                        {/* New Password */}
                        <div>
                            <label className="block text-[13px] font-bold text-[#304250] mb-1.5 uppercase tracking-wide">
                                New Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showNew ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    {...register('newPassword')}
                                    className="w-full h-12 pl-4 pr-10 rounded-xl border border-[#304250]/20 text-sm bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#20A46B] focus:border-transparent transition-all placeholder:text-[#304250]/40 text-[#304250] font-medium"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowNew(!showNew)}
                                    className="absolute right-3 top-3.5 text-[#304250]/40 hover:text-[#20A46B] transition-colors"
                                >
                                    {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>

                            {/* Strength bar */}
                            {newPasswordVal.length > 0 && (
                                <div className="mt-2">
                                    <div className="flex gap-1 mb-1">
                                        {[1, 2, 3, 4].map((i) => (
                                            <div
                                                key={i}
                                                className="h-1 flex-1 rounded-full transition-all duration-300"
                                                style={{
                                                    backgroundColor: i <= strength.score ? strength.color : '#E5E7EB',
                                                }}
                                            />
                                        ))}
                                    </div>
                                    {strength.label && (
                                        <p className="text-xs font-semibold" style={{ color: strength.color }}>
                                            {strength.label}
                                        </p>
                                    )}
                                </div>
                            )}

                            {errors.newPassword && (
                                <p className="text-red-500 text-xs mt-1 font-medium">{errors.newPassword.message}</p>
                            )}
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label className="block text-[13px] font-bold text-[#304250] mb-1.5 uppercase tracking-wide">
                                Confirm Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showConfirm ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    {...register('confirmPassword')}
                                    className="w-full h-12 pl-4 pr-10 rounded-xl border border-[#304250]/20 text-sm bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#20A46B] focus:border-transparent transition-all placeholder:text-[#304250]/40 text-[#304250] font-medium"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirm(!showConfirm)}
                                    className="absolute right-3 top-3.5 text-[#304250]/40 hover:text-[#20A46B] transition-colors"
                                >
                                    {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            {errors.confirmPassword && (
                                <p className="text-red-500 text-xs mt-1 font-medium">{errors.confirmPassword.message}</p>
                            )}
                        </div>

                        <div className="pt-3">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full h-12 bg-[#20A46B] hover:bg-[#20A46B]/90 text-white font-bold rounded-xl text-[15px] transition-all flex items-center justify-center disabled:opacity-70 shadow-lg shadow-[#20A46B]/20 hover:-translate-y-0.5"
                            >
                                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Reset Password'}
                            </button>
                        </div>
                    </form>

                    <p className="mt-8 text-center text-sm font-medium text-[#304250]/60">
                        Remember your password?{' '}
                        <Link href="/login" className="text-[#20A46B] hover:opacity-80 font-bold transition-opacity">
                            Log in
                        </Link>
                    </p>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

// ── Page wrapper with Suspense (required for useSearchParams in Next.js 15)
export default function ResetPasswordPage() {
    return (
        <div className="min-h-screen flex w-full font-sans text-[#304250] bg-[#f8fafc] items-center justify-center p-4 relative overflow-hidden">
            <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-[#20A46B]/10 blur-[100px] pointer-events-none" />
            <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="w-full max-w-[420px] bg-white p-8 sm:p-10 rounded-[32px] shadow-[0_20px_60px_-15px_rgba(48,66,80,0.08)] border border-[#304250]/10 relative z-10"
            >
                <Suspense fallback={
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-[#20A46B]" />
                    </div>
                }>
                    <ResetPasswordForm />
                </Suspense>
            </motion.div>
        </div>
    );
}
