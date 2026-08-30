import { Controller, Get, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { AuthenticatedGuard } from '../auth/authenticated.guard';

@Controller('api/dashboard')
@UseGuards(AuthenticatedGuard)
export class DashboardController {
  constructor(private dashboardService: DashboardService) {}

  @Get()
  async getStats() {
    return this.dashboardService.getStats();
  }
}
