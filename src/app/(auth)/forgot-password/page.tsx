'use client';

// src/app/(auth)/forgot-password/page.tsx

import React, { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const schema = z.object({
    email: z.string().email('Please enter a valid email address'),
});

type FormData = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [submitted, setSubmitted] = useState(false);
    // DEV ONLY: shows reset link when no email service is configured
    const [devResetUrl, setDevResetUrl] = useState('');
    const [submittedEmail, setSubmittedEmail] = useState('');

    const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
        resolver: zodResolver(schema),
    });

    const onSubmit = async (data: FormData) => {
        setIsLoading(true);
        setErrorMessage('');

        try {
            const res = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: data.email }),
            });

            const json = await res.json();

            if (!res.ok) {
                setErrorMessage(json.error || 'Something went wrong.');
                return;
            }

            setSubmittedEmail(data.email);
            // DEV ONLY: store the reset URL if backend returns it
            if (json.devResetUrl) {
                setDevResetUrl(json.devResetUrl);
            }
            setSubmitted(true);
        } catch {
            setErrorMessage('Something went wrong. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex w-full font-sans text-[#304250] bg-[#f8fafc] items-center justify-center p-4 relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-[#20A46B]/10 blur-[100px] pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="w-full max-w-[420px] bg-white p-8 sm:p-10 rounded-[32px] shadow-[0_20px_60px_-15px_rgba(48,66,80,0.08)] border border-[#304250]/10 relative z-10"
            >
                <AnimatePresence mode="wait">

                    {/* ── SUCCESS STATE ── */}
                    {submitted ? (
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
                                Check your email
                            </h1>
                            <p className="text-[#304250]/60 text-sm font-medium mb-2">
                                We&apos;ve sent a password reset link to
                            </p>
                            <p className="text-[#20A46B] font-bold text-sm mb-6">
                                {submittedEmail}
                            </p>
                            <p className="text-[#304250]/50 text-xs mb-8 leading-relaxed">
                                Didn&apos;t receive it? Check your spam folder or{' '}
                                <button
                                    onClick={() => { setSubmitted(false); setDevResetUrl(''); }}
                                    className="text-[#EEBE1C] font-bold hover:opacity-80 transition-opacity"
                                >
                                    try again
                                </button>
                                .
                            </p>

                            {/* ── DEV MODE: Show reset link directly ── */}
                            {devResetUrl && (
                                <div className="w-full mb-6 p-4 bg-amber-50 border border-amber-200 rounded-2xl text-left">
                                    <p className="text-amber-700 text-xs font-bold uppercase tracking-wide mb-2">
                                        🛠 Dev Mode — Reset Link
                                    </p>
                                    <p className="text-amber-600 text-xs mb-3 leading-relaxed">
                                        No email service configured. Use this link directly:
                                    </p>
                                    <a
                                        href={devResetUrl}
                                        className="block w-full text-center bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm py-2.5 px-4 rounded-xl transition-colors"
                                    >
                                        Open Reset Link →
                                    </a>
                                    <p className="text-amber-500 text-[11px] mt-2 text-center">
                                        Remove devResetUrl from API response in production
                                    </p>
                                </div>
                            )}

                            <Link
                                href="/login"
                                className="flex items-center gap-2 text-sm font-bold text-[#304250]/60 hover:text-[#20A46B] transition-colors"
                            >
                                <ArrowLeft size={16} />
                                Back to login
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
                                    <Mail className="w-7 h-7 text-[#20A46B]" />
                                </div>
                                <h1 className="text-2xl font-extrabold text-[#304250] tracking-tight mb-2">
                                    Forgot your password?
                                </h1>
                                <p className="text-[#304250]/60 text-sm font-medium">
                                    Enter your email and we&apos;ll send you a reset link.
                                </p>
                            </div>

                            {errorMessage && (
                                <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm font-medium text-center">
                                    {errorMessage}
                                </div>
                            )}

                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                                <div>
                                    <label className="block text-[13px] font-bold text-[#304250] mb-1.5 uppercase tracking-wide">
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        placeholder="you@company.com"
                                        {...register('email')}
                                        className="w-full h-12 px-4 rounded-xl border border-[#304250]/20 text-sm bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#20A46B] focus:border-transparent transition-all placeholder:text-[#304250]/40 text-[#304250] font-medium"
                                    />
                                    {errors.email && (
                                        <p className="text-red-500 text-xs mt-1 font-medium">{errors.email.message}</p>
                                    )}
                                </div>

                                <div className="pt-3">
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-full h-12 bg-[#20A46B] hover:bg-[#20A46B]/90 text-white font-bold rounded-xl text-[15px] transition-all flex items-center justify-center disabled:opacity-70 shadow-lg shadow-[#20A46B]/20 hover:-translate-y-0.5"
                                    >
                                        {isLoading ? (
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                        ) : (
                                            'Send Reset Link'
                                        )}
                                    </button>
                                </div>
                            </form>

                            <div className="mt-8 flex items-center justify-center">
                                <Link
                                    href="/login"
                                    className="flex items-center gap-2 text-sm font-bold text-[#304250]/60 hover:text-[#20A46B] transition-colors"
                                >
                                    <ArrowLeft size={16} />
                                    Back to login
                                </Link>
                            </div>
                        </motion.div>
                    )}

                </AnimatePresence>
            </motion.div>
        </div>
    );
}
