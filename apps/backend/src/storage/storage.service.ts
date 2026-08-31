import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

@Injectable()
export class StorageService {
  private s3Client: S3Client;
  private bucketName: string;
  private publicUrl: string;

  constructor() {
    this.bucketName = process.env.R2_BUCKET_NAME || 'cms-eisd';
    this.publicUrl = process.env.R2_PUBLIC_URL || '';

    this.s3Client = new S3Client({
      region: 'auto',
      endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
      },
    });
  }

  async uploadImage(file: Express.Multer.File): Promise<string> {
    this.validateFile(file);

    const key = `uploads/${uuidv4()}-${file.originalname}`;

    try {
      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: this.bucketName,
          Key: key,
          Body: file.buffer,
          ContentType: file.mimetype,
        }),
      );

      return `${this.publicUrl}/${key}`;
    } catch (error) {
      throw new InternalServerErrorException('Failed to upload image to R2');
    }
  }

  async deleteImage(url: string): Promise<void> {
    const key = this.extractKeyFromUrl(url);
    if (!key) return;

    try {
      await this.s3Client.send(
        new DeleteObjectCommand({
          Bucket: this.bucketName,
          Key: key,
        }),
      );
    } catch (error) {
      console.error('Failed to delete image from R2:', error);
    }
  }

  async deleteImages(urls: string[]): Promise<void> {
    for (const url of urls) {
      await this.deleteImage(url);
    }
  }

  private extractKeyFromUrl(url: string): string | null {
    if (!this.publicUrl || !url.startsWith(this.publicUrl)) return null;
    return url.slice(this.publicUrl.length + 1);
  }

  private validateFile(file: Express.Multer.File): void {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    if (file.size > MAX_FILE_SIZE) {
      throw new BadRequestException('File size exceeds 10MB limit');
    }

    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      throw new BadRequestException('Invalid file type. Allowed: JPEG, PNG, WebP, GIF');
    }
  }
}
