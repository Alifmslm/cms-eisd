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
import { ArticlesService } from './articles.service';
import { CreateArticleDto, UpdateArticleDto } from './dto';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { AuthenticatedGuard } from '../auth/authenticated.guard';

@ApiTags('Articles')
@Controller('api/articles')
export class ArticlesController {
  constructor(private articlesService: ArticlesService) {}

  @Get()
  @ApiOperation({ summary: 'List all published articles' })
  @ApiResponse({ status: 200, description: 'List of published articles' })
  async findPublished() {
    return this.articlesService.findPublished();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a published article by ID' })
  @ApiParam({ name: 'id', example: 'uuid-format-id' })
  @ApiResponse({ status: 200, description: 'Published article found' })
  @ApiResponse({ status: 404, description: 'Article not found or unpublished' })
  async findById(@Param('id') id: string) {
    return this.articlesService.findById(id);
  }

  @Post()
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard, RolesGuard)
  @Roles('admin')
  @HttpCode(201)
  @ApiOperation({ summary: 'Create article by URL - auto-fetches OG metadata (admin only)' })
  @ApiResponse({ status: 201, description: 'Article created with fetched metadata' })
  @ApiResponse({ status: 400, description: 'Invalid URL or metadata fetch failed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async create(@Body() createArticleDto: CreateArticleDto) {
    return this.articlesService.create(createArticleDto);
  }

  @Put(':id')
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Update an article (admin only)' })
  @ApiParam({ name: 'id', example: 'uuid-format-id' })
  @ApiResponse({ status: 200, description: 'Article updated' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Article not found' })
  async update(@Param('id') id: string, @Body() updateArticleDto: UpdateArticleDto) {
    return this.articlesService.update(id, updateArticleDto);
  }

  @Post(':id/publish')
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard, RolesGuard)
  @Roles('admin')
  @HttpCode(200)
  @ApiOperation({ summary: 'Publish a draft article (admin only)' })
  @ApiParam({ name: 'id', example: 'uuid-format-id' })
  @ApiResponse({ status: 200, description: 'Article published' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Article not found' })
  async publish(@Param('id') id: string) {
    return this.articlesService.publish(id);
  }

  @Post(':id/unpublish')
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard, RolesGuard)
  @Roles('admin')
  @HttpCode(200)
  @ApiOperation({ summary: 'Unpublish a published article (admin only)' })
  @ApiParam({ name: 'id', example: 'uuid-format-id' })
  @ApiResponse({ status: 200, description: 'Article unpublished' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Article not found' })
  async unpublish(@Param('id') id: string) {
    return this.articlesService.unpublish(id);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard, RolesGuard)
  @Roles('admin')
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete an article (admin only)' })
  @ApiParam({ name: 'id', example: 'uuid-format-id' })
  @ApiResponse({ status: 204, description: 'Article deleted' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Article not found' })
  async remove(@Param('id') id: string) {
    await this.articlesService.remove(id);
  }
}
