// src/app/api/compress/route.ts
import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';

// Vercel/Next.js default body limit is small (4MB). 
// For a real 100MB upload, you'd typically use S3 presigned URLs. 
// For this SaaS engine, we assume a custom Node server or increased limit config.

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get('file') as Blob;
        const settings = JSON.parse(formData.get('settings') as string);
        const isPro = formData.get('isPro') === 'true';

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        // --- 1. ENFORCE LIMITS ---
        const buffer = Buffer.from(await file.arrayBuffer());
        const fileSizeMB = buffer.length / (1024 * 1024);

        if (!isPro) {
            if (fileSizeMB > 2) return NextResponse.json({ error: 'Free limit: 2MB max' }, { status: 403 });
            if (!['image/jpeg', 'image/png'].includes(file.type)) return NextResponse.json({ error: 'Free plan: JPG/PNG only' }, { status: 403 });
        } else {
            if (fileSizeMB > 100) return NextResponse.json({ error: 'Pro limit: 100MB max' }, { status: 403 });
        }

        // --- 2. INITIALIZE SHARP ---
        let pipeline = sharp(buffer);
        const metadata = await pipeline.metadata();

        // --- 3. RESIZE LOGIC ---
        if (settings.resizeMode !== 'original') {
            let width, height;

            // Platform Presets
            if (settings.resizeMode === 'daraz') { width = 1200; height = 1200; } // Square standard
            else if (settings.resizeMode === 'shopify') { width = 2048; height = 2048; }
            else if (settings.resizeMode === 'custom') {
                width = settings.width ? parseInt(settings.width) : undefined;
                height = settings.height ? parseInt(settings.height) : undefined;
            }

            if (width || height) {
                pipeline = pipeline.resize({
                    width,
                    height,
                    fit: settings.fit || 'inside', // 'inside' maintains aspect ratio
                    withoutEnlargement: true
                });
            }
        }

        // --- 4. FORMAT & COMPRESSION ---
        let format = settings.format === 'original' ? metadata.format : settings.format;
        const quality = isPro ? parseInt(settings.quality) : 75; // Free locked to 75%

        // WebP Auto Conversion (Pro Feature)
        if (settings.autoWebP && isPro) {
            format = 'webp';
        }

        // Apply Compression settings
        if (format === 'jpeg' || format === 'jpg') {
            pipeline = pipeline.jpeg({ quality, mozjpeg: true });
        } else if (format === 'png') {
            pipeline = pipeline.png({ quality: isPro ? quality : 80, compressionLevel: 8 });
        } else if (format === 'webp') {
            pipeline = pipeline.webp({ quality });
        } else if (format === 'avif' && isPro) {
            pipeline = pipeline.avif({ quality });
        }

        // --- 5. EXECUTE ---
        const processedBuffer = await pipeline.toBuffer();
        const info = await sharp(processedBuffer).metadata();

        // Return as Base64 for immediate client display (SaaS style)
        // In production with huge files, upload processedBuffer to S3 and return URL.
        const base64 = `data:image/${format};base64,${processedBuffer.toString('base64')}`;

        return NextResponse.json({
            success: true,
            data: {
                image: base64,
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