'use server';

import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { revalidatePath } from 'next/cache';

// Load User Profile + Settings + Expenses from Prisma
export async function getBusinessProfile() {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, error: 'Unauthorized' };
        }

        const user = await prisma.user.findUnique({
            where: { id: session.user.id }
        });

        if (!user) {
            return { success: false, error: 'User not found' };
        }

        // Map Prisma User Model properties back to Zustand expectation
        return {
            success: true,
            isSetupComplete: user.isSetupComplete,
            profile: {
                ownerName: user.ownerName,
                businessName: user.businessName,
                businessType: user.businessType, // Added businessType here
                city: user.city,
                province: 'Punjab', // You might want to save this to DB later
                settings: {
                    logo: user.image,
                    phone: user.whatsapp,
                    address: null, // You can add to Prisma if needed
                    channels: (user.salesChannels as string[]) || [],
                    monthlyRent: user.monthlyRent,
                    monthlySalary: user.monthlySalaries,
                    monthlyHosting: user.monthlyHosting,
                    monthlyInternet: user.monthlyInternet,
                    packagingCost: user.packagingCost,
                    courierRates: user.courierRates || [] // New Json field in Prisma
                }
            }
        };
    } catch (error) {
        console.error('getBusinessProfile Error:', error);
        return { success: false, error: 'Failed to fetch profile' };
    }
}

// Save Profile directly to Next.js PostgreSQL DB via Prisma
export async function updateBusinessProfile(payload: {
    businessType?: string;
    businessName: string;
    ownerName: string;
    city: string;
    logo?: string;
    phone?: string;
    monthlyRent?: number;
    monthlySalary?: number;
    monthlyHosting?: number;
    monthlyInternet?: number;
    packagingCost?: number;
    businessTypes?: string[];
    courierRates?: any[];
}) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, error: 'Unauthorized' };
        }

        const updateData: Prisma.UserUpdateInput = {
            isSetupComplete: true,
            businessType: payload.businessType, // Saving businessType here
            businessName: payload.businessName,
            ownerName: payload.ownerName,
            city: payload.city,
            image: payload.logo,
            whatsapp: payload.phone,
            monthlyRent: payload.monthlyRent || 0,
            monthlySalaries: payload.monthlySalary || 0,
            monthlyHosting: payload.monthlyHosting || 0,
            monthlyInternet: payload.monthlyInternet || 0,
            packagingCost: payload.packagingCost || 0,
            salesChannels: payload.businessTypes || [],
            courierRates: payload.courierRates || []
        };

        const updatedUser = await prisma.user.update({
            where: { id: session.user.id },
            data: updateData
        });

        revalidatePath('/dashboard');
        revalidatePath('/settings');
        return { success: true, isSetupComplete: true };

    } catch (error) {
        console.error('updateBusinessProfile Error:', error);
        return { success: false, error: 'Failed to update profile' };
    }
}
