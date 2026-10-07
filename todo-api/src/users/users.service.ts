import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  findById(id: string): Promise<User | null> {
    return this.usersRepository.findOneBy({ id });
  }

  findByIdWithSecrets(id: string): Promise<User | null> {
    return this.usersRepository
      .createQueryBuilder('user')
      .addSelect([
        'user.password',
        'user.refreshTokenHash',
        'user.resetPasswordToken',
        'user.resetPasswordExpires',
      ])
      .where('user.id = :id', { id })
      .getOne();
  }

  findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOneBy({ email });
  }

  // Login walata password hash eka select karanne
  findByEmailWithPassword(email: string): Promise<User | null> {
    return this.usersRepository
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.email = :email', { email })
      .getOne();
  }

  findByResetToken(hashedToken: string): Promise<User | null> {
    return this.usersRepository
      .createQueryBuilder('user')
      .addSelect(['user.resetPasswordToken', 'user.resetPasswordExpires'])
      .where('user.resetPasswordToken = :token', { token: hashedToken })
      .andWhere('user.resetPasswordExpires > :now', { now: new Date() })
      .getOne();
  }

  create(data: {
    name: string;
    email: string;
    password: string;
    role?: UserRole;
  }): Promise<User> {
    const user = this.usersRepository.create({
      ...data,
      role: data.role ?? UserRole.USER,
      isActive: true,
    });
    return this.usersRepository.save(user);
  }

  async update(id: string, data: Partial<User>): Promise<User> {
    await this.usersRepository.update(id, data);
    const updated = await this.findById(id);
    if (!updated) throw new NotFoundException(`User ${id} not found`);
    return updated;
  }

  async findAllForAdmin(): Promise<(User & { todosCount: number })[]> {
    const users = await this.usersRepository.find({
      order: { createdAt: 'DESC' },
      relations: { todos: true },
    });
    return users.map((u) => ({
      ...u,
      todosCount: u.todos?.length ?? 0,
    }));
  }

  async setAccountStatus(id: string, isActive: boolean): Promise<User> {
    const user = await this.findById(id);
    if (!user) throw new NotFoundException(`User ${id} not found`);
    user.isActive = isActive;
    // If disabled, also clear refresh token to invalidate active sessions
    if (!isActive) {
      user.refreshTokenHash = null;
    }
    return this.usersRepository.save(user);
  }

  countUsers(): Promise<number> {
    return this.usersRepository.count();
  }

  countActiveUsers(): Promise<number> {
    return this.usersRepository.count({ where: { isActive: true } });
  }
}