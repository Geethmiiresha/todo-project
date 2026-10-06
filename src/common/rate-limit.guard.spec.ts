import type { ExecutionContext } from '@nestjs/common';
import { RateLimitGuard } from './rate-limit.guard';
import { jest } from '@jest/globals';

describe('RateLimitGuard', () => {
  function context(path: string): ExecutionContext {
    const request = {
      ip: '127.0.0.1',
      route: { path },
    };
    return {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: () => request,
      }),
    } as unknown as ExecutionContext;
  }

  it('limits repeated login attempts by client and endpoint', () => {
    const guard = new RateLimitGuard();
    const loginContext = context('/login');

    for (let request = 0; request < 10; request += 1) {
      expect(guard.canActivate(loginContext)).toBe(true);
    }

    expect(() => guard.canActivate(loginContext)).toThrow(
      'Too many requests. Please try again later.',
    );
  });

  it('applies password-recovery limits independently from login', () => {
    const guard = new RateLimitGuard();
    const loginContext = context('/login');
    const forgotPasswordContext = context('/forgot-password');

    for (let request = 0; request < 5; request += 1) {
      expect(guard.canActivate(forgotPasswordContext)).toBe(true);
    }

    expect(guard.canActivate(loginContext)).toBe(true);
    expect(() => guard.canActivate(forgotPasswordContext)).toThrow();
  });
});
