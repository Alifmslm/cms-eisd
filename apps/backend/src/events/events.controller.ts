import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  HttpCode,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { EventsService } from './events.service';
import { CreateEventDto, UpdateEventDto } from './dto';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { AuthenticatedGuard } from '../auth/authenticated.guard';

@ApiTags('Events')
@Controller('api/events')
export class EventsController {
  constructor(private eventsService: EventsService) {}

  @Get()
  @ApiOperation({ summary: 'List all published events' })
  @ApiResponse({ status: 200, description: 'List of published events' })
  async findPublished() {
    return this.eventsService.findPublished();
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Get a published event by slug' })
  @ApiParam({ name: 'slug', example: 'annual-meeting-2026' })
  @ApiResponse({ status: 200, description: 'Published event found' })
  @ApiResponse({ status: 404, description: 'Event not found or unpublished' })
  async findBySlug(@Param('slug') slug: string) {
    return this.eventsService.findBySlug(slug);
  }

  @Post()
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard, RolesGuard)
  @Roles('admin')
  @HttpCode(201)
  @ApiOperation({ summary: 'Create a new event (admin only)' })
  @ApiResponse({ status: 201, description: 'Event created' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - admin role required' })
  async create(@Body() createEventDto: CreateEventDto) {
    return this.eventsService.create(createEventDto);
  }

  @Put(':id')
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Update an event (admin only)' })
  @ApiParam({ name: 'id', example: 'uuid-format-id' })
  @ApiResponse({ status: 200, description: 'Event updated' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Event not found' })
  async update(@Param('id') id: string, @Body() updateEventDto: UpdateEventDto) {
    return this.eventsService.update(id, updateEventDto);
  }

  @Post(':id/publish')
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard, RolesGuard)
  @Roles('admin')
  @HttpCode(200)
  @ApiOperation({ summary: 'Publish a draft event (admin only)' })
  @ApiParam({ name: 'id', example: 'uuid-format-id' })
  @ApiResponse({ status: 200, description: 'Event published' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Event not found' })
  async publish(@Param('id') id: string) {
    return this.eventsService.publish(id);
  }

  @Post(':id/unpublish')
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard, RolesGuard)
  @Roles('admin')
  @HttpCode(200)
  @ApiOperation({ summary: 'Unpublish a published event (admin only)' })
  @ApiParam({ name: 'id', example: 'uuid-format-id' })
  @ApiResponse({ status: 200, description: 'Event unpublished' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Event not found' })
  async unpublish(@Param('id') id: string) {
    return this.eventsService.unpublish(id);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard, RolesGuard)
  @Roles('admin')
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete an event (admin only)' })
  @ApiParam({ name: 'id', example: 'uuid-format-id' })
  @ApiResponse({ status: 204, description: 'Event deleted' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Event not found' })
  async remove(@Param('id') id: string) {
    await this.eventsService.remove(id);
  }
}
