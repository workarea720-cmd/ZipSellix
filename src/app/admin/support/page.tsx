"use client";
import React, { useState, useEffect } from 'react';
import {
    AlertCircle, Search, ChevronDown, Image as ImageIcon,
    CheckCircle2, Clock, AlertTriangle, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { API_URL } from '@/lib/api-client';
import { useRouter } from 'next/navigation';
import { useBusinessStore } from '@/store/business-store';

export default function AdminSupportDashboard() {
    const store = useBusinessStore();

    const [tickets, setTickets] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [debugEmail, setDebugEmail] = useState('Checking memory...');
    const router = useRouter();

    const [statusFilter, setStatusFilter] = useState('ALL');

    useEffect(() => {
        let isResolved = false; // 👈 Yeh track karega ke humara faisla hua ya nahi

        const attemptLogin = async () => {
            let foundEmail = store?.account?.email;

            if (!foundEmail && typeof window !== 'undefined') {
                const keysToCheck = ['business-store', 'zipsellix-store', 'zustand-store'];
                for (const key of keysToCheck) {
                    try {
                        const data = localStorage.getItem(key);
                        if (data) {
                            const parsed = JSON.parse(data);
                            foundEmail = parsed?.state?.account?.email || parsed?.account?.email || foundEmail;
                        }
                    } catch (e) { }
                }
            }

            setDebugEmail(foundEmail || "No email found in memory");

            if (foundEmail === 'zipsellix@gmail.com') {
                isResolved = true; // Mil gayi!
                try {
                    const res = await fetch(`${API_URL}/api/admin/all-tickets`, {
                        headers: {
                            'Content-Type': 'application/json',
                            'x-user-id': foundEmail
                        }
                    });

                    if (res.ok) {
                        const data = await res.json();
                        setTickets(data.tickets || []);
                        setLoading(false);
                        setError(false);
                    } else {
                        throw new Error("Backend rejected");
                    }
                } catch (err) {
                    setError(true);
                    setLoading(false);
                }
            } else if (foundEmail && foundEmail !== 'zipsellix@gmail.com') {
                isResolved = true; // Email mili par admin nahi hai
                setError(true);
                setLoading(false);
            }
        };

        attemptLogin();

        // 🔥 FAILSAFE TIMER (The Ultimate Fix) 🔥
        // Agar 2.5 seconds guzar jayen aur `isResolved` abhi bhi false ho (yani system phansa hua hai)
        // Toh infinite loading rok kar Access Denied de do.
        const timer = setTimeout(() => {
            if (!isResolved) {
                setDebugEmail("Timeout: Session completely empty or unreadable");
                setError(true);
                setLoading(false);
            }
        }, 2500);

        return () => clearTimeout(timer);
    }, [store?.account?.email]);

    const updateStatus = async (ticketId: string, userId: string, newStatus: string) => {
        setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, status: newStatus } : t));

        try {
            const adminEmail = store?.account?.email || 'zipsellix@gmail.com';
            await fetch(`${API_URL}/api/admin/tickets/${ticketId}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'x-user-id': adminEmail
                },
                body: JSON.stringify({ status: newStatus, userId })
            });
        } catch (e) {
            alert("Failed to update status.");
            if (store?.account?.email) window.location.reload();
        }
    };

    const filteredTickets = tickets.filter(t => {
        const matchesSearch = (t.subject || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
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

    if (error && !loading) {
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
                        You do not have permission to view this page. Please log in with an authorized administrator account.
                    </p>

                    <div className="mb-8 p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-mono text-slate-400 break-all">
                        Detected Email: <span className="font-bold text-rose-500">{debugEmail}</span>
                    </div>

                    <button onClick={() => router.push('/')} className="w-full py-3.5 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition active:scale-[0.98]">
                        Return to Dashboard
                    </button>
                </motion.div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary mb-4"></div>
                <p className="text-sm font-medium text-slate-400">Verifying Admin Access...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50/50 pb-20">
            {/* Header */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Support Tickets</h1>
                            <p className="text-sm font-medium text-slate-500 mt-1">Manage and resolve user reported issues.</p>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                                <input
                                    className="w-64 pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:ring-2 ring-brand-primary/20 outline-none transition-all"
                                    placeholder="Search user or subject..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <select
                                className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-700 outline-none focus:ring-2 ring-brand-primary/20 cursor-pointer"
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

            {/* Main Content */}
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
                                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                key={ticket.id}
                                className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow"
                            >
                                <div className="flex flex-col lg:flex-row gap-6">
                                    <div className="flex-1 space-y-3">
                                        <div className="flex items-center gap-3">
                                            {getStatusBadge(ticket.status)}
                                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-slate-100 px-2 py-0.5 rounded-md">{ticket.issueType}</span>
                                            <span className="text-xs font-medium text-slate-400 ml-auto">{new Date(ticket.date).toLocaleString()}</span>
                                        </div>
                                        <div>
                                            <h3 className="text-base font-bold text-slate-900">{ticket.subject}</h3>
                                            <p className="text-sm text-slate-500 font-medium mt-1">User: <span className="text-brand-primary">{ticket.userId}</span></p>
                                        </div>
                                        <div className="bg-slate-50 p-4 rounded-xl text-sm text-slate-700 leading-relaxed border border-slate-100">{ticket.description}</div>
                                    </div>

                                    <div className="flex flex-col gap-4 lg:w-64 shrink-0 border-t lg:border-t-0 lg:border-l border-slate-100 pt-4 lg:pt-0 lg:pl-6">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Update Status</label>
                                            <select
                                                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-bold text-slate-700 outline-none focus:ring-2 ring-brand-primary/20 cursor-pointer"
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
                                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Attachment</label>
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
                        <img src={selectedImage} alt="Attached Media" className="max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl border border-white/10" onClick={e => e.stopPropagation()} />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}