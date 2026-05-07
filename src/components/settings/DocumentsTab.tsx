'use client';
// src/components/settings/DocumentsTab.tsx

import React from 'react';
import { FileText } from 'lucide-react';
import { motion } from 'framer-motion';
import { SettingsCard, SaveButton, tabVariants } from '@/components/settings/shared';

export default function DocumentsTab() {
    return (
        <motion.div variants={tabVariants} initial="initial" animate="animate" exit="exit" className="space-y-6">
            <SettingsCard title="Document History" description="All invoices, labels, and slips you've generated.">
                <div className="py-16 bg-gray-50/50 border border-dashed border-[#304250]/20 rounded-2xl flex flex-col items-center justify-center text-center w-full">
                    <FileText size={48} className="text-[#304250]/20 mb-4" />
                    <h4 className="text-lg font-black text-[#304250]">No Documents Yet</h4>
                    <p className="text-sm text-[#304250]/60 mt-2 max-w-sm px-4 font-medium">
                        Documents you generate using the tools will automatically appear here in your history log.
                    </p>
                </div>
            </SettingsCard>
        </motion.div>
    );
}
