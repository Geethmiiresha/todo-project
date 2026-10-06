import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateTodoDto } from './dto/create-todo.dto';
import {
  QueryTodoDto,
  SortOrder,
  TodoSortBy,
  TodoStatusFilter,
} from './dto/query-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { Todo, TodoPriority } from './entities/todo.entity';

export interface PaginatedTodosResponse {
  data: Todo[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface TodoSummary {
  total: number;
  completed: number;
  active: number;
}

@Injectable()
export class TodosService {
  constructor(
    @InjectRepository(Todo)
    private readonly todosRepository: Repository<Todo>,
  ) {}

  async findAll(
    userId: string,
    query: QueryTodoDto = new QueryTodoDto(),
  ): Promise<PaginatedTodosResponse> {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(query.limit) || 10));

    const qb = this.todosRepository
      .createQueryBuilder('todo')
      .where('todo.userId = :userId', { userId });

    if (query.search && query.search.trim()) {
      qb.andWhere(
        '(todo.title ILIKE :search OR todo.description ILIKE :search)',
        { search: `%${query.search.trim()}%` },
      );
    }

    if (query.status === TodoStatusFilter.ACTIVE) {
      qb.andWhere('todo.completed = :completed', { completed: false });
    } else if (query.status === TodoStatusFilter.COMPLETED) {
      qb.andWhere('todo.completed = :completed', { completed: true });
    }

    if (query.priority) {
      qb.andWhere('todo.priority = :priority', { priority: query.priority });
    }

    const sortOrder = query.sortOrder === SortOrder.ASC ? 'ASC' : 'DESC';

    switch (query.sortBy) {
      case TodoSortBy.TITLE:
        qb.orderBy('LOWER(todo.title)', sortOrder);
        break;
      case TodoSortBy.UPDATED_AT:
        qb.orderBy('todo.updatedAt', sortOrder);
        break;
      case TodoSortBy.COMPLETED:
        qb.orderBy('todo.completed', sortOrder);
        break;
      case TodoSortBy.DUE_DATE:
        qb.orderBy('todo.dueDate', sortOrder, 'NULLS LAST');
        break;
      case TodoSortBy.PRIORITY:
        qb.addSelect(
          `CASE todo.priority
            WHEN 'HIGH' THEN 3
            WHEN 'MEDIUM' THEN 2
            WHEN 'LOW' THEN 1
            ELSE 0
          END`,
          'priority_rank',
        );
        qb.orderBy('priority_rank', sortOrder);
        break;
      case TodoSortBy.CREATED_AT:
      default:
        qb.orderBy('todo.createdAt', sortOrder);
        break;
    }

    qb.skip((page - 1) * limit).take(limit);

    const [data, total] = await qb.getManyAndCount();

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getSummary(userId: string): Promise<TodoSummary> {
    const total = await this.todosRepository.count({ where: { userId } });
    const completed = await this.todosRepository.count({
      where: { userId, completed: true },
    });
    return {
      total,
      completed,
      active: total - completed,
    };
  }

  // Wena user kenekge todo ekak nam 404 (eka thiyenawa kiyala hint ekak denne na)
  async findOne(id: string, userId: string): Promise<Todo> {
    const todo = await this.todosRepository.findOneBy({ id, userId });
    if (!todo) throw new NotFoundException(`Todo ${id} not found`);
    return todo;
  }

  create(userId: string, dto: CreateTodoDto): Promise<Todo> {
    const todo = this.todosRepository.create({
      title: dto.title,
      description: dto.description?.trim() ?? '',
      completed: dto.completed ?? false,
      priority: dto.priority ?? TodoPriority.MEDIUM,
      dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
      userId,
    });
    return this.todosRepository.save(todo);
  }

  async update(id: string, userId: string, dto: UpdateTodoDto): Promise<Todo> {
    const todo = await this.findOne(id, userId);
    if (dto.title !== undefined) todo.title = dto.title;
    if (dto.description !== undefined) todo.description = dto.description.trim();
    if (dto.completed !== undefined) todo.completed = dto.completed;
    if (dto.priority !== undefined) todo.priority = dto.priority;
    if (dto.dueDate !== undefined) {
      todo.dueDate = dto.dueDate ? new Date(dto.dueDate) : null;
    }
    return this.todosRepository.save(todo);
  }

  async remove(id: string, userId: string): Promise<void> {
    const todo = await this.findOne(id, userId);
    await this.todosRepository.remove(todo);
  }

  async removeCompleted(userId: string): Promise<void> {
    await this.todosRepository.delete({ completed: true, userId });
  }
}