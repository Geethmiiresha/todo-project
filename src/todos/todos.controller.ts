import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import type { AuthUser } from '../auth/auth-user.interface';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { CreateTodoDto } from './dto/create-todo.dto';
import { QueryTodoDto } from './dto/query-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { TodosService } from './todos.service';

@UseGuards(AuthGuard)
@Controller('todos')
export class TodosController {
  constructor(private readonly todosService: TodosService) {}

  @Get('summary')
  getSummary(@CurrentUser() user: AuthUser) {
    return this.todosService.getSummary(user.id);
  }

  @Get()
  findAll(
    @CurrentUser() user: AuthUser,
    @Query() query: QueryTodoDto,
  ) {
    return this.todosService.findAll(user.id, query);
  }

  // "completed" route eka ":id" routes walata kalin thiyenna one
  @Delete('completed')
  @HttpCode(204)
  removeCompleted(@CurrentUser() user: AuthUser) {
    return this.todosService.removeCompleted(user.id);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.todosService.findOne(id, user.id);
  }

  @Post()
  create(@Body() dto: CreateTodoDto, @CurrentUser() user: AuthUser) {
    return this.todosService.create(user.id, dto);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTodoDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.todosService.update(id, user.id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.todosService.remove(id, user.id);
  }
}