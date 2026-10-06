import { Transform, Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { TodoPriority } from '../entities/todo.entity';

export enum TodoStatusFilter {
  ALL = 'all',
  ACTIVE = 'active',
  COMPLETED = 'completed',
}

export enum TodoSortBy {
  CREATED_AT = 'createdAt',
  UPDATED_AT = 'updatedAt',
  TITLE = 'title',
  COMPLETED = 'completed',
  DUE_DATE = 'dueDate',
  PRIORITY = 'priority',
}

export enum SortOrder {
  ASC = 'ASC',
  DESC = 'DESC',
}

export class QueryTodoDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 10;

  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(TodoStatusFilter)
  status: TodoStatusFilter = TodoStatusFilter.ALL;

  @IsOptional()
  @IsEnum(TodoPriority)
  priority?: TodoPriority;

  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value !== 'string') return value;
    const normalized = value.toLowerCase();
    if (normalized === 'created_at' || normalized === 'createdat') return TodoSortBy.CREATED_AT;
    if (normalized === 'updated_at' || normalized === 'updatedat') return TodoSortBy.UPDATED_AT;
    if (normalized === 'due_date' || normalized === 'duedate') return TodoSortBy.DUE_DATE;
    return value;
  })
  @IsEnum(TodoSortBy)
  sortBy: TodoSortBy = TodoSortBy.CREATED_AT;

  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value.toUpperCase() : value))
  @IsEnum(SortOrder)
  sortOrder: SortOrder = SortOrder.DESC;
}

