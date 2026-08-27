import { Injectable, BadRequestException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class StorageService {
  private bucketName = process.env.R2_BUCKET_NAME || 'cms-eisd';
  private accountId = process.env.CLOUDFLARE_ACCOUNT_ID || '';
  private accessKeyId = process.env.R2_ACCESS_KEY_ID || '';
  private secretAccessKey = process.env.R2_SECRET_ACCESS_KEY || '';

  async uploadImage(file: Express.Multer.File): Promise<string> {
    this.validateFile(file);
    
    const key = `uploads/${uuidv4()}-${file.originalname}`;
    
    // TODO: Implement actual R2 upload using AWS SDK S3 compatible API
    // For now, return a placeholder URL
    return `https://${this.bucketName}.${this.accountId}.r2.cloudflarestorage.com/${key}`;
  }

  async deleteImage(url: string): Promise<void> {
    // TODO: Implement actual R2 deletion
    console.log(`Would delete: ${url}`);
  }

  private validateFile(file: Express.Multer.File): void {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

    if (!file) {
      throw new BadRequestException('No file provided');
    }

    if (file.size > maxSize) {
      throw new BadRequestException('File size exceeds 10MB limit');
    }

    if (!allowedTypes.includes(file.mimetype)) {
      throw new BadRequestException('Invalid file type. Allowed: JPEG, PNG, WebP, GIF');
    }
  }
}
