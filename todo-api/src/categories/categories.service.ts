import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Category } from './entities/category.entity';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoriesRepository: Repository<Category>,
  ) {}

  findAll(userId: string): Promise<Category[]> {
    return this.categoriesRepository.find({
      where: { userId },
      order: { name: 'ASC' },
    });
  }

  async findOne(id: string, userId: string): Promise<Category> {
    const category = await this.categoriesRepository.findOneBy({ id, userId });
    if (!category) {
      throw new NotFoundException(`Category ${id} not found`);
    }
    return category;
  }

  async create(userId: string, dto: CreateCategoryDto): Promise<Category> {
    const existing = await this.categoriesRepository.findOneBy({
      name: dto.name,
      userId,
    });
    if (existing) {
      throw new ConflictException(`Category "${dto.name}" already exists`);
    }

    const category = this.categoriesRepository.create({
      name: dto.name,
      color: dto.color ?? '#6366f1',
      userId,
    });
    return this.categoriesRepository.save(category);
  }

  async update(
    id: string,
    userId: string,
    dto: UpdateCategoryDto,
  ): Promise<Category> {
    const category = await this.findOne(id, userId);

    if (dto.name !== undefined && dto.name !== category.name) {
      const existing = await this.categoriesRepository.findOneBy({
        name: dto.name,
        userId,
      });
      if (existing) {
        throw new ConflictException(`Category "${dto.name}" already exists`);
      }
      category.name = dto.name;
    }

    if (dto.color !== undefined) {
      category.color = dto.color;
    }

    return this.categoriesRepository.save(category);
  }

  async remove(id: string, userId: string): Promise<void> {
    const category = await this.findOne(id, userId);
    await this.categoriesRepository.remove(category);
  }
}

