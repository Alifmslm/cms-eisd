import { IsString, IsDateString, IsArray, IsOptional, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateEventDto {
  @ApiProperty({ example: 'Annual Meeting 2026' })
  @IsString()
  @MinLength(1)
  title: string;

  @ApiProperty({ example: 'A brief description of the event' })
  @IsString()
  @MinLength(1)
  previewDescription: string;

  @ApiProperty({ example: 'Full event content in HTML or markdown' })
  @IsString()
  @MinLength(1)
  content: string;

  @ApiProperty({ example: 'https://pub-820865ee2a824383b804a45cdca912a2.r2.dev/uploads/cover.png' })
  @IsString()
  coverImage: string;

  @ApiProperty({ example: 'https://pub-820865ee2a824383b804a45cdca912a2.r2.dev/uploads/header.png' })
  @IsString()
  headerImage: string;

  @ApiPropertyOptional({ example: ['https://example.com/img1.png', 'https://example.com/img2.png'] })
  @IsArray()
  @IsOptional()
  galleryImages?: string[];

  @ApiProperty({ example: 'Jakarta Convention Center' })
  @IsString()
  @MinLength(1)
  location: string;

  @ApiProperty({ example: '2026-09-15T09:00:00.000Z' })
  @IsDateString()
  startDate: string;

  @ApiProperty({ example: '2026-09-17T17:00:00.000Z' })
  @IsDateString()
  endDate: string;
}

export class UpdateEventDto {
  @ApiPropertyOptional({ example: 'Updated Event Title' })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({ example: 'Updated description' })
  @IsString()
  @IsOptional()
  previewDescription?: string;

  @ApiPropertyOptional({ example: 'Updated content' })
  @IsString()
  @IsOptional()
  content?: string;

  @ApiPropertyOptional({ example: 'https://example.com/new-cover.png' })
  @IsString()
  @IsOptional()
  coverImage?: string;

  @ApiPropertyOptional({ example: 'https://example.com/new-header.png' })
  @IsString()
  @IsOptional()
  headerImage?: string;

  @ApiPropertyOptional({ example: ['https://example.com/img3.png'] })
  @IsArray()
  @IsOptional()
  galleryImages?: string[];

  @ApiPropertyOptional({ example: 'Updated Location' })
  @IsString()
  @IsOptional()
  location?: string;

  @ApiPropertyOptional({ example: '2026-10-01T09:00:00.000Z' })
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @ApiPropertyOptional({ example: '2026-10-03T17:00:00.000Z' })
  @IsDateString()
  @IsOptional()
  endDate?: string;
}
