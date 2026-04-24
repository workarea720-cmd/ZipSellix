import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import sharp from 'sharp';

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get('file') as File;
        const type = formData.get('type') as string || 'product';

        if (!file) {
            return NextResponse.json({ success: false, error: 'No file uploaded' }, { status: 400 });
        }

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json({ success: false, error: 'Only JPG, PNG, and WebP images are allowed' }, { status: 400 });
        }

        // Validate file size (5MB for products, 3MB for logos)
        const maxSize = type === 'logo' ? 3 * 1024 * 1024 : 5 * 1024 * 1024;
        if (file.size > maxSize) {
            return NextResponse.json({ success: false, error: `File size must be under ${type === 'logo' ? '3' : '5'}MB` }, { status: 400 });
        }

        // Read file into buffer
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Determine upload directory
        const uploadDir = type === 'logo'
            ? path.join(process.cwd(), 'public', 'uploads', 'logos')
            : path.join(process.cwd(), 'public', 'uploads', 'products');

        // Ensure directory exists
        await mkdir(uploadDir, { recursive: true });

        // Generate unique filename
        const timestamp = Date.now();
        const randomStr = Math.random().toString(36).substring(2, 8);
        const outputFilename = `${type}_${timestamp}_${randomStr}.webp`;
        const outputPath = path.join(uploadDir, outputFilename);

        // Compress and convert to WebP using sharp
        let sharpInstance = sharp(buffer);

        if (type === 'logo') {
            // Logo: resize to 400x400, optimize
            sharpInstance = sharpInstance
                .resize(400, 400, { fit: 'cover', position: 'center' })
                .webp({ quality: 85 });
        } else {
            // Product image: resize max 800px, optimize
            sharpInstance = sharpInstance
                .resize(800, 800, { fit: 'inside', withoutEnlargement: true })
                .webp({ quality: 80 });
        }

        await sharpInstance.toFile(outputPath);

        // Return the public URL
        const publicUrl = `/uploads/${type === 'logo' ? 'logos' : 'products'}/${outputFilename}`;

        return NextResponse.json({
            success: true,
            url: publicUrl,
            filename: outputFilename,
        });

    } catch (error) {
        console.error('Image upload error:', error);
        return NextResponse.json({ success: false, error: 'Failed to process image' }, { status: 500 });
    }
}
