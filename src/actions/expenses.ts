'use server';

import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { revalidatePath } from 'next/cache';

export async function getExpenses() {
    try {
        const session = await auth();
        if (!session?.user?.id) return { success: false, error: 'Unauthorized' };

        const expenses = await prisma.expense.findMany({
            where: { userId: session.user.id },
            orderBy: { date: 'desc' }
        });

        return { success: true, expenses };
    } catch (e) {
        return { success: false, error: 'Failed to fetch expenses' };
    }
}

export async function createExpense(payload: { title: string, amount: number }) {
    try {
        const session = await auth();
        if (!session?.user?.id) return { success: false, error: 'Unauthorized' };

        const expenseData: Prisma.ExpenseCreateInput = {
            user: { connect: { id: session.user.id } },
            title: payload.title,
            amount: payload.amount
        };

        const expense = await prisma.expense.create({
            data: expenseData
        });

        revalidatePath('/dashboard');
        return { success: true, expense };
    } catch (e) {
        return { success: false, error: 'Failed to create expense' };
    }
}

export async function deleteExpense(expenseId: string) {
    try {
        const session = await auth();
        if (!session?.user?.id) return { success: false, error: 'Unauthorized' };

        await prisma.expense.delete({
            where: { id: expenseId, userId: session.user.id }
        });

        revalidatePath('/dashboard');
        return { success: true };
    } catch (e) {
        return { success: false, error: 'Failed to delete expense' };
    }
}
