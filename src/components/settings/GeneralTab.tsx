'use client';
// src/components/settings/GeneralTab.tsx

import React, { useState, useEffect } from 'react';
import { User, Lock, AlertTriangle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { useSession, signOut } from 'next-auth/react';
import { useBusinessStore } from '@/store/business-store';
import { SettingsCard, SaveButton, tabVariants } from '@/components/settings/shared';

const passwordSchema = z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(8, 'Please confirm your password'),
}).refine(data => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
});

type PasswordForm = z.infer<typeof passwordSchema>;

export default function GeneralTab() {
    const store = useBusinessStore();
    const { data: session } = useSession();
    const [saving, setSaving] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [confirmText, setConfirmText] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);
    const [pwdSaving, setPwdSaving] = useState(false);
    const [showPwdForm, setShowPwdForm] = useState(false);

    const { register, handleSubmit, reset, formState: { isDirty } } = useForm({
        defaultValues: { name: store.account.name, email: session?.user?.email || store.account.email },
    });
    useEffect(() => {
        reset({ name: store.account.name, email: session?.user?.email || store.account.email });
    }, [store.account, session]);

    const { register: registerPwd, handleSubmit: handlePwdSubmit, formState: { errors: pwdErrors }, reset: resetPwd } = useForm<PasswordForm>({
        resolver: zodResolver(passwordSchema),
    });

    const onSave = handleSubmit(async (data) => {
        setSaving(true);
        store.setAccount(data);
        await new Promise(r => setTimeout(r, 600));
        setSaving(false);
        toast.success('Account updated successfully');
    });

    const onPwdSubmit = async (data: PasswordForm) => {
        setPwdSaving(true);
        try {
            const response = await fetch('/api/auth/change-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ currentPassword: data.currentPassword, newPassword: data.newPassword }),
            });
            const result = await response.json();
            if (response.ok) {
                toast.success('Password updated successfully!');
                resetPwd();
                setShowPwdForm(false);
            } else {
                toast.error(result.error || 'Failed to update password');
            }
        } catch {
            toast.error('An error occurred');
        } finally {
            setPwdSaving(false);
        }
    };

    const handleDeleteAccount = async () => {
        if (confirmText !== 'DELETE') return;
        setIsDeleting(true);
        try {
            const response = await fetch('/api/auth/delete-account', { method: 'DELETE' });
            if (response.ok) {
                await signOut({ callbackUrl: '/login' });
            } else {
                toast.error('Failed to delete account');
                setIsDeleting(false);
            }
        } catch {
            toast.error('An error occurred');
            setIsDeleting(false);
        }
    };

    return (
        <motion.div variants={tabVariants} initial="initial" animate="animate" exit="exit" className="space-y-6">
            {/* Personal Info Card */}
            <SettingsCard title="Personal Information" description="Your profile details."
                footer={<SaveButton onClick={onSave} saving={saving} disabled={!isDirty} />}>
                <div className="space-y-5 max-w-md w-full">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-5">
                        <label className="group relative cursor-pointer w-20 h-20 rounded-full bg-gray-50 border-2 border-dashed border-[#304250]/20 flex items-center justify-center overflow-hidden hover:border-[#20A46B] transition-all duration-300 mx-auto sm:mx-0 shrink-0">
                            <input type="file" accept="image/*" className="hidden" onChange={e => {
                                const file = e.target.files?.[0];
                                if (file) { const r = new FileReader(); r.onloadend = () => store.setAccount({ avatar: r.result as string }); r.readAsDataURL(file); }
                            }} />
                            {store.account.avatar
                                ? <img src={store.account.avatar} alt="Avatar" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                : <User size={28} className="text-[#304250]/30 group-hover:scale-110 transition-transform duration-300 group-hover:text-[#20A46B]" />
                            }
                        </label>
                        <div className="text-center sm:text-left">
                            <p className="text-sm font-bold text-[#304250]">Profile Photo</p>
                            <p className="text-xs text-[#304250]/50 mt-0.5 font-medium">Click to upload. JPG, PNG.</p>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-[#304250]/70 uppercase tracking-wider">Full Name</label>
                        <input {...register('name')} placeholder="Ali Khan" className="w-full px-4 py-3 sm:py-2.5 bg-gray-50/50 border border-[#304250]/10 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-[#20A46B]/20 focus:border-[#20A46B] hover:bg-gray-50 transition-all duration-200 text-[#304250]" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-[#304250]/70 uppercase tracking-wider">Email Address</label>
                        <input {...register('email')} type="email" placeholder="you@example.com" className="w-full px-4 py-3 sm:py-2.5 bg-[#304250]/5 border border-[#304250]/10 rounded-xl text-sm font-medium outline-none text-[#304250]/50 cursor-not-allowed transition-all duration-200" readOnly disabled />
                        <p className="text-[10px] font-bold text-[#EEBE1C] flex items-center gap-1 mt-1"><Lock size={10} /> Email cannot be changed.</p>
                    </div>
                </div>
            </SettingsCard>

            {/* Security Card */}
            <SettingsCard title="Security" description="Manage authentication and account safety.">
                {!showPwdForm ? (
                    <button onClick={() => setShowPwdForm(true)} className="w-full sm:w-auto flex items-center justify-center sm:justify-start gap-2 px-5 py-3 bg-white text-[#304250] border border-[#304250]/10 rounded-xl text-sm font-bold hover:bg-gray-50 hover:border-[#304250]/30 transition-all duration-200 active:scale-95 shadow-sm">
                        <Lock size={16} className="text-[#304250]/40" /> Change Password
                    </button>
                ) : (
                    <motion.form initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} onSubmit={handlePwdSubmit(onPwdSubmit)} className="space-y-5 max-w-md mt-2 w-full">
                        {[
                            { key: 'currentPassword' as const, label: 'Current Password' },
                            { key: 'newPassword' as const, label: 'New Password' },
                            { key: 'confirmPassword' as const, label: 'Confirm Password' },
                        ].map(({ key, label }) => (
                            <div key={key} className="space-y-2">
                                <label className="text-xs font-bold text-[#304250]/70 uppercase tracking-wider">{label}</label>
                                <input type="password" {...registerPwd(key)} className="w-full px-4 py-3 sm:py-2.5 bg-gray-50/50 border border-[#304250]/10 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-[#20A46B]/20 focus:border-[#20A46B] transition-all duration-200 text-[#304250]" />
                                {pwdErrors[key] && <p className="text-[10px] font-bold text-red-500 mt-1">{pwdErrors[key]?.message}</p>}
                            </div>
                        ))}
                        <div className="flex flex-col sm:flex-row items-center gap-3 pt-3 w-full">
                            <SaveButton saving={pwdSaving} title="Update Password" />
                            <button type="button" onClick={() => { setShowPwdForm(false); resetPwd(); }} className="w-full sm:w-auto px-5 py-3 sm:py-2.5 text-sm font-bold text-[#304250]/60 hover:text-[#304250] bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors active:scale-95 border border-transparent">
                                Cancel
                            </button>
                        </div>
                    </motion.form>
                )}
            </SettingsCard>

            {/* Danger Zone */}
            <SettingsCard title="Danger Zone" description="Permanently delete your account and all associated data." danger>
                <button type="button" onClick={() => setShowDeleteModal(true)} className="w-full sm:w-auto px-5 py-3 bg-red-50 text-red-600 border border-red-200 rounded-xl text-sm font-bold hover:bg-red-600 hover:text-white transition-colors active:scale-95 shadow-sm">
                    Delete Account
                </button>
            </SettingsCard>

            {/* Delete Confirmation Modal */}
            <AnimatePresence>
                {showDeleteModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#304250]/40 backdrop-blur-sm">
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-[#304250]/10">
                            <div className="p-6">
                                <div className="flex items-center gap-3 text-red-600 mb-4">
                                    <div className="p-3 bg-red-50 rounded-full"><AlertTriangle size={24} /></div>
                                    <h3 className="text-lg font-black">Delete Account</h3>
                                </div>
                                <p className="text-sm font-medium text-[#304250]/70 mb-4">
                                    This action cannot be undone. This will permanently delete your account, business data, and remove all your information from our servers.
                                </p>
                                <div className="space-y-2 mb-6">
                                    <label className="text-xs font-bold text-[#304250]/70 uppercase tracking-wider">
                                        Type <span className="text-red-600 font-black">DELETE</span> to confirm
                                    </label>
                                    <input type="text" value={confirmText} onChange={(e) => setConfirmText(e.target.value)} placeholder="DELETE"
                                        className="w-full px-4 py-3 bg-gray-50/50 border border-[#304250]/10 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all text-[#304250]" />
                                </div>
                                <div className="flex flex-col sm:flex-row gap-3">
                                    <button type="button" onClick={() => { setShowDeleteModal(false); setConfirmText(''); }} className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-[#304250] rounded-xl text-sm font-bold transition-colors">
                                        Cancel
                                    </button>
                                    <button type="button" onClick={handleDeleteAccount} disabled={confirmText !== 'DELETE' || isDeleting}
                                        className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:hover:bg-red-600 text-white rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2">
                                        {isDeleting ? <><Loader2 size={16} className="animate-spin" /> Deleting...</> : 'Delete Account'}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
