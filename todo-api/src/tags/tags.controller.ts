import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { AuthUser } from '../auth/auth-user.interface';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { CreateTagDto } from './dto/create-tag.dto';
import { TagsService } from './tags.service';

@UseGuards(AuthGuard)
@Controller('tags')
@ApiTags('Tags')
@ApiBearerAuth()
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  @Get()
  findAll(@CurrentUser() user: AuthUser) {
    return this.tagsService.findAll(user.id);
  }

  @Post()
  create(@Body() dto: CreateTagDto, @CurrentUser() user: AuthUser) {
    return this.tagsService.create(user.id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.tagsService.remove(id, user.id);
  }
}
