import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
} from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto, UpdateEventDto } from './dto';
import { IsString, IsOptional } from 'class-validator';

class FindBySlugDto {
  @IsString()
  slug: string;
}

@Controller('api/events')
export class EventsController {
  constructor(private eventsService: EventsService) {}

  @Post()
  @HttpCode(201)
  async create(@Body() createEventDto: CreateEventDto) {
    return this.eventsService.create(createEventDto);
  }

  @Get()
  async findAll(@Query('published') published?: string) {
    if (published === 'true') {
      return this.eventsService.findPublished();
    }
    return this.eventsService.findAll();
  }

  @Get(':slug')
  async findBySlug(@Param('slug') slug: string) {
    return this.eventsService.findBySlug(slug);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateEventDto: UpdateEventDto) {
    return this.eventsService.update(id, updateEventDto);
  }

  @Post(':id/publish')
  @HttpCode(200)
  async publish(@Param('id') id: string) {
    return this.eventsService.publish(id);
  }

  @Post(':id/unpublish')
  @HttpCode(200)
  async unpublish(@Param('id') id: string) {
    return this.eventsService.unpublish(id);
  }

  @Delete(':id')
  @HttpCode(204)
  async remove(@Param('id') id: string) {
    await this.eventsService.remove(id);
  }
}
