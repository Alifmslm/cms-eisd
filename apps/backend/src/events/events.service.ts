import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEventDto, UpdateEventDto } from './dto';
import * as slug from 'slug';

@Injectable()
export class EventsService {
  constructor(private prisma: PrismaService) {}

  private generateSlug(title: string): string {
    return slug(title, { lower: true });
  }

  private async ensureUniqueSlug(slug: string, excludeId?: string): Promise<string> {
    let uniqueSlug = slug;
    let counter = 1;
    
    while (true) {
      const existing = await this.prisma.event.findUnique({ where: { slug: uniqueSlug } });
      if (!existing || existing.id === excludeId) {
        break;
      }
      uniqueSlug = `${slug}-${counter}`;
      counter++;
    }
    
    return uniqueSlug;
  }

  async create(createEventDto: CreateEventDto) {
    const eventSlug = this.generateSlug(createEventDto.title);
    const uniqueSlug = await this.ensureUniqueSlug(eventSlug);

    if (new Date(createEventDto.endDate) < new Date(createEventDto.startDate)) {
      throw new BadRequestException('End date must be after start date');
    }

    return this.prisma.event.create({
      data: {
        ...createEventDto,
        slug: uniqueSlug,
        galleryImages: createEventDto.galleryImages || [],
      },
    });
  }

  async findAll() {
    return this.prisma.event.findMany({
      orderBy: { updatedAt: 'desc' },
    });
  }

  async findPublished() {
    return this.prisma.event.findMany({
      where: { publishedAt: { not: null } },
      orderBy: { startDate: 'asc' },
    });
  }

  async findBySlug(slug: string) {
    const event = await this.prisma.event.findUnique({ where: { slug } });
    if (!event) {
      throw new NotFoundException(`Event with slug "${slug}" not found`);
    }
    return event;
  }

  async update(id: string, updateEventDto: UpdateEventDto) {
    const existing = await this.prisma.event.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Event with id "${id}" not found`);
    }

    let slugValue = existing.slug;
    if (updateEventDto.title && updateEventDto.title !== existing.title) {
      slugValue = await this.ensureUniqueSlug(this.generateSlug(updateEventDto.title), id);
    }

    if (updateEventDto.startDate && updateEventDto.endDate) {
      if (new Date(updateEventDto.endDate) < new Date(updateEventDto.startDate)) {
        throw new BadRequestException('End date must be after start date');
      }
    }

    return this.prisma.event.update({
      where: { id },
      data: {
        ...updateEventDto,
        slug: slugValue,
      },
    });
  }

  async publish(id: string) {
    const existing = await this.prisma.event.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Event with id "${id}" not found`);
    }

    return this.prisma.event.update({
      where: { id },
      data: { publishedAt: new Date() },
    });
  }

  async unpublish(id: string) {
    const existing = await this.prisma.event.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Event with id "${id}" not found`);
    }

    return this.prisma.event.update({
      where: { id },
      data: { publishedAt: null },
    });
  }

  async remove(id: string) {
    const existing = await this.prisma.event.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Event with id "${id}" not found`);
    }

    return this.prisma.event.delete({ where: { id } });
  }
}
