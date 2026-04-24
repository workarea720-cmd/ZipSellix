'use server';

import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { randomUUID } from 'crypto';

export const registerUser = async (data: any) => {
    // 👇 Yahan se hum track karenge ke server action call hua ya nahi
    console.log("🚀 SERVER ACTION STARTED! Data received:", data);

    try {
        const { email, password, fullName, whatsapp, storeName, countryCode, } = data;
        const fullWhatsapp = `${countryCode}${whatsapp}`;

        console.log("⏳ Step 1: Checking if user already exists in DB...");
        // 1. Check if user exists
        const existingUser = await prisma.user.findUnique({ where: { email } });

        if (existingUser) {
            console.log("❌ Error: User already exists!");
            // Roman Urdu converted to English
            return { error: "This email is already in use." };
        }

        console.log("✅ Step 2: Hashing password...");
        // 2. 🔐 Password Hashing (Security)
        const hashedPassword = await bcrypt.hash(password, 12);

        console.log("💾 Step 3: Saving user to Database...");
        // 3. Save User
        await prisma.user.create({
            data: {
                name: fullName,
                ownerName: fullName,
                email: email,
                password: hashedPassword,
                whatsapp: fullWhatsapp,
                businessName: storeName,
            },
        });

        console.log("🔑 Step 4: Generating verification token...");
        // 4. Verification Token Generate Karna
        const token = randomUUID();
        const expires = new Date(new Date().getTime() + 3600 * 1000); // 1 Hour

        await prisma.verificationToken.create({
            data: { email, token, expires },
        });

        console.log("🎉 SUCCESS: Account created!");
        // Roman Urdu converted to English
        return { success: "Account created successfully! Welcome." };
    } catch (error) {
        // 👇 Agar Neon database slow hua ya masla aya toh yahan lal rang ka error aayega
        console.error("🚨 SIGNUP ERROR CAUGHT:", error);
        // Roman Urdu converted to English
        return { error: "Something went wrong. Please try again." };
    }
};