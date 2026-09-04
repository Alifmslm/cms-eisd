import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getStats() {
    const now = new Date();
    const eventListSelect = {
      id: true,
      slug: true,
      title: true,
      location: true,
      startDate: true,
      endDate: true,
      publishedAt: true,
      updatedAt: true,
    };
    const [
      totalEvents,
      totalArticles,
      publishedEvents,
      publishedArticles,
      upcomingEvents,
      upcomingEventsList,
      latestEvents,
      latestArticles,
    ] = await Promise.all([
      this.prisma.event.count(),
      this.prisma.mediumArticle.count(),
      this.prisma.event.count({ where: { publishedAt: { not: null } } }),
      this.prisma.mediumArticle.count({ where: { publishedAt: { not: null } } }),
      this.prisma.event.count({
        where: {
          startDate: { gte: now },
          publishedAt: { not: null },
        },
      }),
      this.prisma.event.findMany({
        where: {
          startDate: { gte: now },
          publishedAt: { not: null },
        },
        orderBy: { startDate: 'asc' },
        take: 5,
        select: eventListSelect,
      }),
      this.prisma.event.findMany({
        orderBy: { updatedAt: 'desc' },
        take: 5,
        select: eventListSelect,
      }),
      this.prisma.mediumArticle.findMany({
        orderBy: { updatedAt: 'desc' },
        take: 5,
        select: {
          id: true,
          title: true,
          url: true,
          publishedAt: true,
          updatedAt: true,
        },
      }),
    ]);

    return {
      totalEvents,
      totalArticles,
      publishedEvents,
      draftEvents: totalEvents - publishedEvents,
      publishedArticles,
      draftArticles: totalArticles - publishedArticles,
      upcomingEvents,
      upcomingEventsList,
      latestEvents,
      latestArticles,
    };
  }
}
