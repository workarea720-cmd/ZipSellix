'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';

function VerifyEmailContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('Verifying your email...');

    const token = searchParams.get('token');

    useEffect(() => {
        if (!token) {
            setStatus('error');
            setMessage('Missing verification token.');
            return;
        }

        const verify = async () => {
            try {
                const response = await fetch('/api/auth/verify-email', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ token }),
                });

                const data = await response.json();

                if (response.ok) {
                    setStatus('success');
                    setMessage('Email verified successfully! Redirecting to login...');
                    setTimeout(() => router.push('/login'), 3000);
                } else {
                    setStatus('error');
                    setMessage(data.error || 'Invalid or expired token.');
                }
            } catch (err) {
                setStatus('error');
                setMessage('An error occurred during verification.');
            }
        };

        verify();
    }, [token, router]);

    return (
        <div className="min-h-screen flex w-full font-sans text-[#304250] bg-[#f8fafc] items-center justify-center p-4 relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-[#20A46B]/10 blur-[100px] pointer-events-none"></div>

            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: "easeOut" }} className="max-w-md w-full bg-white p-8 sm:p-10 rounded-[32px] shadow-[0_20px_60px_-15px_rgba(48,66,80,0.08)] border border-[#304250]/10 text-center relative z-10">

                {/* Brand Logo added for consistency */}
                <div className="flex justify-center mb-8">
                    <img src="/wordmark-logo.svg" alt="ZipSellix Logo" className="h-10 w-auto object-contain" />
                </div>

                <div className="flex justify-center mb-6">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center ${status === 'loading' || status === 'success' ? 'bg-[#20A46B]/10' : 'bg-red-50'}`}>
                        {status === 'loading' && <Loader2 className="w-8 h-8 text-[#20A46B] animate-spin" />}
                        {status === 'success' && <CheckCircle className="w-8 h-8 text-[#20A46B]" />}
                        {status === 'error' && <XCircle className="w-8 h-8 text-red-600" />}
                    </div>
                </div>

                {/* Typography updated to Dark Blue */}
                <h1 className="text-2xl font-extrabold text-[#304250] tracking-tight mb-2">Email Verification</h1>
                <p className="text-[#304250]/70 font-medium text-sm">{message}</p>
            </motion.div>
        </div>
    );
}

export default function VerifyEmailPage() {
    return (
        // Suspense fallback styling updated to match the brand background and loader
        <Suspense fallback={
            <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-[#20A46B] animate-spin" />
            </div>
        }>
            <VerifyEmailContent />
        </Suspense>
    );
}