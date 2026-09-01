import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { AuthenticatedGuard } from '../auth/authenticated.guard';

@ApiTags('Dashboard')
@Controller('api/dashboard')
@UseGuards(AuthenticatedGuard)
export class DashboardController {
  constructor(private dashboardService: DashboardService) {}

  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get dashboard statistics (admin only)' })
  @ApiResponse({ status: 200, description: 'Dashboard stats returned' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getStats() {
    return this.dashboardService.getStats();
  }
}
