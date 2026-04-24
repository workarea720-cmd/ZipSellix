"use client";
import React, { useState, useEffect, useRef } from 'react';
import {
    X, Send, Image as ImageIcon, Video, AlertCircle,
    CheckCircle2, ChevronDown, FileCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { API_URL, safeFetch } from '@/lib/api-client';

/* ── Custom Premium Dropdown ── */
function CustomSelect({ value, onChange, options }: { value: string, onChange: (val: string) => void, options: { value: string, label: string }[] }) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const selectedLabel = options.find(o => o.value === value)?.label || 'Select...';

    return (
        <div className="relative w-full" ref={ref}>
            <button
                type="button"
                onClick={() => setOpen(!open)}
                className="w-full bg-slate-50 border border-transparent hover:bg-slate-100 focus:bg-white focus:border-brand-primary/40 focus:ring-4 ring-brand-primary/10 text-slate-800 py-3 px-4 rounded-xl text-sm font-medium flex items-center justify-between gap-2 transition-all duration-200"
            >
                <span className="truncate">{selectedLabel}</span>
                <ChevronDown size={16} className={`text-slate-400 transition-transform duration-300 ${open ? 'rotate-180 text-brand-primary' : ''}`} />
            </button>

            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.15, ease: "easeOut" }}
                        className="absolute top-full left-0 mt-2 w-full bg-white border border-slate-100 rounded-xl shadow-[0_12px_40px_rgb(0,0,0,0.12)] z-[60] overflow-hidden"
                    >
                        <div className="p-1.5 flex flex-col gap-0.5">
                            {options.map(opt => (
                                <div
                                    key={opt.value}
                                    onClick={() => { onChange(opt.value); setOpen(false); }}
                                    className={`px-3 py-2.5 text-sm font-medium rounded-lg cursor-pointer transition-colors ${value === opt.value ? 'bg-brand-primary/10 text-brand-primary font-bold' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
                                >
                                    {opt.label}
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default function SupportModal({ onClose }: { onClose: () => void }) {
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [formData, setFormData] = useState({
        subject: '',
        description: '',
        issueType: 'Bug'
    });

    // File state
    const [fileBase64, setFileBase64] = useState<string | null>(null);
    const [fileName, setFileName] = useState<string>("");

    const MAX_FILE_SIZE_MB = 5; // 5MB Limit

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // 👇 Check File Size
            if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
                alert(`File is too large! Please select a file under ${MAX_FILE_SIZE_MB}MB.`);
                e.target.value = "";
                return;
            }

            setFileName(file.name);
            const reader = new FileReader();
            reader.onloadend = () => setFileBase64(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const removeFile = (e: React.MouseEvent) => {
        e.preventDefault();
        setFileBase64(null);
        setFileName("");
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.subject || !formData.description) return alert("Please fill all required fields.");

        setSubmitting(true);
        try {
            const res = await safeFetch<any>(`${API_URL}/api/support/tickets`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    attachment: fileBase64,
                    date: new Date().toISOString()
                })
            });
            if (res.success) setSuccess(true);
        } catch (err) {
            alert("Failed to submit issue. Please check your connection.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6 bg-slate-900/40 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                // 👇 FIX: flex-col aur max-h-[90vh] ensures the modal doesn't stretch beyond screen
                className="bg-white w-full max-w-[520px] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
                <AnimatePresence mode="wait">
                    {success ? (
                        <motion.div
                            key="success"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="p-10 text-center flex flex-col items-center justify-center h-full my-8"
                        >
                            <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mb-6 relative">
                                <motion.div
                                    initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.2 }}
                                >
                                    <CheckCircle2 size={40} />
                                </motion.div>
                                <span className="absolute inset-0 rounded-full border-4 border-emerald-100 animate-ping opacity-50"></span>
                            </div>
                            <h3 className="text-2xl font-extrabold text-slate-800 mb-2 tracking-tight">Report Submitted!</h3>
                            <p className="text-slate-500 text-sm mb-8 leading-relaxed max-w-[280px]">
                                Thank you for your feedback. Our support team will review this and resolve it shortly.
                            </p>
                            <button
                                onClick={onClose}
                                className="w-full py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-colors active:scale-[0.98]"
                            >
                                Close Window
                            </button>
                        </motion.div>
                    ) : (
                        <motion.div key="form" className="flex flex-col min-h-0 w-full h-full">

                            {/* Header - Fixed */}
                            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-white shrink-0">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center">
                                        <AlertCircle size={16} strokeWidth={2.5} />
                                    </div>
                                    <h3 className="text-[17px] font-bold text-slate-800 tracking-tight">Report an Issue</h3>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 rounded-full transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Form Body - 👇 FIX: Scrollable Area (overflow-y-auto min-h-0 flex-1) */}
                            <form id="support-form" onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto min-h-0 flex-1 custom-scrollbar">

                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1">Issue Type</label>
                                    <CustomSelect
                                        value={formData.issueType}
                                        onChange={(v) => setFormData({ ...formData, issueType: v })}
                                        options={[
                                            { value: 'Bug', label: 'Bug or Glitch' },
                                            { value: 'Calculation', label: 'Calculation Error' },
                                            { value: 'UI/UX', label: 'Design / Layout Issue' },
                                            { value: 'Feature', label: 'Feature Request' },
                                            { value: 'Other', label: 'Other Issue' }
                                        ]}
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1">Subject</label>
                                    <input
                                        className="w-full bg-slate-50 border border-transparent hover:bg-slate-100 focus:bg-white focus:border-brand-primary/40 focus:ring-4 ring-brand-primary/10 rounded-xl p-3.5 text-sm font-medium text-slate-800 outline-none transition-all duration-200 placeholder:text-slate-400 placeholder:font-normal"
                                        placeholder="Briefly describe what happened..."
                                        value={formData.subject}
                                        onChange={e => setFormData({ ...formData, subject: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1">Detailed Description</label>
                                    <textarea
                                        className="w-full bg-slate-50 border border-transparent hover:bg-slate-100 focus:bg-white focus:border-brand-primary/40 focus:ring-4 ring-brand-primary/10 rounded-xl p-3.5 text-sm font-medium text-slate-800 h-32 resize-none outline-none transition-all duration-200 placeholder:text-slate-400 placeholder:font-normal leading-relaxed"
                                        placeholder="Please provide as much detail as possible to help us understand the issue..."
                                        value={formData.description}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-1.5 pb-2">
                                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1">Attachments (Optional)</label>

                                    {!fileBase64 ? (
                                        <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-slate-200 hover:border-brand-primary/40 hover:bg-brand-primary/5 rounded-2xl cursor-pointer transition-colors group">
                                            <div className="flex gap-3 text-slate-300 group-hover:text-brand-primary transition-colors mb-2">
                                                <ImageIcon size={22} /> <Video size={22} />
                                            </div>
                                            <p className="text-sm font-medium text-slate-600 group-hover:text-brand-primary transition-colors">
                                                Click to upload media
                                            </p>
                                            <p className="text-xs text-slate-400 mt-1">PNG, JPG or MP4 (Max {MAX_FILE_SIZE_MB}MB)</p>
                                            <input type="file" className="hidden" accept="image/*,video/*" onChange={handleFileChange} />
                                        </label>
                                    ) : (
                                        <div className="flex items-center justify-between bg-emerald-50 border border-emerald-100 p-4 rounded-2xl">
                                            <div className="flex items-center gap-3 overflow-hidden">
                                                <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                                                    <FileCheck size={18} />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-bold text-emerald-800 truncate">{fileName}</p>
                                                    <p className="text-xs text-emerald-600/70 font-medium">Ready to upload</p>
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={removeFile}
                                                className="p-2 text-emerald-600 hover:bg-emerald-100 rounded-full transition-colors shrink-0"
                                            >
                                                <X size={16} />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </form>

                            {/* Footer Action - Fixed */}
                            <div className="px-6 py-4 border-t border-slate-100 bg-white shrink-0">
                                <button
                                    type="submit"
                                    form="support-form" // Binds the button outside the form to the form itself
                                    disabled={submitting}
                                    className="w-full py-3.5 bg-brand-primary hover:bg-[#1a8c5b] text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all duration-200 active:scale-[0.98] disabled:opacity-70 shadow-[0_4px_14px_0_rgba(32,164,107,0.3)]"
                                >
                                    {submitting ? (
                                        <span className="flex items-center gap-2">
                                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                            Sending...
                                        </span>
                                    ) : (
                                        <><Send size={18} /> Submit Report</>
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
}