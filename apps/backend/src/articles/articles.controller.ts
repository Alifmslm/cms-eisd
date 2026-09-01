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
import { ArticlesService } from './articles.service';
import { CreateArticleDto, UpdateArticleDto } from './dto';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { AuthenticatedGuard } from '../auth/authenticated.guard';

@Controller('api/articles')
export class ArticlesController {
  constructor(private articlesService: ArticlesService) {}

  @Get()
  async findPublished() {
    return this.articlesService.findPublished();
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.articlesService.findById(id);
  }

  @Post()
  @UseGuards(AuthenticatedGuard, RolesGuard)
  @Roles('admin')
  @HttpCode(201)
  async create(@Body() createArticleDto: CreateArticleDto) {
    return this.articlesService.create(createArticleDto);
  }

  @Put(':id')
  @UseGuards(AuthenticatedGuard, RolesGuard)
  @Roles('admin')
  async update(@Param('id') id: string, @Body() updateArticleDto: UpdateArticleDto) {
    return this.articlesService.update(id, updateArticleDto);
  }

  @Post(':id/publish')
  @UseGuards(AuthenticatedGuard, RolesGuard)
  @Roles('admin')
  @HttpCode(200)
  async publish(@Param('id') id: string) {
    return this.articlesService.publish(id);
  }

  @Post(':id/unpublish')
  @UseGuards(AuthenticatedGuard, RolesGuard)
  @Roles('admin')
  @HttpCode(200)
  async unpublish(@Param('id') id: string) {
    return this.articlesService.unpublish(id);
  }

  @Delete(':id')
  @UseGuards(AuthenticatedGuard, RolesGuard)
  @Roles('admin')
  @HttpCode(204)
  async remove(@Param('id') id: string) {
    await this.articlesService.remove(id);
  }
}
