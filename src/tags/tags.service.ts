import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { CreateTagDto } from './dto/create-tag.dto';
import { Tag } from './entities/tag.entity';

@Injectable()
export class TagsService {
  constructor(
    @InjectRepository(Tag)
    private readonly tagsRepository: Repository<Tag>,
  ) {}

  findAll(userId: string): Promise<Tag[]> {
    return this.tagsRepository.find({
      where: { userId },
      order: { name: 'ASC' },
    });
  }

  async findOne(id: string, userId: string): Promise<Tag> {
    const tag = await this.tagsRepository.findOneBy({ id, userId });
    if (!tag) {
      throw new NotFoundException(`Tag ${id} not found`);
    }
    return tag;
  }

  async findByIds(ids: string[], userId: string): Promise<Tag[]> {
    if (!ids || ids.length === 0) return [];
    return this.tagsRepository.find({
      where: { id: In(ids), userId },
    });
  }

  async create(userId: string, dto: CreateTagDto): Promise<Tag> {
    const existing = await this.tagsRepository.findOneBy({
      name: dto.name,
      userId,
    });
    if (existing) {
      throw new ConflictException(`Tag "${dto.name}" already exists`);
    }

    const tag = this.tagsRepository.create({
      name: dto.name,
      color: dto.color ?? '#10b981',
      userId,
    });
    return this.tagsRepository.save(tag);
  }

  async remove(id: string, userId: string): Promise<void> {
    const tag = await this.findOne(id, userId);
    await this.tagsRepository.remove(tag);
  }
}

