import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Request } from 'express';

// Create uploads directory if it doesn't exist
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer storage
const storage = multer.diskStorage({
    destination: (req: Request, file, cb) => {
        // Organize by hotel: uploads/hotels/{hotelId}/{category}/
        const hotelId = req.params.hotelId || 'temp';
        const category = req.body.category || 'general';
        const destPath = path.join(uploadDir, 'hotels', hotelId, category);

        // Create directory if it doesn't exist
        if (!fs.existsSync(destPath)) {
            fs.mkdirSync(destPath, { recursive: true });
        }

        cb(null, destPath);
    },
    filename: (req, file, cb) => {
        // Generate unique filename: timestamp-originalname
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        const basename = path.basename(file.originalname, ext);
        cb(null, `${basename}-${uniqueSuffix}${ext}`);
    }
});

// File filter - accept only images and PDFs
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const allowedMimes = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/webp',
        'application/pdf'
    ];

    if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only JPEG, PNG, WebP, and PDF are allowed.'));
    }
};

// Create multer upload middleware
export const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
    }
});

/**
 * Get public URL for uploaded file
 */
export function getFileUrl(filePath: string): string {
    // For local storage, return relative path
    // In production with S3, this would return the S3 URL
    const relativePath = filePath.replace(uploadDir, '');
    return `/uploads${relativePath}`;
}

/**
 * Delete file from storage
 */
export async function deleteFile(filePath: string): Promise<void> {
    try {
        const fullPath = filePath.startsWith('/uploads')
            ? path.join(uploadDir, filePath.replace('/uploads', ''))
            : filePath;

        if (fs.existsSync(fullPath)) {
            fs.unlinkSync(fullPath);
        }
    } catch (error) {
        console.error('Error deleting file:', error);
        throw error;
    }
}

// TODO: S3 integration for production
/*
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
});

export async function uploadToS3(file: Express.Multer.File, key: string): Promise<string> {
    const command = new PutObjectCommand({
        Bucket: process.env.S3_BUCKET!,
        Key: key,
        Body: fs.createReadStream(file.path),
        ContentType: file.mimetype,
    });

    await s3Client.send(command);
    
    // Return CloudFront URL or S3 URL
    return `https://${process.env.CLOUDFRONT_DOMAIN}/${key}`;
}

export async function deleteFromS3(key: string): Promise<void> {
    const command = new DeleteObjectCommand({
        Bucket: process.env.S3_BUCKET!,
        Key: key,
    });

    await s3Client.send(command);
}
*/
