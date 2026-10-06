import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare, hash } from 'bcryptjs';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import type { AuthResponse, UserProfile } from './auth-user.interface';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

const SALT_ROUNDS = 10;

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto): Promise<AuthResponse> {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('An account with this email already exists');
    }

    const passwordHash = await hash(dto.password, SALT_ROUNDS);
    const user = await this.usersService.create({
      name: dto.name,
      email: dto.email,
      password: passwordHash,
    });

    return this.buildAuthResponse(user);
  }

  async login(dto: LoginDto): Promise<AuthResponse> {
    const user = await this.usersService.findByEmailWithPassword(dto.email);
    const passwordMatches = user ? await compare(dto.password, user.password) : false;

    // email wradida password wradida kiyala pennanne na
    if (!user || !passwordMatches) {
      throw new UnauthorizedException('Invalid email or password');
    }

    return this.buildAuthResponse(user);
  }

  async getProfile(userId: string): Promise<UserProfile> {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new UnauthorizedException('User no longer exists');
    }
    return this.toProfile(user);
  }

  private async buildAuthResponse(user: User): Promise<AuthResponse> {
    const accessToken = await this.jwtService.signAsync({
      sub: user.id,
      email: user.email,
    });
    return { accessToken, user: this.toProfile(user) };
  }

  private toProfile(user: User): UserProfile {
    return { id: user.id, name: user.name, email: user.email };
  }
}