import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  Body,
  Delete,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { StorageService } from './storage.service';

@Controller('api/storage')
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  @Post('test-upload')
  @UseInterceptors(FileInterceptor('file'))
  async testUpload(@UploadedFile() file: Express.Multer.File) {
    const url = await this.storageService.uploadImage(file);
    return { url, key: file.originalname, size: file.size };
  }

  @Delete('test-delete')
  async testDelete(@Body('url') url: string) {
    await this.storageService.deleteImage(url);
    return { deleted: true, url };
  }
}
