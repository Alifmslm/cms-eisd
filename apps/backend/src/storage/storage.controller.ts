import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { StorageService } from './storage.service';
import { AuthenticatedGuard } from '../auth/authenticated.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

@ApiTags('Storage')
@Controller('api/storage')
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  @Post('upload')
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard, RolesGuard)
  @Roles('admin')
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 10 * 1024 * 1024 } }))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary', description: 'Image file (JPEG, PNG, WebP, GIF, max 10MB)' },
      },
    },
  })
  @ApiOperation({ summary: 'Upload image to R2 storage (admin only)' })
  @ApiResponse({ status: 201, description: 'Image uploaded, returns public URL' })
  @ApiResponse({ status: 400, description: 'Invalid file type or size exceeds 10MB' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async upload(@UploadedFile() file: Express.Multer.File) {
    const url = await this.storageService.uploadImage(file);
    return { url };
  }
}
