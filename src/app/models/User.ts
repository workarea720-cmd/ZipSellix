// src/models/User.ts
import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    plan: { type: String, enum: ['free', 'pro'], default: 'free' },
    monthlyUsage: { type: Number, default: 0 },
    lastReset: { type: Date, default: Date.now },
});

// Prevent overwrite error in Next.js hot reloading
export default mongoose.models.User || mongoose.model('User', UserSchema);