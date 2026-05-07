import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';
import path from 'path';
import { writeFile, mkdir } from 'fs/promises';
import { auth } from '@/auth';
import { checkAndIncrement } from '@/lib/usageLimit';

export async function POST(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Login karo pehle' }, { status: 401 });
        }

        const isPro = session.user.planType?.toUpperCase() === 'PRO';

        // --- FREE TIER LIMIT CHECK (5/day) ---
        if (!isPro) {
            const check = await checkAndIncrement(session.user.id, 'compressionsToday');
            if (!check.allowed) {
                return NextResponse.json(
                    { error: check.reason, limitReached: true },
                    { status: 403 }
                );
            }
        }

        const formData = await req.formData();
        const file = formData.get('file') as Blob;
        const settings = JSON.parse(formData.get('settings') as string);

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const fileSizeMB = buffer.length / (1024 * 1024);

        if (!isPro) {
            if (fileSizeMB > 2) return NextResponse.json({ error: 'Free limit: 2MB max' }, { status: 403 });
            if (!['image/jpeg', 'image/png'].includes(file.type)) return NextResponse.json({ error: 'Free plan: JPG/PNG only' }, { status: 403 });
        } else {
            if (fileSizeMB > 100) return NextResponse.json({ error: 'Pro limit: 100MB max' }, { status: 403 });
        }

        let pipeline = sharp(buffer);
        const metadata = await pipeline.metadata();

        if (settings.resizeMode !== 'original') {
            let width, height;
            if (settings.resizeMode === 'daraz') { width = 1200; height = 1200; }
            else if (settings.resizeMode === 'shopify') { width = 2048; height = 2048; }
            else if (settings.resizeMode === 'custom') {
                width = settings.width ? parseInt(settings.width) : undefined;
                height = settings.height ? parseInt(settings.height) : undefined;
            }
            if (width || height) {
                pipeline = pipeline.resize({ width, height, fit: settings.fit || 'inside', withoutEnlargement: true });
            }
        }

        let format = settings.format === 'original' ? metadata.format : settings.format;
        const quality = isPro ? parseInt(settings.quality) : 75;

        if (settings.autoWebP && isPro) format = 'webp';

        if (format === 'jpeg' || format === 'jpg') {
            pipeline = pipeline.jpeg({ quality, mozjpeg: true });
        } else if (format === 'png') {
            pipeline = pipeline.png({ quality: isPro ? quality : 80, compressionLevel: 8 });
        } else if (format === 'webp') {
            pipeline = pipeline.webp({ quality });
        } else if (format === 'avif' && isPro) {
            pipeline = pipeline.avif({ quality });
        }

        const processedBuffer = await pipeline.toBuffer();
        const info = await sharp(processedBuffer).metadata();

        // ── Save to disk, return URL (not base64)
        const filename = `compressed-${Date.now()}-${Math.random().toString(36).slice(2)}.${format}`;
        const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'temp');
        await mkdir(uploadDir, { recursive: true });
        await writeFile(path.join(uploadDir, filename), processedBuffer);
        const url = `/uploads/temp/${filename}`;

        return NextResponse.json({
            success: true,
            data: {
                url,                            // ← URL instead of base64
                originalSize: buffer.length,
                compressedSize: processedBuffer.length,
                width: info.width,
                height: info.height,
                format: format
            }
        });

    } catch (error: any) {
        console.error('Compression Error:', error);
        return NextResponse.json({ error: 'Processing failed' }, { status: 500 });
    }
}