import { IsString, IsDateString, IsArray, IsOptional, MinLength } from 'class-validator';

export class CreateEventDto {
  @IsString()
  @MinLength(1)
  title: string;

  @IsString()
  @MinLength(1)
  previewDescription: string;

  @IsString()
  @MinLength(1)
  content: string;

  @IsString()
  coverImage: string;

  @IsString()
  headerImage: string;

  @IsArray()
  @IsOptional()
  galleryImages?: string[];

  @IsString()
  @MinLength(1)
  location: string;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;
}

export class UpdateEventDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  previewDescription?: string;

  @IsString()
  @IsOptional()
  content?: string;

  @IsString()
  @IsOptional()
  coverImage?: string;

  @IsString()
  @IsOptional()
  headerImage?: string;

  @IsArray()
  @IsOptional()
  galleryImages?: string[];

  @IsString()
  @IsOptional()
  location?: string;

  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;
}
