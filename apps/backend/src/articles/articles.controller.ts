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
  UseGuards,
} from '@nestjs/common';
import { ArticlesService } from './articles.service';
import { CreateArticleDto, UpdateArticleDto } from './dto';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { AuthenticatedGuard } from '../auth/authenticated.guard';

@Controller('api/articles')
@UseGuards(AuthenticatedGuard, RolesGuard)
export class ArticlesController {
  constructor(private articlesService: ArticlesService) {}

  @Post()
  @Roles('admin')
  @HttpCode(201)
  async create(@Body() createArticleDto: CreateArticleDto) {
    return this.articlesService.create(createArticleDto);
  }

  @Get()
  async findAll(@Query('published') published?: string) {
    if (published === 'true') {
      return this.articlesService.findPublished();
    }
    return this.articlesService.findAll();
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.articlesService.findById(id);
  }

  @Put(':id')
  @Roles('admin')
  async update(@Param('id') id: string, @Body() updateArticleDto: UpdateArticleDto) {
    return this.articlesService.update(id, updateArticleDto);
  }

  @Post(':id/publish')
  @Roles('admin')
  @HttpCode(200)
  async publish(@Param('id') id: string) {
    return this.articlesService.publish(id);
  }

  @Post(':id/unpublish')
  @Roles('admin')
  @HttpCode(200)
  async unpublish(@Param('id') id: string) {
    return this.articlesService.unpublish(id);
  }

  @Delete(':id')
  @Roles('admin')
  @HttpCode(204)
  async remove(@Param('id') id: string) {
    await this.articlesService.remove(id);
  }
}
