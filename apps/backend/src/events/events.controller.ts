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
import { EventsService } from './events.service';
import { CreateEventDto, UpdateEventDto } from './dto';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { AuthenticatedGuard } from '../auth/authenticated.guard';

@Controller('api/events')
export class EventsController {
  constructor(private eventsService: EventsService) {}

  @Get()
  async findPublished() {
    return this.eventsService.findPublished();
  }

  @Get(':slug')
  async findBySlug(@Param('slug') slug: string) {
    return this.eventsService.findBySlug(slug);
  }

  @Post()
  @UseGuards(AuthenticatedGuard, RolesGuard)
  @Roles('admin')
  @HttpCode(201)
  async create(@Body() createEventDto: CreateEventDto) {
    return this.eventsService.create(createEventDto);
  }

  @Put(':id')
  @UseGuards(AuthenticatedGuard, RolesGuard)
  @Roles('admin')
  async update(@Param('id') id: string, @Body() updateEventDto: UpdateEventDto) {
    return this.eventsService.update(id, updateEventDto);
  }

  @Post(':id/publish')
  @UseGuards(AuthenticatedGuard, RolesGuard)
  @Roles('admin')
  @HttpCode(200)
  async publish(@Param('id') id: string) {
    return this.eventsService.publish(id);
  }

  @Post(':id/unpublish')
  @UseGuards(AuthenticatedGuard, RolesGuard)
  @Roles('admin')
  @HttpCode(200)
  async unpublish(@Param('id') id: string) {
    return this.eventsService.unpublish(id);
  }

  @Delete(':id')
  @UseGuards(AuthenticatedGuard, RolesGuard)
  @Roles('admin')
  @HttpCode(204)
  async remove(@Param('id') id: string) {
    await this.eventsService.remove(id);
  }
}
