import { NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { Repository } from 'typeorm';
import { jest } from '@jest/globals';
import { TagsService } from '../tags/tags.service';
import { Todo } from './entities/todo.entity';
import { TodosService } from './todos.service';

describe('TodosService', () => {
  let service: TodosService;
  let repository: jest.Mocked<Partial<Repository<Todo>>>;
  let queryBuilder: {
    leftJoinAndSelect: jest.Mock;
    where: jest.Mock;
    andWhere: jest.Mock;
    orderBy: jest.Mock;
    addSelect: jest.Mock;
    skip: jest.Mock;
    take: jest.Mock;
    getManyAndCount: jest.Mock;
  };

  const todo = {
    id: 'todo-1',
    userId: 'user-1',
    title: 'Read',
    description: '',
    completed: false,
  } as Todo;

  beforeEach(async () => {
    queryBuilder = {
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn().mockResolvedValue([[todo], 1]),
    };
    repository = {
      createQueryBuilder: jest.fn().mockReturnValue(queryBuilder),
      findOne: jest.fn().mockResolvedValue(todo),
      create: jest.fn().mockImplementation((input) => input),
      save: jest.fn().mockImplementation(async (input) => input),
      remove: jest.fn().mockResolvedValue(todo),
      count: jest.fn().mockResolvedValue(1),
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TodosService,
        { provide: getRepositoryToken(Todo), useValue: repository },
        { provide: TagsService, useValue: { findByIds: jest.fn() } },
      ],
    }).compile();
    service = module.get<TodosService>(TodosService);
  });

  it('returns only the authenticated user’s todos and pagination metadata', async () => {
    const result = await service.findAll('user-1', {
      page: 2,
      limit: 5,
    });

    expect(queryBuilder.where).toHaveBeenCalledWith('todo.userId = :userId', {
      userId: 'user-1',
    });
    expect(queryBuilder.skip).toHaveBeenCalledWith(5);
    expect(queryBuilder.take).toHaveBeenCalledWith(5);
    expect(result).toEqual({
      data: [todo],
      meta: { page: 2, limit: 5, total: 1, totalPages: 1 },
    });
  });

  it('passes search text as a query parameter', async () => {
    await service.findAll('user-1', { search: "%' OR true --" });

    expect(queryBuilder.andWhere).toHaveBeenCalledWith(
      '(todo.title ILIKE :search OR todo.description ILIKE :search)',
      { search: "%%' OR true --%" },
    );
  });

  it('creates todos for the authenticated user with default values', async () => {
    const created = await service.create('user-1', { title: 'Read' });

    expect(repository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Read',
        userId: 'user-1',
        completed: false,
      }),
    );
    expect(created).toEqual(expect.objectContaining({ title: 'Read' }));
  });

  it('does not update a todo owned by another user', async () => {
    repository.findOne!.mockResolvedValueOnce(null);

    await expect(
      service.update('todo-1', 'user-2', { title: 'Changed' }),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(repository.save).not.toHaveBeenCalled();
  });

  it('returns not found when updating a non-existent todo', async () => {
    repository.findOne!.mockResolvedValue(null);

    await expect(
      service.update('missing', 'user-1', { title: 'Changed' }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('deletes only a todo belonging to the authenticated user', async () => {
    await service.remove('todo-1', 'user-1');
    expect(repository.findOne).toHaveBeenCalledWith({
      where: { id: 'todo-1', userId: 'user-1' },
      relations: { category: true, tags: true },
    });
    expect(repository.remove).toHaveBeenCalledWith(todo);
  });
});
