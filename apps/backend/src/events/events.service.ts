import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEventDto, UpdateEventDto } from './dto';
import { StorageService } from '../storage/storage.service';
import * as slug from 'slug';

export type EventStatus = 'Incoming' | 'On Going' | 'Finished';

@Injectable()
export class EventsService {
  constructor(
    private prisma: PrismaService,
    private storageService: StorageService,
  ) {}

  computeEventStatus(
    startDate: string | Date,
    endDate: string | Date,
    now: Date = new Date(),
  ): EventStatus {
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (now < start) {
      return 'Incoming';
    }
    if (now >= start && now <= end) {
      return 'On Going';
    }
    return 'Finished';
  }

  private withStatus<T extends { startDate: Date; endDate: Date }>(event: T): T & { status: EventStatus } {
    return { ...event, status: this.computeEventStatus(event.startDate, event.endDate) };
  }

  private withStatusList<T extends { startDate: Date; endDate: Date }>(events: T[]): (T & { status: EventStatus })[] {
    return events.map((event) => this.withStatus(event));
  }

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
    const events = await this.prisma.event.findMany({
      orderBy: { updatedAt: 'desc' },
    });
    return this.withStatusList(events);
  }

  async findPublished() {
    const events = await this.prisma.event.findMany({
      where: { publishedAt: { not: null } },
      orderBy: { startDate: 'asc' },
    });
    return this.withStatusList(events);
  }

  async findBySlug(slug: string) {
    const event = await this.prisma.event.findFirst({
      where: {
        slug,
        publishedAt: { not: null },
      },
    });
    if (!event) {
      throw new NotFoundException(`Event with slug "${slug}" not found`);
    }
    return this.withStatus(event);
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

    const imageUrls = [
      existing.coverImage,
      existing.headerImage,
      ...existing.galleryImages,
    ].filter((url) => url && url.length > 0);

    if (imageUrls.length > 0) {
      await this.storageService.deleteImages(imageUrls);
    }

    return this.prisma.event.delete({ where: { id } });
  }
}
