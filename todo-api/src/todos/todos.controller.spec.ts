import { Test, TestingModule } from '@nestjs/testing';
import { TodosController } from './todos.controller';
import { TodosService } from './todos.service';
import { AuthGuard } from '../auth/auth.guard';
import { jest } from '@jest/globals';

describe('TodosController', () => {
  let controller: TodosController;
  const todosService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    getSummary: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    removeCompleted: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TodosController],
      providers: [{ provide: TodosService, useValue: todosService }],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<TodosController>(TodosController);
  });

  it('uses the authenticated user when listing todos', async () => {
    const user = {
      id: 'user-1',
      email: 'alex@example.com',
      role: 'USER',
      isActive: true,
    };
    const query = { page: 1, limit: 10 };
    todosService.findAll.mockResolvedValue({ data: [], meta: {} });

    await controller.findAll(user, query);

    expect(todosService.findAll).toHaveBeenCalledWith('user-1', query);
  });
});
