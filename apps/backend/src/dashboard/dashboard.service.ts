import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getStats() {
    const [totalEvents, totalArticles, upcomingEvents, latestEvents] = await Promise.all([
      this.prisma.event.count(),
      this.prisma.mediumArticle.count(),
      this.prisma.event.count({
        where: {
          startDate: { gte: new Date() },
          publishedAt: { not: null },
        },
      }),
      this.prisma.event.findMany({
        orderBy: { updatedAt: 'desc' },
        take: 5,
      }),
    ]);

    return {
      totalEvents,
      totalArticles,
      upcomingEvents,
      latestEvents,
    };
  }
}
