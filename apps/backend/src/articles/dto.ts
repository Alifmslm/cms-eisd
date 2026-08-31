import { IsUrl, IsOptional } from 'class-validator';

export class CreateArticleDto {
  @IsUrl()
  url: string;
}

export class UpdateArticleDto {
  @IsUrl()
  @IsOptional()
  url?: string;
}
