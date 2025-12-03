import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

class S3Service {
    private s3Client: S3Client | null = null;
    private bucketName: string = '';

    constructor() {
        if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY && process.env.AWS_REGION && process.env.AWS_BUCKET_NAME) {
            this.s3Client = new S3Client({
                region: process.env.AWS_REGION,
                credentials: {
                    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
                    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
                }
            });
            this.bucketName = process.env.AWS_BUCKET_NAME;
            console.log('S3Service: Initialized');
        } else {
            console.log('S3Service: AWS credentials missing, S3 disabled');
        }
    }

    async uploadFile(file: Express.Multer.File): Promise<string> {
        if (!this.s3Client) {
            throw new Error('S3Service not initialized');
        }

        const fileExtension = path.extname(file.originalname);
        const key = `uploads/${uuidv4()}${fileExtension}`;

        const command = new PutObjectCommand({
            Bucket: this.bucketName,
            Key: key,
            Body: file.buffer,
            ContentType: file.mimetype,
            // ACL: 'public-read' // Depending on bucket settings, might not be needed if using CloudFront or public bucket policy
        });

        await this.s3Client.send(command);

        // Return the public URL (assuming standard S3 public access or CloudFront)
        // For production, you'd likely use a CloudFront URL
        return `https://${this.bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
    }
}

export const s3Service = new S3Service();
