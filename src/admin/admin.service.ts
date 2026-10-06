import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from '../categories/entities/category.entity';
import { Tag } from '../tags/entities/tag.entity';
import { Todo } from '../todos/entities/todo.entity';
import { UsersService } from '../users/users.service';

export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  disabledUsers: number;
  totalTodos: number;
  completedTodos: number;
  activeTodos: number;
  totalCategories: number;
  totalTags: number;
}

@Injectable()
export class AdminService {
  constructor(
    private readonly usersService: UsersService,
    @InjectRepository(Todo)
    private readonly todosRepository: Repository<Todo>,
    @InjectRepository(Category)
    private readonly categoriesRepository: Repository<Category>,
    @InjectRepository(Tag)
    private readonly tagsRepository: Repository<Tag>,
  ) {}

  async getUsers(): Promise<any[]> {
    const users = await this.usersService.findAllForAdmin();
    return users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      isActive: u.isActive,
      createdAt: u.createdAt,
      todosCount: Number((u as any).todosCount ?? 0),
    }));
  }

  async setUserStatus(
    adminUserId: string,
    targetUserId: string,
    isActive: boolean,
  ): Promise<any> {
    if (adminUserId === targetUserId && !isActive) {
      throw new BadRequestException('You cannot disable your own account');
    }

    const updated = await this.usersService.setAccountStatus(
      targetUserId,
      isActive,
    );
    return {
      id: updated.id,
      name: updated.name,
      email: updated.email,
      role: updated.role,
      isActive: updated.isActive,
    };
  }

  async getStats(): Promise<AdminStats> {
    const [
      totalUsers,
      activeUsers,
      totalTodos,
      completedTodos,
      totalCategories,
      totalTags,
    ] = await Promise.all([
      this.usersService.countUsers(),
      this.usersService.countActiveUsers(),
      this.todosRepository.count(),
      this.todosRepository.count({ where: { completed: true } }),
      this.categoriesRepository.count(),
      this.tagsRepository.count(),
    ]);

    return {
      totalUsers,
      activeUsers,
      disabledUsers: totalUsers - activeUsers,
      totalTodos,
      completedTodos,
      activeTodos: totalTodos - completedTodos,
      totalCategories,
      totalTags,
    };
  }
}
