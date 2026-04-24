'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Eye, EyeOff, Box } from 'lucide-react';
import { motion } from 'framer-motion';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

const loginSchema = z.object({
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

// Brand Icons
const GoogleIcon = () => (<svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /></svg>);
const FacebookIcon = () => (<svg className="w-5 h-5 text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>);
const AppleIcon = () => (<svg className="w-[22px] h-[22px] text-[#304250]" viewBox="0 0 384 512" fill="currentColor"><path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" /></svg>);

export default function LoginPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data: LoginFormData) => {
        setIsLoading(true);
        setErrorMessage('');

        try {
            const res = await signIn('credentials', {
                email: data.email,
                password: data.password,
                redirect: false,
            });

            if (res?.error) {
                setErrorMessage('Invalid email or password.');
            } else {
                router.push('/tools/profit-calculator');
                router.refresh();
            }
        } catch (err) {
            setErrorMessage('Something went wrong. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex w-full font-sans text-[#304250] bg-[#f8fafc] items-center justify-center p-4 relative overflow-hidden">
            {/* Background Glow using Primary Green */}
            <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-[#20A46B]/10 blur-[100px] pointer-events-none"></div>

            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: 'easeOut' }} className="w-full max-w-[420px] bg-white p-8 sm:p-10 rounded-[32px] shadow-[0_20px_60px_-15px_rgba(48,66,80,0.08)] border border-[#304250]/10 relative z-10">

                <div className="flex flex-col items-center text-center mb-8">
                    {/* Logo Section */}
                    <img src="/wordmark-logo.svg" alt="ZipSellix Logo" className="h-12 w-auto mb-6 object-contain" />

                    {/* Heading in Dark Blue (30%) */}
                    <h1 className="text-2xl font-extrabold text-[#304250] tracking-tight mb-2">Welcome back</h1>
                    <p className="text-[#304250]/60 text-sm font-medium">Log in to manage your COD operations.</p>
                </div>

                {errorMessage && <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm font-medium text-center">{errorMessage}</div>}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                    <div>
                        <label className="block text-[13px] font-bold text-[#304250] mb-1.5 uppercase tracking-wide">Email</label>
                        <input type="email" placeholder="you@company.com" {...register('email')} className="w-full h-12 px-4 rounded-xl border border-[#304250]/20 text-sm bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#20A46B] focus:border-transparent transition-all placeholder:text-[#304250]/40 text-[#304250] font-medium" />
                        {errors.email && <p className="text-red-500 text-xs mt-1 font-medium">{errors.email.message}</p>}
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-1.5">
                            <label className="block text-[13px] font-bold text-[#304250] uppercase tracking-wide">Password</label>
                            {/* Accent Color Yellow (10%) for link - FIXED */}
                            <Link href="/forgot-password" className="text-[13px] font-bold text-[#EEBE1C] hover:opacity-80 transition-opacity">Forgot password?</Link>
                        </div>
                        <div className="relative">
                            <input type={showPassword ? "text" : "password"} placeholder="••••••••" {...register('password')} className="w-full h-12 pl-4 pr-10 rounded-xl border border-[#304250]/20 text-sm bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#20A46B] focus:border-transparent transition-all placeholder:text-[#304250]/40 text-[#304250] font-medium" />
                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3.5 text-[#304250]/40 hover:text-[#20A46B] transition-colors">
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                        {errors.password && <p className="text-red-500 text-xs mt-1 font-medium">{errors.password.message}</p>}
                    </div>

                    <div className="pt-3">
                        {/* Primary Button in Signature Green (60%) */}
                        <button type="submit" disabled={isLoading} className="w-full h-12 bg-[#20A46B] hover:bg-[#20A46B]/90 text-white font-bold rounded-xl text-[15px] transition-all flex items-center justify-center disabled:opacity-70 shadow-lg shadow-[#20A46B]/20 hover:-translate-y-0.5">
                            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Log In'}
                        </button>
                    </div>
                </form>

                <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[#304250]/10"></div></div>
                    <div className="relative flex justify-center text-[12px] font-bold uppercase tracking-widest"><span className="px-3 bg-white text-[#304250]/40">Or continue with</span></div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                    <button type="button" className="h-11 bg-white border border-[#304250]/10 hover:border-[#304250]/30 hover:bg-gray-50 rounded-xl transition-all flex items-center justify-center shadow-sm"><GoogleIcon /></button>
                    <button type="button" className="h-11 bg-white border border-[#304250]/10 hover:border-[#304250]/30 hover:bg-gray-50 rounded-xl transition-all flex items-center justify-center shadow-sm"><FacebookIcon /></button>
                    <button type="button" className="h-11 bg-white border border-[#304250]/10 hover:border-[#304250]/30 hover:bg-gray-50 rounded-xl transition-all flex items-center justify-center shadow-sm"><AppleIcon /></button>
                </div>

                <p className="mt-8 text-center text-sm font-medium text-[#304250]/60">
                    Don't have an account? <Link href="/signup" className="text-[#20A46B] hover:opacity-80 font-bold transition-opacity">Sign up for free</Link>
                </p>
            </motion.div>
        </div>
    );
}