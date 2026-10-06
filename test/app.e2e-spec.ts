import {
  ConflictException,
  INestApplication,
  NotFoundException,
  UnauthorizedException,
  ValidationPipe,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UserRole } from '../src/users/entities/user.entity';
import { UsersService } from '../src/users/users.service';
import { AuthController } from '../src/auth/auth.controller';
import { AuthGuard } from '../src/auth/auth.guard';
import { AuthService } from '../src/auth/auth.service';
import { HttpExceptionFilter } from '../src/common/http-exception.filter';
import { RegisterDto } from '../src/auth/dto/register.dto';
import { TodosController } from '../src/todos/todos.controller';
import { TodosService } from '../src/todos/todos.service';
import request from 'supertest';
import { App } from 'supertest/types';
import { jest } from '@jest/globals';

describe('Versioned API (e2e)', () => {
  let app: INestApplication<App>;
  const user = {
    id: '9dc49847-c34b-4cc7-9fab-43acb5136d83',
    name: 'Alex Todo',
    email: 'alex@example.com',
    role: UserRole.USER,
    isActive: true,
  };
  const todo = {
    id: '1e138878-978d-41db-b10c-02084b2378c1',
    userId: user.id,
    title: 'Plan the week',
    description: '',
    completed: false,
    priority: 'MEDIUM',
    dueDate: null,
    categoryId: null,
    tags: [],
  };
  const authService = {
    register: jest.fn(),
    login: jest.fn(),
    refresh: jest.fn(),
    forgotPassword: jest.fn(),
    resetPassword: jest.fn(),
    getProfile: jest.fn(),
    logout: jest.fn(),
    changePassword: jest.fn(),
  };
  const todosService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    getSummary: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    removeCompleted: jest.fn(),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [AuthController, TodosController],
      providers: [
        AuthGuard,
        { provide: AuthService, useValue: authService },
        { provide: TodosService, useValue: todosService },
        {
          provide: JwtService,
          useValue: {
            verifyAsync: jest.fn().mockResolvedValue({
              sub: user.id,
              email: user.email,
              role: user.role,
            }),
          },
        },
        {
          provide: UsersService,
          useValue: { findById: jest.fn().mockResolvedValue(user) },
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalFilters(new HttpExceptionFilter());
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    authService.register.mockImplementation((dto: RegisterDto) => {
      if (dto.email === 'existing@example.com') {
        throw new ConflictException('An account with this email already exists');
      }
      return {
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        user,
      };
    });
    authService.login.mockImplementation(({ password }: { password: string }) =>
      password === 'valid-password'
        ? { accessToken: 'access-token', refreshToken: 'refresh-token', user }
        : Promise.reject(new UnauthorizedException('Invalid email or password')),
    );
    todosService.findAll.mockResolvedValue({
      data: [todo],
      meta: { page: 1, limit: 10, total: 1, totalPages: 1 },
    });
    todosService.create.mockImplementation((_userId, dto) => ({
      ...todo,
      ...dto,
    }));
    todosService.update.mockImplementation((id, userId, dto) => {
      if (id !== todo.id || userId !== user.id) throw new NotFoundException();
      return { ...todo, ...dto };
    });
    todosService.remove.mockImplementation((id, userId) => {
      if (id !== todo.id || userId !== user.id) throw new NotFoundException();
    });
  });

  it('registers an account and returns only the public user profile', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({
        name: user.name,
        email: user.email,
        password: 'valid-password',
      })
      .expect(201);

    expect(response.body.user).toEqual(user);
    expect(response.body.user).not.toHaveProperty('password');
  });

  it('rejects duplicate registration with a consistent error body', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({
        name: user.name,
        email: 'existing@example.com',
        password: 'valid-password',
      })
      .expect(409);

    expect(response.body).toEqual(
      expect.objectContaining({
        statusCode: 409,
        message: 'An account with this email already exists',
        path: '/api/v1/auth/register',
      }),
    );
  });

  it('rejects invalid login credentials', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: user.email, password: 'incorrect' })
      .expect(401);

    expect(response.body.message).toBe('Invalid email or password');
  });

  it('rejects invalid request fields and client-selected roles', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({
        name: user.name,
        email: user.email,
        password: 'valid-password',
        role: 'ADMIN',
      })
      .expect(400);

    expect(response.body).toEqual(
      expect.objectContaining({ statusCode: 400, error: 'Bad Request' }),
    );
  });

  it('rejects unauthorized todo API requests', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/v1/todos')
      .expect(401);

    expect(response.body.statusCode).toBe(401);
    expect(todosService.findAll).not.toHaveBeenCalled();
  });

  it('creates and lists authenticated-user todos', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/todos')
      .set('Authorization', 'Bearer valid-token')
      .send({ title: 'Plan the week' })
      .expect(201);

    const response = await request(app.getHttpServer())
      .get('/api/v1/todos')
      .set('Authorization', 'Bearer valid-token')
      .expect(200);

    expect(todosService.create).toHaveBeenCalledWith(
      user.id,
      expect.objectContaining({ title: 'Plan the week' }),
    );
    expect(todosService.findAll).toHaveBeenCalledWith(user.id, expect.anything());
    expect(response.body.data).toHaveLength(1);
  });

  it('updates and deletes todos through the versioned API', async () => {
    const path = `/api/v1/todos/${todo.id}`;
    await request(app.getHttpServer())
      .patch(path)
      .set('Authorization', 'Bearer valid-token')
      .send({ completed: true })
      .expect(200)
      .expect((response) => {
        expect(response.body.completed).toBe(true);
      });

    await request(app.getHttpServer())
      .delete(path)
      .set('Authorization', 'Bearer valid-token')
      .expect(204);
  });

  it('does not allow an authenticated user to update another user’s todo', async () => {
    const response = await request(app.getHttpServer())
      .patch('/api/v1/todos/11111111-1111-4111-8111-111111111111')
      .set('Authorization', 'Bearer valid-token')
      .send({ title: 'Take over' })
      .expect(404);

    expect(response.body.statusCode).toBe(404);
    expect(todosService.update).toHaveBeenCalledWith(
      '11111111-1111-4111-8111-111111111111',
      user.id,
      expect.anything(),
    );
  });

  afterAll(async () => {
    await app.close();
  });
});
