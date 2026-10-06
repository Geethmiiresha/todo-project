import {
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { compare, hashSync } from 'bcryptjs';
import { Test, TestingModule } from '@nestjs/testing';
import { User, UserRole } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';
import { jest } from '@jest/globals';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: {
    findByEmail: jest.Mock;
    findByEmailWithPassword: jest.Mock;
    create: jest.Mock;
    update: jest.Mock;
  };
  let createdUser: User;
  const userBase = {
    id: 'user-1',
    name: 'Alex Todo',
    email: 'alex@example.com',
    role: UserRole.USER,
    isActive: true,
    password: '',
  };

  beforeEach(async () => {
    createdUser = { ...userBase } as User;
    usersService = {
      findByEmail: jest.fn().mockResolvedValue(null),
      findByEmailWithPassword: jest.fn(),
      create: jest.fn().mockImplementation(async (input) => {
        createdUser = { ...userBase, ...input } as User;
        return createdUser;
      }),
      update: jest.fn().mockResolvedValue(createdUser),
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        {
          provide: JwtService,
          useValue: { signAsync: jest.fn().mockResolvedValue('signed-token') },
        },
        {
          provide: ConfigService,
          useValue: { get: jest.fn().mockReturnValue('3600') },
        },
      ],
    }).compile();
    service = module.get<AuthService>(AuthService);
  });

  it('hashes passwords and always creates standard-user accounts', async () => {
    const result = await service.register({
      name: 'Alex Todo',
      email: 'alex@example.com',
      password: 'correct horse battery',
    });

    expect(createdUser.role).toBe(UserRole.USER);
    expect(createdUser.password).not.toBe('correct horse battery');
    await expect(compare('correct horse battery', createdUser.password)).resolves.toBe(
      true,
    );
    expect(result.user).not.toHaveProperty('password');
    expect(result).toHaveProperty('accessToken');
    expect(result).toHaveProperty('refreshToken');
  });

  it('rejects duplicate registrations', async () => {
    usersService.findByEmail.mockResolvedValue(createdUser);

    await expect(
      service.register({
        name: 'Alex Todo',
        email: 'alex@example.com',
        password: 'correct horse battery',
      }),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(usersService.create).not.toHaveBeenCalled();
  });

  it('rejects invalid login credentials without revealing which value failed', async () => {
    usersService.findByEmailWithPassword.mockResolvedValue(null);

    await expect(
      service.login({ email: 'alex@example.com', password: 'bad-password' }),
    ).rejects.toThrow(new UnauthorizedException('Invalid email or password'));
  });

  it('rejects an incorrect password for an existing user', async () => {
    usersService.findByEmailWithPassword.mockResolvedValue({
      ...createdUser,
      password: hashSync('different-password', 4),
    });

    await expect(
      service.login({ email: 'alex@example.com', password: 'incorrect' }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('rejects disabled accounts even when their password matches', async () => {
    const passwordHash = hashSync('irrelevant', 4);
    usersService.findByEmailWithPassword.mockResolvedValue({
      ...createdUser,
      password: passwordHash,
      isActive: false,
    });

    await expect(
      service.login({ email: 'alex@example.com', password: 'irrelevant' }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('stores only a hashed password reset token and never returns the token', async () => {
    usersService.findByEmail.mockResolvedValue(createdUser);

    const result = await service.forgotPassword({ email: createdUser.email });
    const savedFields = usersService.update.mock.calls[0][1] as {
      resetPasswordToken: string;
    };

    expect(savedFields.resetPasswordToken).toMatch(/^[a-f0-9]{64}$/);
    expect(result).not.toHaveProperty('resetToken');
    expect(result.message).toContain('If an account with that email exists');
  });
});
