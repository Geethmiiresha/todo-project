import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsISO8601,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  ValidateIf,
} from 'class-validator';
import { TodoPriority } from '../entities/todo.entity';

export class CreateTodoDto {
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @IsNotEmpty({ message: 'Enter a title for your task.' })
  @MaxLength(80)
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  completed?: boolean;

  @IsOptional()
  @IsEnum(TodoPriority)
  priority?: TodoPriority;

  @Transform(({ value }) => {
    if (value === '' || value === null || value === undefined) return null;
    return value;
  })
  @IsOptional()
  @ValidateIf((_, val) => val !== null && val !== undefined)
  @IsISO8601()
  dueDate?: string | null;
}