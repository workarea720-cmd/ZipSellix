"use client";
// src/app/admin/support/page.tsx

import React, { useState, useEffect } from 'react';
import {
    AlertCircle, Search, Image as ImageIcon,
    CheckCircle2, Clock, AlertTriangle, X, Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { API_URL } from '@/lib/api-client';
import { useRouter } from 'next/navigation';

const ADMIN_EMAIL = 'zipsellix@gmail.com';

export default function AdminSupportDashboard() {
    const { data: session, status } = useSession();
    const router = useRouter();

    const [tickets, setTickets] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    useEffect(() => {
        // ── Wait until session is resolved
        if (status === 'loading') return;

        // ── Not logged in
        if (status === 'unauthenticated' || !session?.user) {
            router.push('/login');
            return;
        }

        // ── Logged in but not admin
        if (session.user.email !== ADMIN_EMAIL) {
            setError(`Access Denied. Logged in as: ${session.user.email}`);
            setLoading(false);
            return;
        }

        // ── Admin confirmed — fetch tickets
        const fetchTickets = async () => {
            try {
                const res = await fetch(`${API_URL}/api/admin/all-tickets`, {
                    headers: {
                        'Content-Type': 'application/json',
                        'x-user-id': session.user.email!,
                        // ── FIXED: send internal secret so Python accepts the request
                        'x-internal-secret': process.env.NEXT_PUBLIC_INTERNAL_API_SECRET || '',
                    },
                });

                if (!res.ok) {
                    throw new Error(`Server returned ${res.status}`);
                }

                const data = await res.json();
                setTickets(data.tickets || []);
            } catch (err: any) {
                setError(`Failed to load tickets: ${err.message}`);
            } finally {
                setLoading(false);
            }
        };

        fetchTickets();
    }, [status, session, router]);

    const updateStatus = async (ticketId: string, userId: string, newStatus: string) => {
        // Optimistic UI update
        setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, status: newStatus } : t));

        try {
            await fetch(`${API_URL}/api/admin/tickets/${ticketId}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'x-user-id': session?.user?.email || '',
                    'x-internal-secret': process.env.NEXT_PUBLIC_INTERNAL_API_SECRET || '',
                },
                body: JSON.stringify({ status: newStatus, userId }),
            });
        } catch {
            alert('Failed to update status. Please refresh.');
        }
    };

    const filteredTickets = tickets.filter(t => {
        const matchesSearch =
            (t.subject || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (t.userId || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'OPEN': return <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-rose-50 text-rose-600 border border-rose-100 flex items-center gap-1 w-fit"><AlertTriangle size={12} /> Open</span>;
            case 'IN_PROGRESS': return <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-amber-50 text-amber-600 border border-amber-100 flex items-center gap-1 w-fit"><Clock size={12} /> In Progress</span>;
            case 'RESOLVED': return <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center gap-1 w-fit"><CheckCircle2 size={12} /> Resolved</span>;
            default: return <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-slate-100 text-slate-600">{status}</span>;
        }
    };

    // ── Loading state
    if (status === 'loading' || loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
                <Loader2 className="animate-spin w-8 h-8 text-[#20A46B] mb-4" />
                <p className="text-sm font-medium text-slate-400">Verifying Admin Access...</p>
            </div>
        );
    }

    // ── Error / access denied state
    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
                <motion.div
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full text-center border border-slate-100"
                >
                    <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-5">
                        <AlertCircle size={32} />
                    </div>
                    <h2 className="text-2xl font-black text-slate-800 mb-2 tracking-tight">Access Denied</h2>
                    <p className="text-sm text-slate-500 mb-6 leading-relaxed px-4">
                        You do not have permission to view this page.
                    </p>
                    <div className="mb-6 p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-mono text-slate-400 break-all">
                        {error}
                    </div>
                    <button
                        onClick={() => router.push('/tools/profit-calculator')}
                        className="w-full py-3.5 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition active:scale-[0.98]"
                    >
                        Return to Dashboard
                    </button>
                </motion.div>
            </div>
        );
    }

    // ── Main admin view
    return (
        <div className="min-h-screen bg-slate-50/50 pb-20">
            {/* Header */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Support Tickets</h1>
                            <p className="text-sm font-medium text-slate-500 mt-1">
                                {tickets.length} total ticket{tickets.length !== 1 ? 's' : ''}
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                                <input
                                    className="w-64 pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:ring-2 ring-[#20A46B]/20 outline-none transition-all"
                                    placeholder="Search user or subject..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <select
                                className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-700 outline-none focus:ring-2 ring-[#20A46B]/20 cursor-pointer"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <option value="ALL">All Status</option>
                                <option value="OPEN">Open</option>
                                <option value="IN_PROGRESS">In Progress</option>
                                <option value="RESOLVED">Resolved</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tickets */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
                {filteredTickets.length === 0 ? (
                    <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center shadow-sm">
                        <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle2 size={32} />
                        </div>
                        <h3 className="text-lg font-bold text-slate-800 mb-1">All Clear!</h3>
                        <p className="text-sm text-slate-500">No support tickets found matching your criteria.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredTickets.map((ticket) => (
                            <motion.div
                                key={ticket.id}
                                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow"
                            >
                                <div className="flex flex-col lg:flex-row gap-6">
                                    <div className="flex-1 space-y-3">
                                        <div className="flex items-center gap-3">
                                            {getStatusBadge(ticket.status)}
                                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-slate-100 px-2 py-0.5 rounded-md">
                                                {ticket.issueType}
                                            </span>
                                            <span className="text-xs font-medium text-slate-400 ml-auto">
                                                {new Date(ticket.date).toLocaleString()}
                                            </span>
                                        </div>
                                        <div>
                                            <h3 className="text-base font-bold text-slate-900">{ticket.subject}</h3>
                                            <p className="text-sm text-slate-500 font-medium mt-1">
                                                User: <span className="text-[#20A46B]">{ticket.userId}</span>
                                            </p>
                                        </div>
                                        <div className="bg-slate-50 p-4 rounded-xl text-sm text-slate-700 leading-relaxed border border-slate-100">
                                            {ticket.description}
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-4 lg:w-64 shrink-0 border-t lg:border-t-0 lg:border-l border-slate-100 pt-4 lg:pt-0 lg:pl-6">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                                Update Status
                                            </label>
                                            <select
                                                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-bold text-slate-700 outline-none focus:ring-2 ring-[#20A46B]/20 cursor-pointer"
                                                value={ticket.status}
                                                onChange={(e) => updateStatus(ticket.id, ticket.userId, e.target.value)}
                                            >
                                                <option value="OPEN">Open</option>
                                                <option value="IN_PROGRESS">In Progress</option>
                                                <option value="RESOLVED">Resolved</option>
                                            </select>
                                        </div>

                                        {ticket.attachment && (
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                                    Attachment
                                                </label>
                                                <button
                                                    onClick={() => setSelectedImage(ticket.attachment)}
                                                    className="w-full flex items-center justify-center gap-2 bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 py-2.5 rounded-xl text-sm font-bold transition-colors"
                                                >
                                                    <ImageIcon size={16} /> View Media
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* Image lightbox */}
            <AnimatePresence>
                {selectedImage && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[300] bg-slate-900/90 backdrop-blur-sm flex items-center justify-center p-4"
                        onClick={() => setSelectedImage(null)}
                    >
                        <button className="absolute top-6 right-6 text-white hover:text-rose-400 bg-white/10 hover:bg-white/20 p-2 rounded-full backdrop-blur-md transition">
                            <X size={24} />
                        </button>
                        <img
                            src={selectedImage} alt="Attached Media"
                            className="max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl border border-white/10"
                            onClick={e => e.stopPropagation()}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}