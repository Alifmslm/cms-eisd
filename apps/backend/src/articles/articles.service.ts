import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateArticleDto, UpdateArticleDto } from './dto';
import ogs from 'open-graph-scraper';

@Injectable()
export class ArticlesService {
  constructor(private prisma: PrismaService) {}

  private async fetchMetadata(url: string) {
    try {
      const result = await ogs({
        url,
        fetchOptions: {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          },
        },
      });

      if (result.error) {
        throw new Error(result.result.error || 'The URL is unreachable or returned no content');
      }

      const ogImage = result.result.ogImage as any;
      let coverImage = '';
      if (ogImage) {
        if (Array.isArray(ogImage)) {
          coverImage = ogImage[0]?.url || '';
        } else if (typeof ogImage === 'object' && 'url' in ogImage) {
          coverImage = ogImage.url || '';
        } else if (typeof ogImage === 'string') {
          coverImage = ogImage;
        }
      }

      const title = result.result.ogTitle?.trim() || '';
      const description = result.result.ogDescription?.trim() || '';

      if (!title) {
        throw new Error('Could not fetch Open Graph metadata from the provided URL');
      }

      const dateStr = result.result.ogDate || (result.result as any).articlePublishedTime || '';
      const publishedDate = dateStr ? new Date(dateStr) : new Date();

      return {
        title,
        description,
        coverImage,
        publishedDate,
      };
    } catch (error) {
      throw new BadRequestException(`Failed to fetch metadata from URL: ${error.message}`);
    }
  }

  async create(createArticleDto: CreateArticleDto) {
    const metadata = await this.fetchMetadata(createArticleDto.url);
    
    return this.prisma.mediumArticle.create({
      data: {
        url: createArticleDto.url,
        title: metadata.title,
        description: metadata.description,
        coverImage: metadata.coverImage,
        publishedDate: metadata.publishedDate,
      },
    });
  }

  async findAll() {
    return this.prisma.mediumArticle.findMany({
      orderBy: { updatedAt: 'desc' },
    });
  }

  async findPublished() {
    return this.prisma.mediumArticle.findMany({
      where: { publishedAt: { not: null } },
      orderBy: { publishedDate: 'desc' },
    });
  }

  async findById(id: string) {
    const article = await this.prisma.mediumArticle.findUnique({ where: { id } });
    if (!article) {
      throw new NotFoundException(`Article with id "${id}" not found`);
    }
    return article;
  }

  async update(id: string, updateArticleDto: UpdateArticleDto) {
    const existing = await this.prisma.mediumArticle.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Article with id "${id}" not found`);
    }

    let metadata = {};
    if (updateArticleDto.url && updateArticleDto.url !== existing.url) {
      metadata = await this.fetchMetadata(updateArticleDto.url);
    }

    return this.prisma.mediumArticle.update({
      where: { id },
      data: {
        ...updateArticleDto,
        ...metadata,
      },
    });
  }

  async publish(id: string) {
    const existing = await this.prisma.mediumArticle.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Article with id "${id}" not found`);
    }

    return this.prisma.mediumArticle.update({
      where: { id },
      data: { publishedAt: new Date() },
    });
  }

  async unpublish(id: string) {
    const existing = await this.prisma.mediumArticle.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Article with id "${id}" not found`);
    }

    return this.prisma.mediumArticle.update({
      where: { id },
      data: { publishedAt: null },
    });
  }

  async remove(id: string) {
    const existing = await this.prisma.mediumArticle.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Article with id "${id}" not found`);
    }

    return this.prisma.mediumArticle.delete({ where: { id } });
  }
}
