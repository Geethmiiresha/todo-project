import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Category } from '../../categories/entities/category.entity';
import { Tag } from '../../tags/entities/tag.entity';
import { Todo } from '../../todos/entities/todo.entity';
import type { Relation } from 'typeorm';

export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 80 })
  name: string;

  @Column({ unique: true })
  email: string;

  // select: false => password hash eka queries walin default eken enne na
  @Column({ select: false })
  password: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  role: UserRole;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'refresh_token_hash', type: 'text', nullable: true, select: false })
  refreshTokenHash: string | null;

  @Column({ name: 'reset_password_token', type: 'text', nullable: true, select: false })
  resetPasswordToken: string | null;

  @Column({ name: 'reset_password_expires', type: 'timestamp', nullable: true, select: false })
  resetPasswordExpires: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => Todo, (todo) => todo.user)
  todos: Relation<Todo[]>;

  @OneToMany(() => Category, (category) => category.user)
  categories: Relation<Category[]>;

  @OneToMany(() => Tag, (tag) => tag.user)
  tags: Relation<Tag[]>;
}