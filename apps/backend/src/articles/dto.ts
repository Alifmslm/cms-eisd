import { IsUrl, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateArticleDto {
  @ApiProperty({ example: 'https://medium.com/@user/my-article-abc123' })
  @IsUrl()
  url: string;
}

export class UpdateArticleDto {
  @ApiPropertyOptional({ example: 'https://medium.com/@user/updated-article-xyz789' })
  @IsUrl()
  @IsOptional()
  url?: string;
}
